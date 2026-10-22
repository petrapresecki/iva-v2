# Iva Presečki

Portfolio for Iva Presečki, a graphic designer working across branding, packaging, motion and 3D. Live at [iva-presecki.pages.dev](https://iva-presecki.pages.dev/).

The portfolio is a keyring. Her four projects hang from one chrome ring as charms; pull one until the clip snaps and the project floods open in its own colours. The concept is in [concept/CONCEPT.md](concept/CONCEPT.md), with the 2D paper prototype it started from.

```sh
pnpm install
pnpm dev          # v3 at /v3, earlier versions at /
pnpm run deploy   # builds v3 alone at the root (VITE_V3_ROOT=1) and publishes to Cloudflare Pages
```

## How it works

- **Keyring** (`src/v3/Keyring3D.tsx`): a React Three Fiber scene. Charms hang from jump rings, sway with pointer speed and twist on their chains. Each charm sits on its own depth layer, so a turned charm never cuts into its neighbour. Phones get their own keyring layout.
- **Pull to open** (`src/v3/V3App.tsx`): pull a charm until it snaps and the project page floods open in the shape of that charm (`src/v3/shapes.ts`).
- **Pages** (`src/v3/pages.tsx`, `src/v3/content.ts`): project and about pages. Every word comes from Iva's previous site.
- **Routing** (`src/v3/base.ts`): v3 lives at `/v3` locally, next to the earlier versions; the deployed build serves only v3, from `/`.

React 19, TypeScript, three.js / React Three Fiber, GSAP, Lenis, Tailwind. Project images and videos in `public/` are Iva's work.
