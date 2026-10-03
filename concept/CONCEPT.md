# Iva Presečki v3: Keyring

Route: `/v3` in iva-v2 (`/v3/work/:id`, `/v3/about`). Prototype: [prototype/index.html](prototype/index.html) (2D). The build is 3D.

## 1. Idea

**The portfolio is a keyring.** Each project hangs from one chrome ring as a charm. You pull a charm until the clip snaps, and it opens the project in that project's colours.

Her own work is full of hanging objects: Rool's metal keychain and MP3 player, the Booklet's metal rings and curved plastic keychain. Four projects is exactly a keyring's worth.

Principles:
1. **The work is an object you can hold.** Every project is a physical thing that has weight, swings and catches the light. Nothing is a flat thumbnail.
2. **Loud colour, one at a time.** The home page is Iva's green. Each project brings its own flood colour and takes it away again. The colours never mix on one screen.
3. **Punk, not polished.** Photocopy grain, sticker labels, chunky type, slightly-off rotations, things that slap and snap. Motion has impact rather than glide.
4. **The interface is labels.** All interface text is a small mono caption on black or white pills, like the tags on a keyring. The big type is only ever the project name.
5. **Copy is untouched.** Every word comes from iva-portfolio. Interface labels (numbers, "PULL IT OFF THE RING") are the only new text.

## 2. Visual system

