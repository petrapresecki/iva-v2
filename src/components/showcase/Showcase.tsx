/* eslint-disable react-hooks/immutability -- three.js materials, uniforms and meshes are mutated every frame by design */
import { Suspense, useEffect, useMemo, useRef, useState } from 'react'
import { Canvas, useFrame, useLoader, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { gsap, prefersReducedMotion } from '@/lib/gsap'
import { getLenis } from '@/lib/lenis'
import { navigate } from '@/lib/router'
import { projects, type Project } from '@/data/projects'

const CARDS = projects.flatMap(project => project.cards.map(src => ({ src, project })))
// A spiral staircase of her work: upright cards facing outward on a vertical helix.
// The helix is periodic, so cards can flow up it forever and wrap back to the bottom.
const COUNT = 30
const PER_TURN = 9
const STEP = (Math.PI * 2) / PER_TURN
const RISE = 0.42
const RADIUS = 3.4
const CARD = 1.55
const LEAN = -0.16
const BASE_TILT_X = 0.12
const BG = '#0c0c0c'

const vertexShader = /* glsl */ `
  uniform float uTime;
  uniform float uBend;
  uniform float uPhase;
  uniform float uHover;
  varying vec2 vUv;
  varying float vDepth;

  void main() {
    vUv = uv;
    vec3 p = position;
    float xn = uv.x * 2.0 - 1.0;
    // Cards curl with spin velocity, and ripple gently at rest
    p.z -= (1.0 - xn * xn) * uBend;
    p.z += sin(uTime * 1.4 + uPhase + p.x * 3.0) * sin(uTime * 1.1 + uPhase + p.y * 3.0) * 0.04 * (1.0 - uHover);
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    vDepth = -mv.z;
    gl_Position = projectionMatrix * mv;
  }
`

const fragmentShader = /* glsl */ `
  uniform sampler2D uMap;
  uniform float uFade;
  uniform float uDim;
  uniform float uEdge;
  varying vec2 vUv;
  varying float vDepth;

  void main() {
    // Rounded corners
    vec2 p = (vUv - 0.5) * vec2(1.0, 1.3333);
    vec2 b = vec2(0.5, 0.6667) - 0.035;
    if (length(max(abs(p) - b, 0.0)) > 0.035) discard;

    vec3 color = texture2D(uMap, vUv).rgb;
    // Backs of the far cards would show the image mirrored, so render them as dark, muted shadows
    if (!gl_FrontFacing) color = mix(vec3(dot(color, vec3(0.299, 0.587, 0.114))), color, 0.3) * 0.28;
    // Cards on the far side of the spiral sink into the dark
    float fog = smoothstep(9.5, 15.5, vDepth);
    color = mix(color, vec3(0.004), fog * 0.78);
    color = mix(vec3(0.004), color, uFade * uDim * uEdge);
    gl_FragColor = vec4(color, 1.0);
    #include <colorspace_fragment>
  }
`

// Deterministic randomness so the layout is the same on every visit
function seeded(seed: number) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v))
const damp = THREE.MathUtils.damp

interface SwirlProps {
  fill: boolean
  highlight: React.RefObject<string | null>
  onHover: (project: Project | null) => void
}

