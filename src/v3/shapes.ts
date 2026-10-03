import type { Shape } from './content'

// The charm cuts from Keyring3D as flat outlines (unit size, centred, y down), so the flood
// can open in the shape you pulled off the ring without loading three.js

type Pt = [number, number]

function arc(cx: number, cy: number, r: number, from: number, to: number, n: number): Pt[] {
  return Array.from({ length: n + 1 }, (_, i) => {
    const a = from + ((to - from) * i) / n
    return [cx + Math.cos(a) * r, cy + Math.sin(a) * r]
  })
}

function outline(shape: Shape): Pt[] {
  if (shape === 'star') {
    const n = 18
    return Array.from({ length: n * 2 }, (_, i) => {
      const a = (i / (n * 2)) * Math.PI * 2 - Math.PI / 2
      const r = i % 2 ? 0.37 : 0.5
      return [Math.cos(a) * r, Math.sin(a) * r]
    })
  }
  if (shape === 'round') return arc(0, 0, 0.5, 0, Math.PI * 2, 64).slice(0, -1)
  if (shape === 'card') {
    const w = 0.4
    const h = 0.535
    const r = 0.07
    return [
      ...arc(w - r, -h + r, r, -Math.PI / 2, 0, 6),
      ...arc(w - r, h - r, r, 0, Math.PI / 2, 6),
      ...arc(-w + r, h - r, r, Math.PI / 2, Math.PI, 6),
      ...arc(-w + r, -h + r, r, Math.PI, Math.PI * 1.5, 6),
    ]
  }
  // arch: a half circle on top, square shoulders at the bottom
  const w = 0.41
  const h = 0.52
  const r = 0.06
  return [...arc(0, -h + w, w, Math.PI, Math.PI * 2, 32), ...arc(w - r, h - r, r, 0, Math.PI / 2, 6), ...arc(-w + r, h - r, r, Math.PI / 2, Math.PI, 6)]
}

// How close each edge comes to the centre: the shape always covers a circle this big
const INNER: Record<Shape, number> = { star: 0.37, round: 0.5, card: 0.4, arch: 0.41 }

const cache = new Map<Shape, { pts: Pt[]; inner: number }>()

function get(shape: Shape) {
  let s = cache.get(shape)
  if (!s) {
    s = { pts: outline(shape), inner: INNER[shape] }
    cache.set(shape, s)
  }
  return s
}

/** CSS clip-path of the shape centred at x, y and `size` pixels across */
export function shapeClip(shape: Shape, x: number, y: number, size: number) {
  const { pts } = get(shape)
  return `polygon(${pts.map(([px, py]) => `${(x + px * size).toFixed(1)}px ${(y + py * size).toFixed(1)}px`).join(', ')})`
}

/** The size at which the shape, centred at x, y, covers the whole window */
export function coverSize(shape: Shape, x: number, y: number) {
  const reach = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y))
  return reach / get(shape).inner
}
