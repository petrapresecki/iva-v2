/* eslint-disable react-hooks/immutability -- the rope, meshes and materials are mutated every frame by design */
import { Suspense, useEffect, useMemo, useRef } from 'react'
import { Canvas, useFrame, useLoader, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js'
import { gsap, prefersReducedMotion } from '@/lib/gsap'
import { projects, type Shape, type V3Project } from './content'

export interface KeyringProps {
  /** Id of the charm that is off the ring because its project is open */
  detached?: string
  onHover: (project: V3Project | null) => void
  /** Fired when a charm's clip snaps; x/y is the charm's centre on screen */
  onSnap: (project: V3Project, x: number, y: number) => void
}

/** Iva's portfolio as a 3D keyring: four acrylic charms on a chrome ring, pulled off to open a project. */
export default function Keyring3D(props: KeyringProps) {
  return (
    <Canvas
      shadows
      className="v3-keyring__canvas"
      camera={{ position: [0, 0, 14], fov: 30 }}
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: true }}
    >
      <Environment />
      <ambientLight intensity={0.35} />
      {/* key light; on phones its soft shadows show which charm hangs in front of which */}
      <directionalLight
        position={[4, 6, 9]}
        intensity={1.6}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-bias={-0.0004}
        shadow-normalBias={0.02}
        shadow-camera-left={-10}
        shadow-camera-right={10}
        shadow-camera-top={8}
        shadow-camera-bottom={-8}
        shadow-camera-near={1}
        shadow-camera-far={30}
      />
      <directionalLight position={[-7, -3, 5]} intensity={0.6} />
      <Suspense fallback={null}>
        <Rig {...props} />
      </Suspense>
    </Canvas>
  )
}

/** Studio reflections for the chrome and the glossy acrylic */
function Environment() {
  const gl = useThree(s => s.gl)
  const scene = useThree(s => s.scene)
  useEffect(() => {
    const pmrem = new THREE.PMREMGenerator(gl)
    const env = pmrem.fromScene(new RoomEnvironment(), 0.04).texture
    scene.environment = env
    return () => {
      scene.environment = null
      env.dispose()
      pmrem.dispose()
    }
  }, [gl, scene])
  return null
}

// ---------------------------------------------------------------------------
// Physics: a verlet rope in screen pixels (y down), the values settled in the 2D prototype
// ---------------------------------------------------------------------------

type Pt = { x: number; y: number; px: number; py: number; pinned?: boolean }
const pt = (x: number, y: number, pinned = false): Pt => ({ x, y, px: x, py: y, pinned })

const ANGLES = [-82, -28, 28, 82].map(d => (d * Math.PI) / 180) // around the bottom of the ring, 0 = straight down
// Chain lengths: on desktop the charms fan out side by side; on phones they hang at staggered heights
const LINKS = [3, 7, 4, 8]
const LINKS_MOBILE = [3, 14, 7, 19]
// Front-to-back order. On phones the charms cascade, so the higher one hangs in front and no name sticker is hidden
const DEPTH = [0.2, -0.06, 0.12, 0.02]
const DEPTH_MOBILE = [0.45, 0.15, 0.3, 0]
const FACING = [0.28, -0.18, 0.12, -0.32] // and turn a little, so you read them as objects
const G = 0.9
const DAMP = 0.965
const DAMP_HOVER = 0.88
const RING_TILT = 0.45

interface Charm {
  p: V3Project
  chain: Pt[]
  angle: number
  free: boolean
  parked: boolean
  twist: number
  spin: number
}

function constrain(a: Pt, b: Pt, len: number, stiff = 1) {
  const dx = b.x - a.x
  const dy = b.y - a.y
  const d = Math.hypot(dx, dy) || 0.0001
  const diff = ((d - len) / d) * stiff
  if (a.pinned && b.pinned) return
  if (a.pinned) {
    b.x -= dx * diff
    b.y -= dy * diff
  } else if (b.pinned) {
    a.x += dx * diff
    a.y += dy * diff
  } else {
    a.x += dx * diff * 0.5
    a.y += dy * diff * 0.5
    b.x -= dx * diff * 0.5
    b.y -= dy * diff * 0.5
  }
}

// ---------------------------------------------------------------------------
// Charm geometry: an extruded acrylic slab, its printed faces and a name sticker
// ---------------------------------------------------------------------------