| Role | Hex | Use |
|---|---|---|
| paper | `#05ff43` | Home background (Iva's green) |
| ink | `#0a0a0a` | Text, outlines, pills (paper/ink 14.8:1) |
| accent | `#ffffff` | Label pills and sticker borders; carries ink text |
| mist | `#efece4` | Photocopy paper, eyelets; carries ink text |
| muted | `#075a1d` | Quiet captions on the green (5.2:1) |

Project floods: Rool `#ff5a00`, Apuro `#2b2bff` (white ink), Booklet `#ff2e93`, Gabagool `#ff9ccf` (title in `#a3161c`). Chrome `#cfcfcf`.

Fonts (license, then stand-in):

| Role | Dinamo face | Stand-in | Notes |
|---|---|---|---|
| Display | ABC Gravity | Anybody | 900, width axis 50–150, animated |
| Round | ABC Maxi Round | Unbounded | 800–900; "Hi! :)", outlined marquee, charm labels |
| Mono | ABC Camera Mono | DM Mono | 400/500; all labels |

Type scale:

| Step | Size | Leading | Tracking | Face |
|---|---|---|---|---|
| display | `clamp(84px, 21vw, 360px)` | 0.78 | -0.03em | Anybody 900 |
| headline | `clamp(72px, 14vw, 220px)` | 0.9 | -0.04em | Unbounded 800 |
| title | `clamp(22px, 3vw, 44px)` | 1 | 0 | Anybody 800, 120% |
| lead | `clamp(18px, 1.7vw, 26px)` | 1.22 | -0.01em | Anybody 500, 88% |
| body | 11px mono caps | 1.35 | 0.05em | DM Mono |

Grid and shape:
- **Home:** no grid. The ring hangs from the centre of the top edge.
- **Project pages:** 12 columns, 20px gutter, 20px margin. Below 760px: one column, 14px margin.
- **Radius:** 0 for pills, 999px for tool pills.
- **Easing:** `expo.out`, `back.out(1.6–2.2)` for slaps.

Tokens: [theme.json](theme.json) (kit format, id `acrylic`).

## 3. Pages

**Home `/v3`**
1. **Keyring stage** (100svh, sticky behind the next section).
   - Content: a three.js canvas on the green. A chain from the top edge to a chrome ring, and four acrylic charms on chains of different lengths: Rool (spiky star), Apuro (round tag), Booklet (card), Gabagool (arch). Each has the project still on both faces and a printed name sticker.
   - Behind it, a giant outlined Unbounded marquee reads PROJECTS. Bottom-left hint pill. Bottom-right info pills.
   - Motion: the rope sways with pointer speed and charms twist on their chains. Hovering a charm calms the whole ring, floods the page in that project's colour, swaps the marquee to its name and prints `NN / 04 · category · year`.
   - Touch: tap pulls the charm for you, and drag works with a finger.
2. **Showreel**: her showcase animation (`hero.mp4`) full-bleed in a white taped frame. It scrolls up over the stage.
3. **Contact**: "Contact" + presecki.iva@gmail.com between two thick rules.

**Project `/v3/work/:id`** (a flood overlay over home, with its own scroll and shareable URL)
- Top labels, then the title at display size, stretching from 50% to 112% width as its letters slap up.
- Hero video in a taped white frame.
- Description and tool pills.
- The full gallery in the original row order (pairs and full-width rows), each frame slightly rotated.
- previous / next project. "← PORTFOLIO" (or Escape) closes it, and the charm drops back onto the ring.

**About `/v3/about`** (pink flood overlay)
- "Hi! :)", the E-MAIL pill, both bio paragraphs, EXIBITIONS right-aligned.

## 4. Motion language

- **Easings:** expo.out for floods and stretches. back.out for slaps. Elastic for snap shakes.
- **Hover:** the ring's damping goes from 0.965 to 0.88, the background crossfades over 0.5s, and the label prints at 18ms per character.
- **Scroll:** home scrolls normally (Lenis), and the showreel slides over the pinned stage. Overlays scroll on their own.
- **Page transition:** a circular colour flood from the charm's screen position (0.85s expo.out). Closing reverses it (0.6s expo.inOut).
- **Reduced motion:**
  - The rope is static (settled once, no wind or twist).
  - Floods cut instead of animating, labels appear whole, and nothing shakes.

## 5. Signature moment

1. Pointer down on a charm (raycast in R3F). The charm's end is pinned to the pointer, its chain softens to stiffness 0.55, and the ring is tugged 3% per frame toward the pointer.
2. When the pointer is further from the charm's rim point than the chain length plus 170px (120px on mobile), the clip snaps:
   - the charm's chain detaches from the ring and falls with a small throw and spin;
   - the stage shakes once (elastic);
   - the flood opens from the charm's screen position.
3. A click or tap without dragging tweens the pointer 260px down over 0.5s, so the same snap happens.
4. On close, the flood shrinks back and the charm drops in from 200px above its rim point.

Settled in the 2D prototype: G 0.9, damping 0.965 (0.88 hovered), 12 constraint passes. Charms tilt at 0.6× their chain angle. Chains are 3/7/4/8 links. Charms push apart sideways only.

## 6. Kit map

| Piece | Kind | Depth | What changes and why |
|---|---|---|---|
| `drag-collage` | block | principle | Grab-and-hold becomes grab-and-pull against a chain; release opens instead of placing |
| `pixel-cursor` | block | base | Her green pixel hand (copied with `pnpm kit add`) |
| `scramble-text` | block | reworked | Only the print head jitters, printed chars are final, green block caret |
| `marquee` | block | principle | Giant outlined name behind the ring |
| `lib-k95-hover` | pin | principle | Hover calms the whole scene so a busy moving thing becomes readable |
| `lib-an` | pin | principle | Physical "build your outfit" play, here as a keyring of her objects |
| `lib-gass-rows` | pin | principle | Loud flat colour bands, one colour per project |
| `lib-idea-variants` | pin | principle | Three punk prototypes were compared side by side before picking |
| theme | — | none | The paper is Iva's green, which no kit theme carries; new theme `acrylic` |
| grid | — | none | The ring hangs free; project pages use a plain 12 columns |

Left out, by Petra's call: the scan line (too minimal), the sticker bomb and the photocopier (saved in `creative-kit/iva-portfolio-prototypes/`).

## 7. New pieces

- 3D keyring: a verlet rope in world units, instanced chain links, a chrome torus ring, extruded acrylic charms with image faces and a canvas-texture name sticker, and a RoomEnvironment for reflections.
- Flood overlay with per-project pages, and the label printer.
- Photocopy grain overlay.

## 8. Content checklist

- All copy, images and video already exist (from iva-portfolio, in `public/`).
- Copy kept verbatim, including "EXIBITIONS" and "Faculty of Graphic Arts exibitions". Ask Iva whether to fix the spelling.
- Nice to have: transparent PNG cut-outs of the 3D objects (bottle, keychain, book, bag) as charm faces.
- Licences: ABC Gravity, ABC Maxi Round and ABC Camera Mono, before launch.

## 9. Build plan

1. `pnpm kit add pixel-cursor --to .` (done).
2. `src/Root.tsx` switches between the existing app and `src/v3/` by path.
3. Signature first: `Keyring3D.tsx` (physics, rendering, snap), then the flood and pages, then the showreel and contact.
4. Check with Playwright frames on desktop and mobile, then `pnpm build`.

Open questions:
- Should v3 appear in the existing variant switcher?
- Real cut-out renders for the charms?