function Swirl({ fill, highlight, onHover }: SwirlProps) {
  const textures = useLoader(
    THREE.TextureLoader,
    CARDS.map(card => card.src),
  )
  const { viewport, gl } = useThree()
  const group = useRef<THREE.Group>(null!)
  const meshes = useRef<THREE.Mesh[]>([])
  const motion = useRef({ flow: 0, vel: 0, timeScale: 1, hovered: -1, flying: -1, dragging: false, lastX: 0, moved: 0 })
  const reduced = useMemo(() => prefersReducedMotion(), [])

  const shared = useMemo(() => ({ uTime: { value: 0 }, uBend: { value: 0 } }), [])
  const geometry = useMemo(() => new THREE.PlaneGeometry(1, 4 / 3, 12, 8), [])

  const items = useMemo(() => {
    const rand = seeded(7)
    // Step through the cards so neighbours on the spiral come from different projects
    return Array.from({ length: COUNT }, (_, i) => ({
      card: CARDS[(i * 5) % CARDS.length],
      seq: i,
      push: 0,
      phase: rand() * Math.PI * 2,
    }))
  }, [])

  const materials = useMemo(
    () =>
      items.map(item => {
        const map = textures[CARDS.indexOf(item.card)]
        map.colorSpace = THREE.SRGBColorSpace
        map.anisotropy = 4
        return new THREE.ShaderMaterial({
          vertexShader,
          fragmentShader,
          // Cards on the far side face away, but should still show (dimmed) through the gaps
          side: THREE.DoubleSide,
          uniforms: {
            uMap: { value: map },
            uFade: { value: 1 },
            uDim: { value: 1 },
            uEdge: { value: 1 },
            uHover: { value: 0 },
            uPhase: { value: item.phase },
            uTime: shared.uTime,
            uBend: shared.uBend,
          },
        })
      }),
    [items, textures, shared],
  )

  // Drag to spin (horizontal), leaving vertical touch scrolling to the page
  useEffect(() => {
    const el = gl.domElement
    const m = motion.current
    const down = (e: PointerEvent) => {
      m.dragging = true
      m.lastX = e.clientX
      m.moved = 0
    }
    const move = (e: PointerEvent) => {
      if (!m.dragging) return
      const dx = e.clientX - m.lastX
      m.lastX = e.clientX
      m.moved += Math.abs(dx)
      m.vel = clamp(m.vel + dx * 0.012, -6, 6)
    }
    const up = () => (m.dragging = false)
    el.addEventListener('pointerdown', down)
    window.addEventListener('pointermove', move)
    window.addEventListener('pointerup', up)
    return () => {
      el.removeEventListener('pointerdown', down)
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerup', up)
    }
  }, [gl])

  const setHovered = (k: number) => {
    const m = motion.current
    if (m.flying >= 0) return
    m.hovered = k
    onHover(k >= 0 ? items[k].card.project : null)
    // The custom cursor switches to its hover hand over role="button"
    if (k >= 0) gl.domElement.setAttribute('role', 'button')
    else gl.domElement.removeAttribute('role')
  }

  const open = (k: number) => {
    const m = motion.current
    if (m.moved > 6 || m.flying >= 0) return
    const mesh = meshes.current[k]
    const project = items[k].card.project
    m.flying = k
    onHover(null)
    // Fly the card to the camera while the rest fade out, then open the project
    const tl = gsap.timeline({
      onComplete: () => {
        navigate(`/work/${project.id}`)
        gsap.delayedCall(0.9, () => {
          m.flying = -1
          m.hovered = -1
          mesh.rotation.set(0, 0, 0)
          materials.forEach(mat => (mat.uniforms.uFade.value = 1))
        })
      },
    })
    // Target a point straight in front of the camera, expressed in the tilted group's space,
    // and a rotation that cancels the group's tilt so the card faces the viewer
    const g = group.current
    const target = g.worldToLocal(new THREE.Vector3(0, 0, 7))
    const fromQ = mesh.quaternion.clone()
    const toQ = g.quaternion.clone().invert()
    // Card fills ~70% of the view height at 5 units from the camera (fov 40)
    const scale = (0.7 * 2 * 5 * Math.tan(THREE.MathUtils.degToRad(20))) / ((4 / 3) * g.scale.x)
    const progress = { t: 0 }
    tl.to(mesh.position, { x: target.x, y: target.y, z: target.z, duration: 0.7, ease: 'power3.inOut' }, 0)
      .to(progress, {
        t: 1,
        duration: 0.7,
        ease: 'power3.inOut',
        onUpdate: () => mesh.quaternion.slerpQuaternions(fromQ, toQ, progress.t),
      }, 0)
      .to(mesh.scale, { x: scale, y: scale, duration: 0.7, ease: 'power3.inOut' }, 0)
    materials.forEach((mat, i) => {
      if (i !== k) tl.to(mat.uniforms.uFade, { value: 0, duration: 0.5, ease: 'power2.out' }, 0)
    })
  }

  useFrame((state, delta) => {
    const dt = Math.min(delta, 1 / 30)
    const m = motion.current

    if (!reduced) {
      // Page scroll and dragging push the cards along the spiral (in cards per second)
      m.vel = clamp(m.vel + (getLenis()?.velocity ?? 0) * 0.0012, -6, 6)
      m.vel *= Math.pow(0.93, dt * 60)
      m.timeScale = damp(m.timeScale, m.hovered >= 0 || highlight.current ? 0.2 : 1, 4, dt)
      m.flow += (0.32 + m.vel) * dt * m.timeScale
      shared.uTime.value += dt * m.timeScale
    }
    // Cards hug the cylinder at rest and bend further with speed
    shared.uBend.value = damp(shared.uBend.value, clamp(-0.1 - m.vel * 0.05, -0.35, 0.2), 6, dt)

    // Lean the spiral a little and let the pointer tilt it, so you can look around
    group.current.rotation.x = damp(group.current.rotation.x, BASE_TILT_X - state.pointer.y * 0.12, 3, dt)
    group.current.rotation.y = damp(group.current.rotation.y, state.pointer.x * 0.25, 3, dt)
    group.current.rotation.z = LEAN

    meshes.current.forEach((mesh, k) => {
      const mat = materials[k]
      const item = items[k]
      const isHovered = k === m.hovered
      // Highlighting a project (from the index) dims every other card
      const lit = !highlight.current || item.card.project.id === highlight.current
      mat.uniforms.uHover.value = damp(mat.uniforms.uHover.value, isHovered ? 1 : 0, 8, dt)
      mat.uniforms.uDim.value = damp(mat.uniforms.uDim.value, lit ? 1 : 0.18, 6, dt)
      if (k === m.flying) return

      // Position along the (periodic) helix, flowing upward over time
      const t = (((item.seq + m.flow) % COUNT) + COUNT) % COUNT
      const a = t * STEP
      item.push = damp(item.push, isHovered ? 0.7 : 0, 8, dt)
      const r = RADIUS + item.push
      mesh.position.set(Math.sin(a) * r, (t - COUNT / 2) * RISE, Math.cos(a) * r)
      mesh.rotation.set(0, a, 0)
      // Fade out at both ends so the wrap from top to bottom is invisible
      mat.uniforms.uEdge.value = THREE.MathUtils.smoothstep(COUNT / 2 - Math.abs(t - COUNT / 2), 0, 3)
      const boost = isHovered ? 1.12 : highlight.current && lit ? 1.05 : 1
      const s = damp(mesh.scale.x, CARD * boost, 8, dt)
      mesh.scale.set(s, s, 1)
    })
  })

  // Fit the spiral's width (2 × radius + a card) into the container; in the full-screen
  // hero it sits right of centre so her name has room on the left
  const fit = Math.min(viewport.width / 9.2, 1.05)
  const offset = fill && viewport.width > viewport.height ? viewport.width * 0.14 : 0

  return (
    <group ref={group} scale={fit} position={[offset, 0, 0]}>
      {items.map((_, k) => (
        <mesh
          key={k}
          ref={el => {
            if (el) meshes.current[k] = el
          }}
          geometry={geometry}
          material={materials[k]}
          onPointerOver={e => {
            e.stopPropagation()
            setHovered(k)
          }}
          onPointerOut={() => {
            if (motion.current.hovered === k) setHovered(-1)
          }}
          onClick={e => {
            e.stopPropagation()
            open(k)
          }}
        />
      ))}
    </group>
  )
}