/** The cut of a charm, hanging from its eyelet at (0, 0) and extending downward */
function charmShape(shape: Shape, S: number) {
  const s = new THREE.Shape()
  if (shape === 'star') {
    const n = 18
    for (let i = 0; i < n * 2; i++) {
      const a = (i / (n * 2)) * Math.PI * 2 - Math.PI / 2
      const r = i % 2 ? S * 0.37 : S * 0.5
      const x = Math.cos(a) * r
      const y = -S / 2 - Math.sin(a) * r
      if (i) s.lineTo(x, y)
      else s.moveTo(x, y)
    }
    s.closePath()
    return { shape: s, h: S }
  }
  if (shape === 'round') {
    s.absarc(0, -S / 2, S / 2, 0, Math.PI * 2, false)
    return { shape: s, h: S }
  }
  if (shape === 'card') {
    const w = S * 0.8
    const h = S * 1.07
    const r = S * 0.07
    s.moveTo(-w / 2 + r, 0)
    s.lineTo(w / 2 - r, 0)
    s.quadraticCurveTo(w / 2, 0, w / 2, -r)
    s.lineTo(w / 2, -h + r)
    s.quadraticCurveTo(w / 2, -h, w / 2 - r, -h)
    s.lineTo(-w / 2 + r, -h)
    s.quadraticCurveTo(-w / 2, -h, -w / 2, -h + r)
    s.lineTo(-w / 2, -r)
    s.quadraticCurveTo(-w / 2, 0, -w / 2 + r, 0)
    return { shape: s, h }
  }
  // arch, like Gabagool's menu board
  const w = S * 0.82
  const h = S * 1.04
  const r = S * 0.06
  s.moveTo(-w / 2, -w / 2)
  s.absarc(0, -w / 2, w / 2, Math.PI, 0, true)
  s.lineTo(w / 2, -h + r)
  s.quadraticCurveTo(w / 2, -h, w / 2 - r, -h)
  s.lineTo(-w / 2 + r, -h)
  s.quadraticCurveTo(-w / 2, -h, -w / 2, -h + r)
  s.lineTo(-w / 2, -w / 2)
  return { shape: s, h }
}

/** Flat face inset into the slab, with UVs that cover the shape like object-fit: cover */
function faceGeometry(shape: THREE.Shape, image: { width: number; height: number }, back: boolean) {
  const g = new THREE.ShapeGeometry(shape, 48)
  g.computeBoundingBox()
  const b = g.boundingBox!
  const cx = (b.min.x + b.max.x) / 2
  const cy = (b.min.y + b.max.y) / 2
  g.translate(-cx, -cy, 0).scale(0.9, 0.9, 1).translate(cx, cy, 0)
  g.computeBoundingBox()
  const bb = g.boundingBox!
  const w = bb.max.x - bb.min.x
  const h = bb.max.y - bb.min.y
  const boxAspect = w / h
  const imgAspect = image.width / image.height
  const pos = g.attributes.position
  const uv = g.attributes.uv
  for (let i = 0; i < pos.count; i++) {
    let u = (pos.getX(i) - bb.min.x) / w
    let v = (pos.getY(i) - bb.min.y) / h
    if (boxAspect > imgAspect) v = 0.5 + (v - 0.5) * (imgAspect / boxAspect)
    else u = 0.5 + (u - 0.5) * (boxAspect / imgAspect)
    uv.setXY(i, back ? 1 - u : u, v)
  }
  uv.needsUpdate = true
  return g
}

/** White sticker with the project name in the round display face */
function labelTexture(title: string) {
  const canvas = document.createElement('canvas')
  canvas.width = 512
  canvas.height = 128
  const tex = new THREE.CanvasTexture(canvas)
  tex.colorSpace = THREE.SRGBColorSpace
  tex.anisotropy = 8
  const draw = () => {
    const ctx = canvas.getContext('2d')!
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, 512, 128)
    ctx.lineWidth = 12
    ctx.strokeStyle = '#0a0a0a'
    ctx.strokeRect(6, 6, 500, 116)
    ctx.fillStyle = '#0a0a0a'
    ctx.font = '800 62px Unbounded, "Arial Rounded MT Bold", sans-serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(title.toUpperCase(), 256, 68, 460)
    tex.needsUpdate = true
  }
  draw()
  document.fonts?.load('800 62px Unbounded').then(draw).catch(() => {})
  return tex
}

