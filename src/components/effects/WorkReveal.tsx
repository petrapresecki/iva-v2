import { useEffect, useRef } from 'react'
import { prefersReducedMotion } from '@/lib/gsap'

/**
 * Her work printed as 2px black-and-white dots (ordered dither). A small fluid
 * sim follows the pointer and its trail reveals the real image underneath,
 * with a green fringe. Slides dissolve dot by dot from one project to the next.
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
uniform sampler2D uDye; uniform sampler2D uFrom; uniform sampler2D uTo;
uniform vec2 uRes; uniform float uMix; uniform float uFromAspect; uniform float uToAspect;
uniform vec3 uInk; uniform vec3 uPaper; uniform vec3 uAccent;

float bayer2(vec2 a) { a = floor(a); return fract(dot(a, vec2(0.5, a.y * 0.75))); }
float bayer4(vec2 a) { return bayer2(0.5 * a) * 0.25 + bayer2(a); }
float bayer8(vec2 a) { return bayer4(0.5 * a) * 0.25 + bayer2(a); }

// object-fit: cover
vec2 cover(vec2 uv, float imageAspect) {
  float boxAspect = uRes.x / uRes.y;
  vec2 scale = boxAspect > imageAspect ? vec2(1.0, imageAspect / boxAspect) : vec2(boxAspect / imageAspect, 1.0);
  return (uv - 0.5) * scale + 0.5;
}

void main() {
  vec2 cell = floor(gl_FragCoord.xy / 2.0);
  vec2 uv = (cell * 2.0 + 1.0) / uRes;
  float threshold = bayer8(cell);

  // Dot-by-dot dissolve between projects
  vec3 image = threshold < uMix
    ? texture(uTo, cover(uv, uToAspect)).rgb
    : texture(uFrom, cover(uv, uFromAspect)).rgb;
  float lum = clamp(pow(dot(image, vec3(0.299, 0.587, 0.114)), 0.75) * 1.08, 0.0, 1.0);
  vec3 color = lum > threshold ? uPaper : uInk;

  // The pointer trail reveals the real image, edged in green
  float dye = texture(uDye, uv).r;
  if (threshold < dye * 1.8) color = image;
  else if (threshold < dye * 3.0) color = uAccent;
  o = vec4(color, 1.0);
}`

type Program = { program: WebGLProgram; uniforms: Record<string, WebGLUniformLocation | null> }
type Target = { tex: WebGLTexture; fbo: WebGLFramebuffer; w: number; h: number }

const rgb = (hex: string) => [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16) / 255)

interface WorkRevealProps {
  slides: string[]
  // Seconds each slide holds, including its dissolve
  interval?: number
  onSlide?: (index: number) => void
  className?: string
}

const DISSOLVE = 1.2

export default function WorkReveal({ slides, interval = 4.5, onSlide, className = '' }: WorkRevealProps) {
  const canvas = useRef<HTMLCanvasElement>(null)
  const onSlideRef = useRef(onSlide)

  useEffect(() => {
    onSlideRef.current = onSlide
  }, [onSlide])

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

    // Project images as textures (flipped so uv.y points up, like the sim)
    const images: { tex: WebGLTexture; aspect: number }[] = []
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true)
    slides.forEach((src, i) => {
      const img = new Image()
      img.onload = () => {
        const tex = gl.createTexture()!
        gl.bindTexture(gl.TEXTURE_2D, tex)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img)
        images[i] = { tex, aspect: img.width / img.height }
      }
      img.src = src
    })

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
    let shown = -1
    const cycling = !prefersReducedMotion()

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

      // Which slides are dissolving into each other right now
      const n = slides.length
      const clock = cycling ? time : 0
      const from = Math.floor(clock / interval) % n
      const to = (from + 1) % n
      const mix = Math.min(1, Math.max(0, (clock % interval) - (interval - DISSOLVE)) / DISSOLVE)
      const current = mix > 0.5 ? to : from
      if (current !== shown) {
        shown = current
        onSlideRef.current?.(current)
      }
      if (!images[from] || !images[to]) return

      gl.useProgram(display.program)
      gl.uniform2f(display.uniforms.uRes, el.width, el.height)
      gl.uniform1f(display.uniforms.uMix, mix)
      gl.uniform1f(display.uniforms.uFromAspect, images[from].aspect)
      gl.uniform1f(display.uniforms.uToAspect, images[to].aspect)
      gl.uniform1i(display.uniforms.uFrom, bindTexture(1, images[from].tex))
      gl.uniform1i(display.uniforms.uTo, bindTexture(2, images[to].tex))
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
  }, [slides, interval])

  return <canvas ref={canvas} aria-hidden className={`block [image-rendering:pixelated] ${className}`} />
}
