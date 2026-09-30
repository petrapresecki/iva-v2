import { useEffect, useRef } from 'react'
import { prefersReducedMotion } from '@/lib/gsap'

/**
 * Aspen-style background: drifting fbm noise dithered into 2px black/white
 * dots, with a small fluid sim that leaves a green trail behind the pointer.
 * Solid grid cells sit on top; transparent cells act as windows onto it.
 */

const VERT = `#version 300 es
in vec2 aPos;
out vec2 vUv;
void main() { vUv = aPos * 0.5 + 0.5; gl_Position = vec4(aPos, 0.0, 1.0); }`

const SPLAT = `#version 300 es
precision highp float;
in vec2 vUv; out vec4 o;
uniform sampler2D uTarget; uniform vec2 uPoint; uniform vec3 uValue; uniform float uRadius; uniform float uAspect;
void main() {
  vec2 p = vUv - uPoint; p.x *= uAspect;
  o = vec4(texture(uTarget, vUv).xyz + exp(-dot(p, p) / uRadius) * uValue, 1.0);
}`

const CURL = `#version 300 es
precision highp float;
in vec2 vUv; out vec4 o;
uniform sampler2D uVel; uniform vec2 uTexel;
void main() {
  float L = texture(uVel, vUv - vec2(uTexel.x, 0.0)).y;
  float R = texture(uVel, vUv + vec2(uTexel.x, 0.0)).y;
  float T = texture(uVel, vUv + vec2(0.0, uTexel.y)).x;
  float B = texture(uVel, vUv - vec2(0.0, uTexel.y)).x;
  o = vec4(0.5 * (R - L - T + B), 0.0, 0.0, 1.0);
}`

const VORTICITY = `#version 300 es
precision highp float;
in vec2 vUv; out vec4 o;
uniform sampler2D uVel; uniform sampler2D uCurl; uniform vec2 uTexel; uniform float uStrength; uniform float uDt;
void main() {
  float L = texture(uCurl, vUv - vec2(uTexel.x, 0.0)).x;
  float R = texture(uCurl, vUv + vec2(uTexel.x, 0.0)).x;
  float T = texture(uCurl, vUv + vec2(0.0, uTexel.y)).x;
  float B = texture(uCurl, vUv - vec2(0.0, uTexel.y)).x;
  float C = texture(uCurl, vUv).x;
  vec2 force = 0.5 * vec2(abs(T) - abs(B), abs(R) - abs(L));
  force /= length(force) + 0.0001;
  force *= uStrength * C;
  force.y *= -1.0;
  o = vec4(texture(uVel, vUv).xy + force * uDt, 0.0, 1.0);
}`

const ADVECT = `#version 300 es
precision highp float;
in vec2 vUv; out vec4 o;
uniform sampler2D uVel; uniform sampler2D uSource; uniform vec2 uTexel; uniform float uDt; uniform float uDissipation;
void main() {
  vec2 coord = vUv - uDt * texture(uVel, vUv).xy * uTexel;
  o = texture(uSource, coord) / (1.0 + uDissipation * uDt);
}`

const DISPLAY = `#version 300 es
precision highp float;
in vec2 vUv; out vec4 o;
uniform sampler2D uDye; uniform vec2 uRes; uniform float uTime;
uniform vec3 uInk; uniform vec3 uPaper; uniform vec3 uAccent;

vec2 hash(vec2 p) {
  p = vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)));
  return -1.0 + 2.0 * fract(sin(p) * 43758.5453);
}
float noise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(dot(hash(i), f), dot(hash(i + vec2(1, 0)), f - vec2(1, 0)), u.x),
             mix(dot(hash(i + vec2(0, 1)), f - vec2(0, 1)), dot(hash(i + vec2(1, 1)), f - vec2(1, 1)), u.x), u.y);
}
float fbm(vec2 p) {
  float v = 0.0, a = 0.5;
  for (int i = 0; i < 4; i++) { v += a * noise(p); p *= 2.0; a *= 0.5; }
  return v * 0.5 + 0.5;
}
float bayer2(vec2 a) { a = floor(a); return fract(dot(a, vec2(0.5, a.y * 0.75))); }
float bayer4(vec2 a) { return bayer2(0.5 * a) * 0.25 + bayer2(a); }
float bayer8(vec2 a) { return bayer4(0.5 * a) * 0.25 + bayer2(a); }

void main() {
  vec2 cell = floor(gl_FragCoord.xy / 2.0);
  vec2 uv = cell * 2.0 / uRes;
  vec2 q = uv * vec2(uRes.x / uRes.y, 1.0) * 3.0;
  float t = uTime * 0.03;
  float n = fbm(q + fbm(q + t) * 0.5 - t);
  n = pow(smoothstep(0.28, 0.72, n), 1.2);
  float shade = mix(0.533, 0.878, n);
  float threshold = bayer8(cell);
  vec3 color = step(0.93 - shade, threshold) > 0.5 ? uPaper : uInk;
  float dye = texture(uDye, uv).r;
  color = mix(color, uAccent, step(threshold, dye));
  o = vec4(color, 1.0);
}`