// ---------------------------------------------------------------------------

function Rig({ detached, onHover, onSnap }: KeyringProps) {
  const size = useThree(s => s.size)
  const viewport = useThree(s => s.viewport)
  const gl = useThree(s => s.gl)
  const reduced = useMemo(() => prefersReducedMotion(), [])
  const mobile = size.width < 760
  const W = size.width
  const H = size.height
  const k = viewport.height / H // world units per css pixel

  const textures = useLoader(THREE.TextureLoader, projects.map(p => p.charm))
  textures.forEach(t => {
    t.colorSpace = THREE.SRGBColorSpace
    t.anisotropy = 8
  })

  // Sizes in px, as in the prototype
  const S = mobile ? Math.min(150, W * 0.36) : Math.min(210, W * 0.14, H * 0.24)
  const SEG = S * 0.085
  const CSEG = S * 0.075
  const RING = S * 0.25

  // ---- the rope ----
  const rope = useMemo(() => {
    const anchor = pt(W / 2, -10, true)
    const main = [anchor]
    const nMain = Math.max(6, Math.round((H * (mobile ? 0.3 : 0.32)) / SEG))
    for (let i = 1; i <= nMain; i++) main.push(pt(W / 2 + i * 2, -10 + i * SEG))
    const ringC = main[main.length - 1]
    const charms: Charm[] = projects.map((p, i) => {
      const chain = [pt(ringC.x, ringC.y, true)]
      for (let j = 1; j <= (mobile ? LINKS_MOBILE : LINKS)[i]; j++) chain.push(pt(ringC.x, ringC.y + j * CSEG))
      return { p, chain, angle: ANGLES[i] * (mobile ? 0.6 : 1), free: false, parked: false, twist: FACING[i], spin: 0 }
    })
    return { anchor, main, ringC, charms, ringAngle: 0, damp: DAMP, ptr: { x: -9999, y: -9999, vx: 0, vy: 0 }, dragging: null as Charm | null, hovered: null as Charm | null, downAt: { x: 0, y: 0 } }
  }, [W, H, SEG, CSEG, mobile])

  const rimPoint = (c: Charm) => {
    const a = c.angle + rope.ringAngle
    return { x: rope.ringC.x + Math.sin(a) * RING * Math.cos(RING_TILT), y: rope.ringC.y + Math.cos(a) * RING }
  }

  const integrate = (p: Pt) => {
    if (p.pinned) return
    const vx = (p.x - p.px) * rope.damp
    const vy = (p.y - p.py) * rope.damp
    p.px = p.x
    p.py = p.y
    p.x += vx
    p.y += vy + G
  }

  const step = () => {
    const { main, ringC, charms, ptr } = rope
    main.forEach(integrate)
    charms.forEach(c => !c.parked && c.chain.forEach(integrate))

    // the pointer pushes the rope as it passes
    if (!reduced) {
      const all = [...main, ...charms.filter(c => !c.free).flatMap(c => c.chain)]
      const vx = gsap.utils.clamp(-25, 25, ptr.vx)
      const vy = gsap.utils.clamp(-25, 25, ptr.vy)
      for (const p of all) {
        const d = Math.hypot(p.x - ptr.x, p.y - ptr.y)
        if (d < 150 && !p.pinned) {
          const f = (1 - d / 150) * 0.05
          p.px -= vx * f
          p.py -= vy * f
        }
      }
    }
    ptr.vx *= 0.6
    ptr.vy *= 0.6

    const drag = rope.dragging
    if (drag) {
      const end = drag.chain[drag.chain.length - 1]
      end.x += (ptr.x - end.x) * 0.5
      end.y += (ptr.y - end.y) * 0.5
      ringC.x += (ptr.x - ringC.x) * 0.03
      ringC.y += (ptr.y - ringC.y) * 0.03
    }

    for (let it = 0; it < 12; it++) {
      for (let i = 1; i < main.length; i++) constrain(main[i - 1], main[i], SEG)
      const last = main[main.length - 2]
      const target = gsap.utils.clamp(-0.7, 0.7, -Math.atan2(ringC.x - last.x, ringC.y - last.y))
      rope.ringAngle += (target - rope.ringAngle) * 0.15
      for (const c of charms) {
        if (c.parked) continue
        if (!c.free) {
          const r = rimPoint(c)
          const first = c.chain[0]
          first.x = first.px = r.x
          first.y = first.py = r.y
        }
        for (let i = 1; i < c.chain.length; i++) constrain(c.chain[i - 1], c.chain[i], CSEG, drag === c ? 0.55 : 1)
      }
    }

    // charms push each other aside instead of clumping
    for (let a = 0; a < charms.length; a++) {
      for (let b = a + 1; b < charms.length; b++) {
        if (charms[a].free || charms[b].free) continue
        const A = charms[a].chain[charms[a].chain.length - 1]
        const B = charms[b].chain[charms[b].chain.length - 1]
        const dx = B.x - A.x
        const d = Math.hypot(dx, B.y - A.y) || 1
        const min = S * (mobile ? 0.62 : 0.9)
        // on phones only charms hanging side by side push apart, so the staggered ones cascade like a bunch of keys
        if (d < min && (!mobile || Math.abs(B.y - A.y) < S * 0.45)) {
          const push = (min - d) * 0.07 * Math.sign(dx || 1)
          if (drag !== charms[a]) A.x -= push
          if (drag !== charms[b]) B.x += push
        }
      }
    }

    // each charm twists on its jump ring: a spring back to its resting turn, kicked by sideways motion
    for (let i = 0; i < charms.length; i++) {
      const c = charms[i]
      const end = c.chain[c.chain.length - 1]
      const vx = end.x - end.px
      const calm = rope.hovered === c ? 0.16 : 0.035
      c.spin += (FACING[i] - c.twist) * 0.012 - c.spin * calm + (reduced ? 0 : vx * 0.0045)
      if (c.free) c.spin += 0.004
      c.twist += c.spin
      if (c.free && end.y > H + S * 3) c.parked = true
    }

    // pulled too far from the ring? the clip snaps
    if (drag) {
      const r = rimPoint(drag)
      if (Math.hypot(ptr.x - r.x, ptr.y - r.y) > CSEG * drag.chain.length + (mobile ? 120 : 170)) snap(drag)
    }
  }

  // ---- interaction ----
  const toLocal = (e: PointerEvent | MouseEvent) => {
    const r = gl.domElement.getBoundingClientRect()
    return { x: e.clientX - r.left, y: e.clientY - r.top }
  }

  const hover = (c: Charm | null) => {
    rope.hovered = c
    rope.damp = c ? DAMP_HOVER : DAMP // hovering calms the whole ring
    if (c) gl.domElement.setAttribute('data-charm', '')
    else gl.domElement.removeAttribute('data-charm')
    onHover(c?.p ?? null)
  }

  const snap = (c: Charm) => {
    rope.dragging = null
    c.free = true
    const end = c.chain[c.chain.length - 1]
    c.chain.forEach(p => {
      p.py = p.y - 6
      p.px = p.x - gsap.utils.random(-6, 6)
    })
    c.spin += 0.12
    rope.damp = DAMP
    const r = gl.domElement.getBoundingClientRect()
    onSnap(c.p, r.left + end.x, r.top + end.y + charmShape(c.p.shape, S).h / 2)
    hover(null)
  }

  const autoPull = (c: Charm) => {
    const end = c.chain[c.chain.length - 1]
    const from = { x: end.x, y: end.y }
    rope.dragging = c
    const s = { t: 0 }
    gsap.to(s, {
      t: 1,
      duration: reduced ? 0.01 : 0.5,
      ease: 'power2.in',
      onUpdate: () => {
        rope.ptr.x = from.x + gsap.utils.random(-2, 2)
        rope.ptr.y = from.y + s.t * 300
      },
    })
  }

  useEffect(() => {
    const move = (e: PointerEvent) => {
      const { x, y } = toLocal(e)
      const ptr = rope.ptr
      if (ptr.x > -9999) {
        ptr.vx = x - ptr.x
        ptr.vy = y - ptr.y
      }
      ptr.x = x
      ptr.y = y
    }
    const up = () => {
      const c = rope.dragging
      if (!c) return
      const moved = Math.hypot(rope.ptr.x - rope.downAt.x, rope.ptr.y - rope.downAt.y)
      rope.dragging = null
      if (moved < 6) autoPull(c) // a click or tap pulls it for you
    }
    const cancel = () => {
      rope.dragging = null
    }
    window.addEventListener('pointermove', move)
    window.addEventListener('pointerup', up)
    window.addEventListener('pointercancel', cancel)
    return () => {
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerup', up)
      window.removeEventListener('pointercancel', cancel)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rope])

  // The open project's charm is off the ring; when it closes, the charm drops back on
  useEffect(() => {
    for (const c of rope.charms) {
      if (c.p.id === detached && !c.free) {
        c.free = true
        c.parked = true
      } else if (c.p.id !== detached && c.free) {
        const r = rimPoint(c)
        c.chain.forEach((p, i) => {
          p.x = p.px = r.x + gsap.utils.random(-4, 4)
          p.y = p.py = r.y - 220 + i * CSEG
        })
        c.free = false
        c.parked = false
        c.spin = 0.15
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [detached, rope])

  // Settle before the first frame, then drop the whole thing in from above
  useMemo(() => {
    for (let i = 0; i < 240; i++) step()
    if (!reduced) {
      ;[...rope.main.slice(1), ...rope.charms.flatMap(c => c.chain)].forEach(p => {
        p.y -= H * 0.35
        p.py = p.y
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rope])

  // ---- meshes ----
  const chrome = useMemo(() => new THREE.MeshStandardMaterial({ color: '#dcdcdc', metalness: 1, roughness: 0.16 }), [])
  const acrylic = useMemo(() => new THREE.MeshPhysicalMaterial({ color: '#0d0d0d', roughness: 0.22, metalness: 0.05, clearcoat: 1, clearcoatRoughness: 0.08 }), [])
  const MAX_LINKS = 600
  const linkGeo = useMemo(() => new THREE.TorusGeometry(1, 0.34, 8, 18), [])
  const links = useRef<THREE.InstancedMesh>(null)
  const ring = useRef<THREE.Mesh>(null)
  const groups = useRef<(THREE.Group | null)[]>([])

  const charmParts = useMemo(() => {
    const s = S * k
    return projects.map((p, i) => {
      const { shape, h } = charmShape(p.shape, s)
      const depth = s * 0.07
      const bevel = s * 0.014
      const body = new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: true, bevelThickness: bevel, bevelSize: bevel, bevelSegments: 4, curveSegments: 48 })
      body.translate(0, 0, -depth / 2)
      const image = textures[i].image as { width: number; height: number }
      const front = faceGeometry(shape, image, false)
      const back = faceGeometry(shape, image, true)
      const face = new THREE.MeshPhysicalMaterial({ map: textures[i], roughness: 0.3, clearcoat: 1, clearcoatRoughness: 0.06 })
      const label = new THREE.MeshBasicMaterial({ map: labelTexture(p.title), toneMapped: false })
      return { s, h, z: depth / 2 + bevel + 0.004, body, front, back, face, label }
    })
  }, [S, k, textures])

  const m4 = useMemo(() => new THREE.Matrix4(), [])
  const q = useMemo(() => new THREE.Quaternion(), [])
  const qz = useMemo(() => new THREE.Quaternion(), [])
  const qy = useMemo(() => new THREE.Quaternion(), [])
  const Z = useMemo(() => new THREE.Vector3(0, 0, 1), [])
  const Y = useMemo(() => new THREE.Vector3(0, 1, 0), [])
  const pos = useMemo(() => new THREE.Vector3(), [])
  const scl = useMemo(() => new THREE.Vector3(), [])

  const wx = (x: number) => (x - W / 2) * k
  const wy = (y: number) => -(y - H / 2) * k

  useFrame((_, dt) => {
    const steps = reduced && !rope.dragging ? 0 : Math.min(3, Math.max(1, Math.round(dt * 60)))
    for (let i = 0; i < steps; i++) step()

    // chain links along every segment, alternating flat and edge-on
    const mesh = links.current
    if (mesh) {
      let n = 0
      const linkLen = S * 0.05
      const place = (pts: Pt[]) => {
        for (let i = 1; i < pts.length; i++) {
          const a = pts[i - 1]
          const b = pts[i]
          const len = Math.hypot(b.x - a.x, b.y - a.y)
          const count = Math.max(1, Math.round(len / linkLen))
          const ang = Math.atan2(-(b.y - a.y), b.x - a.x) - Math.PI / 2
          for (let j = 0; j < count && n < MAX_LINKS; j++) {
            const t = (j + 0.5) / count
            pos.set(wx(a.x + (b.x - a.x) * t), wy(a.y + (b.y - a.y) * t), 0)
            qz.setFromAxisAngle(Z, ang)
            qy.setFromAxisAngle(Y, (i * 7 + j) % 2 ? Math.PI / 2 : 0)
            q.copy(qz).multiply(qy)
            const r = linkLen * 0.62 * k
            scl.set(r, r * 1.45, r)
            mesh.setMatrixAt(n++, m4.compose(pos, q, scl))
          }
        }
      }
      place(rope.main)
      rope.charms.forEach(c => !c.parked && place(c.chain))
      mesh.count = n
      mesh.instanceMatrix.needsUpdate = true
    }

    if (ring.current) {
      ring.current.position.set(wx(rope.ringC.x), wy(rope.ringC.y), 0)
      ring.current.rotation.set(0, RING_TILT + gsap.utils.clamp(-0.5, 0.5, (rope.ringC.x - rope.ringC.px) * 0.04), -rope.ringAngle)
    }

    rope.charms.forEach((c, i) => {
      const g = groups.current[i]
      if (!g) return
      g.visible = !c.parked
      const end = c.chain[c.chain.length - 1]
      const prev = c.chain[c.chain.length - 2]
      const tilt = Math.atan2(end.x - prev.x, end.y - prev.y) * 0.6 // tilt with the chain, but stay heavy-bottomed
      g.position.set(wx(end.x), wy(end.y), (mobile ? DEPTH_MOBILE : DEPTH)[i] * charmParts[i].s)
      g.rotation.set(0, c.twist, tilt)
      const lift = rope.dragging === c ? 1.06 : 1
      g.scale.setScalar(THREE.MathUtils.lerp(g.scale.x, lift, 0.2))
    })
  })

  return (
    <>
      <instancedMesh ref={links} args={[linkGeo, chrome, MAX_LINKS]} frustumCulled={false} />
      <mesh ref={ring} material={chrome}>
        <torusGeometry args={[RING * k, RING * k * 0.15, 24, 72]} />
      </mesh>
      {projects.map((p, i) => {
        const part = charmParts[i]
        const { s, h, z } = part
        return (
          <group
            key={p.id}
            ref={el => {
              groups.current[i] = el
            }}
            onPointerOver={e => {
              e.stopPropagation()
              if (!rope.dragging) hover(rope.charms[i])
            }}
            onPointerOut={() => {
              if (!rope.dragging && rope.hovered === rope.charms[i]) hover(null)
            }}
            onPointerDown={e => {
              e.stopPropagation()
              const c = rope.charms[i]
              if (c.free) return
              const { x, y } = toLocal(e.nativeEvent)
              rope.ptr.x = x
              rope.ptr.y = y
              rope.downAt = { x, y }
              rope.dragging = c
              hover(c)
            }}
          >
            {/* jump ring through the eyelet */}
            <mesh material={chrome} position={[0, s * 0.03, 0]} rotation={[0, Math.PI / 2, 0]}>
              <torusGeometry args={[s * 0.065, s * 0.016, 12, 32]} />
            </mesh>
            {/* shadows only on phones, where the cascading charms need them to read as layers */}
            <mesh geometry={part.body} material={acrylic} castShadow={mobile} receiveShadow={mobile} />
            <mesh geometry={part.front} material={part.face} position={[0, 0, z]} receiveShadow={mobile} />
            <mesh geometry={part.back} material={part.face} position={[0, 0, -z]} rotation={[0, Math.PI, 0]} receiveShadow={mobile} />
            {/* chrome grommet around the hole */}
            <mesh material={chrome} position={[0, -s * 0.085, 0]}>
              <torusGeometry args={[s * 0.045, s * 0.014, 12, 32]} />
            </mesh>
            {/* name stickers, front and back */}
            <mesh material={part.label} position={[s * 0.04, -h + s * 0.09, z + 0.004]} rotation={[0, 0, -0.07]}>
              <planeGeometry args={[s * 0.62, s * 0.155]} />
            </mesh>
            <mesh material={part.label} position={[-s * 0.04, -h + s * 0.09, -z - 0.004]} rotation={[0, Math.PI, 0.07]}>
              <planeGeometry args={[s * 0.62, s * 0.155]} />
            </mesh>
          </group>
        )
      })}
    </>
  )
}