interface ShowcaseProps {
  // Full-screen hero crops the swirl slightly larger than its container
  fill?: boolean
  paused?: boolean
  className?: string
  hint?: boolean
  // Project id whose cards stay lit while the rest dim
  highlight?: string | null
}

export default function Showcase({
  fill = false,
  paused = false,
  className = '',
  hint = true,
  highlight = null,
}: ShowcaseProps) {
  const wrap = useRef<HTMLDivElement>(null)
  const label = useRef<HTMLDivElement>(null)
  const pill = useRef<HTMLDivElement>(null)
  const [hovered, setHovered] = useState<Project | null>(null)
  const [lastHovered, setLastHovered] = useState<Project | null>(null)
  const [visible, setVisible] = useState(true)
  const highlightRef = useRef<string | null>(highlight)

  useEffect(() => {
    highlightRef.current = highlight
  }, [highlight])

  // Only render while on screen
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting))
    observer.observe(wrap.current!)
    return () => observer.disconnect()
  }, [])

  // Label trails the pointer
  useEffect(() => {
    const el = wrap.current!
    const xTo = gsap.quickTo(label.current, 'x', { duration: 0.4, ease: 'power3' })
    const yTo = gsap.quickTo(label.current, 'y', { duration: 0.4, ease: 'power3' })
    const onMove = (e: PointerEvent) => {
      const rect = el.getBoundingClientRect()
      const x = e.clientX - rect.left
      xTo(x)
      yTo(e.clientY - rect.top)
      // Flip the label to the left of the cursor near the right edge
      if (pill.current) pill.current.style.translate = x > rect.width - 380 ? 'calc(-100% - 12px) 36px' : '48px 36px'
    }
    el.addEventListener('pointermove', onMove)
    return () => el.removeEventListener('pointermove', onMove)
  }, [])

  const onHover = (project: Project | null) => {
    setHovered(project)
    if (project) setLastHovered(project)
  }

  return (
    <div ref={wrap} className={`relative overflow-hidden bg-ink ${className}`}>
      <Canvas
        flat
        frameloop={visible && !paused ? 'always' : 'never'}
        dpr={[1, 1.75]}
        camera={{ fov: 40, position: [0, 0, 12] }}
        style={{ touchAction: 'pan-y' }}
      >
        <color attach="background" args={[BG]} />
        <Suspense fallback={null}>
          <Swirl fill={fill} highlight={highlightRef} onHover={onHover} />
        </Suspense>
      </Canvas>

      <div ref={label} className="pointer-events-none absolute top-0 left-0 z-10">
        <div
          ref={pill}
          style={{ translate: '48px 36px' }}
          className={`caption rounded-full bg-accent px-3 py-1.5 whitespace-nowrap text-ink transition-[opacity,scale] duration-300 ease-out-expo ${
            hovered ? 'scale-100 opacity-100' : 'scale-75 opacity-0'
          }`}
        >
          {lastHovered?.index} {lastHovered?.title} — {lastHovered?.category}
        </div>
      </div>

      {hint && (
        <p className="caption pointer-events-none absolute right-4 bottom-4 z-10 text-white/50 md:right-5 md:bottom-5">
          Drag to spin · Click a card
        </p>
      )}
    </div>
  )
}