type Program = { program: WebGLProgram; uniforms: Record<string, WebGLUniformLocation | null> }
type Target = { tex: WebGLTexture; fbo: WebGLFramebuffer; w: number; h: number }

const rgb = (hex: string) => [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16) / 255)

export default function DitherTrail({ className = '' }: { className?: string }) {
  const canvas = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const el = canvas.current!
    const gl = el.getContext('webgl2', { antialias: false, alpha: false })
    if (!gl) return
    const canSimulate = !!gl.getExtension('EXT_color_buffer_float') && !prefersReducedMotion()

    const compile = (fragment: string): Program => {
      const program = gl.createProgram()!
      for (const [type, src] of [
        [gl.VERTEX_SHADER, VERT],
        [gl.FRAGMENT_SHADER, fragment],
      ] as const) {
        const shader = gl.createShader(type)!
        gl.shaderSource(shader, src)
        gl.compileShader(shader)
        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) console.error(gl.getShaderInfoLog(shader))
        gl.attachShader(program, shader)
      }
      gl.bindAttribLocation(program, 0, 'aPos')
      gl.linkProgram(program)
      const uniforms: Program['uniforms'] = {}
      const count = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS)
      for (let i = 0; i < count; i++) {
        const name = gl.getActiveUniform(program, i)!.name
        uniforms[name] = gl.getUniformLocation(program, name)
      }
      return { program, uniforms }
    }

    const splat = compile(SPLAT)
    const curl = compile(CURL)
    const vorticity = compile(VORTICITY)
    const advect = compile(ADVECT)
    const display = compile(DISPLAY)

    // Full-screen triangle
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer())
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW)
    gl.enableVertexAttribArray(0)
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0)

    const createTarget = (w: number, h: number): Target => {
      const tex = gl.createTexture()!
      gl.bindTexture(gl.TEXTURE_2D, tex)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA16F, w, h, 0, gl.RGBA, gl.HALF_FLOAT, null)
      const fbo = gl.createFramebuffer()!
      gl.bindFramebuffer(gl.FRAMEBUFFER, fbo)
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0)
      gl.clearColor(0, 0, 0, 1)
      gl.clear(gl.COLOR_BUFFER_BIT)
      return { tex, fbo, w, h }
    }
    const doubleTarget = (w: number, h: number) => {
      let read = createTarget(w, h)
      let write = createTarget(w, h)
      return {
        get read() {
          return read
        },
        get write() {
          return write
        },
        swap() {
          ;[read, write] = [write, read]
        },
      }
    }

    let velocity: ReturnType<typeof doubleTarget>
    let dye: ReturnType<typeof doubleTarget>
    let curlTarget: Target

    const resize = () => {
      el.width = el.clientWidth
      el.height = el.clientHeight
      const aspect = el.width / Math.max(1, el.height)
      const simH = 128
      const dyeH = 384
      velocity = doubleTarget(Math.round(simH * aspect), simH)
      dye = doubleTarget(Math.round(dyeH * aspect), dyeH)
      curlTarget = createTarget(Math.round(simH * aspect), simH)
    }
    resize()
    const resizeObserver = new ResizeObserver(resize)
    resizeObserver.observe(el)

    const bindTexture = (unit: number, tex: WebGLTexture) => {
      gl.activeTexture(gl.TEXTURE0 + unit)
      gl.bindTexture(gl.TEXTURE_2D, tex)
      return unit
    }
    const draw = (target: Target | null) => {
      gl.bindFramebuffer(gl.FRAMEBUFFER, target?.fbo ?? null)
      gl.viewport(0, 0, target?.w ?? el.width, target?.h ?? el.height)
      gl.drawArrays(gl.TRIANGLES, 0, 3)
    }

    // Pointer splats queued between frames
    const splats: { x: number; y: number; dx: number; dy: number }[] = []
    let last: { x: number; y: number } | null = null
    const onMove = (e: PointerEvent) => {
      if (e.pointerType === 'touch') return
      const rect = el.getBoundingClientRect()
      const x = (e.clientX - rect.left) / rect.width
      const y = 1 - (e.clientY - rect.top) / rect.height
      if (last && x >= -0.1 && x <= 1.1 && y >= -0.1 && y <= 1.1) splats.push({ x, y, dx: x - last.x, dy: y - last.y })
      last = { x, y }
    }
    window.addEventListener('pointermove', onMove)

    let visible = true
    const intersection = new IntersectionObserver(([entry]) => (visible = entry.isIntersecting))
    intersection.observe(el)

    const [ink, paper, accent] = ['#0c0c0c', '#ffffff', '#05ff43'].map(rgb)
    let raf = 0
    let prev = performance.now()
    let time = 0

    const frame = (now: number) => {
      raf = requestAnimationFrame(frame)
      const dt = Math.min((now - prev) / 1000, 1 / 30)
      prev = now
      if (!visible) return
      time += dt

      if (canSimulate) {
        const texel = [1 / velocity.read.w, 1 / velocity.read.h]
        const aspect = el.width / Math.max(1, el.height)

        for (const s of splats.splice(0)) {
          gl.useProgram(splat.program)
          gl.uniform1f(splat.uniforms.uAspect, aspect)
          gl.uniform2f(splat.uniforms.uPoint, s.x, s.y)
          gl.uniform1f(splat.uniforms.uRadius, (48 / el.height) ** 2)
          gl.uniform1i(splat.uniforms.uTarget, bindTexture(0, velocity.read.tex))
          gl.uniform3f(splat.uniforms.uValue, s.dx * 2200 * aspect, s.dy * 2200, 0)
          draw(velocity.write)
          velocity.swap()
          gl.uniform1i(splat.uniforms.uTarget, bindTexture(0, dye.read.tex))
          gl.uniform3f(splat.uniforms.uValue, 0.35, 0, 0)
          draw(dye.write)
          dye.swap()
        }

        gl.useProgram(curl.program)
        gl.uniform2f(curl.uniforms.uTexel, texel[0], texel[1])
        gl.uniform1i(curl.uniforms.uVel, bindTexture(0, velocity.read.tex))
        draw(curlTarget)

        gl.useProgram(vorticity.program)
        gl.uniform2f(vorticity.uniforms.uTexel, texel[0], texel[1])
        gl.uniform1f(vorticity.uniforms.uStrength, 22)
        gl.uniform1f(vorticity.uniforms.uDt, dt)
        gl.uniform1i(vorticity.uniforms.uVel, bindTexture(0, velocity.read.tex))
        gl.uniform1i(vorticity.uniforms.uCurl, bindTexture(1, curlTarget.tex))
        draw(velocity.write)
        velocity.swap()

        gl.useProgram(advect.program)
        gl.uniform2f(advect.uniforms.uTexel, texel[0], texel[1])
        gl.uniform1f(advect.uniforms.uDt, dt)
        gl.uniform1f(advect.uniforms.uDissipation, 1.8)
        gl.uniform1i(advect.uniforms.uVel, bindTexture(0, velocity.read.tex))
        gl.uniform1i(advect.uniforms.uSource, bindTexture(1, velocity.read.tex))
        draw(velocity.write)
        velocity.swap()

        gl.uniform1f(advect.uniforms.uDissipation, 3.2)
        gl.uniform1i(advect.uniforms.uVel, bindTexture(0, velocity.read.tex))
        gl.uniform1i(advect.uniforms.uSource, bindTexture(1, dye.read.tex))
        draw(dye.write)
        dye.swap()
      }

      gl.useProgram(display.program)
      gl.uniform2f(display.uniforms.uRes, el.width, el.height)
      gl.uniform1f(display.uniforms.uTime, prefersReducedMotion() ? 0 : time)
      gl.uniform3f(display.uniforms.uInk, ink[0], ink[1], ink[2])
      gl.uniform3f(display.uniforms.uPaper, paper[0], paper[1], paper[2])
      gl.uniform3f(display.uniforms.uAccent, accent[0], accent[1], accent[2])
      gl.uniform1i(display.uniforms.uDye, bindTexture(0, dye.read.tex))
      draw(null)
    }
    raf = requestAnimationFrame(frame)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('pointermove', onMove)
      resizeObserver.disconnect()
      intersection.disconnect()
    }
  }, [])

  return <canvas ref={canvas} aria-hidden className={`block [image-rendering:pixelated] ${className}`} />
}
