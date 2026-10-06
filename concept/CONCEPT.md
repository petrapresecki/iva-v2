# Iva Presečki v3: Keyring

Route: `/v3` in iva-v2 (`/v3/work/:id`, `/v3/about`). Prototype: [prototype/index.html](prototype/index.html) (2D). The build is 3D.

## 1. Idea

**The portfolio is a keyring.** Each project hangs from one chrome ring as a charm. You pull a charm until the clip snaps, and it opens the project in that project's colours.

Her own work is full of hanging objects: Rool's metal keychain and MP3 player, the Booklet's metal rings and curved plastic keychain. Four projects is exactly a keyring's worth.

Principles:
1. **The work is an object you can hold.** Every project is a physical thing that has weight, swings and catches the light. Nothing is a flat thumbnail.
2. **Only the work is loud.** The home page is still paper with a black-and-white interface, so the charms are the only colour on it. Each project brings its own flood colour when it opens and takes it away again.
3. **The object carries the attitude.** The charms are the punk part: chunky cut-outs, glossy acrylic, things that slap and snap. Everything around them stays quiet. Motion has impact rather than glide.
4. **The interface is labels.** All interface text is a small mono caption on black or white pills, like the tags on a keyring. The big type is only ever the project name.
5. **Copy is untouched.** Every word comes from iva-portfolio. Interface labels (numbers, "PULL IT OFF THE RING") are the only new text.

## 2. Visual system

| Role | Hex | Use |
|---|---|---|
| paper | `#f2f1ef` | Home background (warm paper) |
| ink | `#0a0a0a` | Text, outlines, pills (paper/ink 14.8:1) |
| accent | `#ffffff` | Label pills and sticker borders; carries ink text |

Project floods: Rool `#ff5a00`, Apuro `#2b2bff` (white ink), Booklet `#ff2e93`, Gabagool `#ff9ccf` (title in `#a3161c`). Chrome `#cfcfcf`.

Fonts (license, then stand-in):

| Role | Dinamo face | Stand-in | Notes |
|---|---|---|---|
| Sticker | ABC Diatype | Inter Tight | 500, sentence case; the charms' name stickers (hairline edge) |
| Mono | ABC Camera Mono | DM Mono | 400/500; labels, page titles, all page text |

Type scale:

| Step | Size | Leading | Tracking | Face |
|---|---|---|---|---|
| headline | `clamp(64px, 13vw, 220px)` | 0.92 | -0.06em | DM Mono 500 caps (page titles, "Hi! :)") |
| lead | `clamp(14px, 1.15vw, 17px)` | 1.55 | -0.01em | DM Mono 400 (descriptions, bio) |
| body | 11px caps | 1.35 | 0.05em | DM Mono (labels, pills) |

Grid and shape:
- **Home:** no grid. The ring hangs from the centre of the top edge.
- **Project pages:** 12 columns, 20px gutter, 20px margin. Below 760px: one column, 14px margin.
- **Radius:** 0 for pills, 999px for tool pills.
- **Easing:** `expo.out`, `back.out(1.6–2.2)` for slaps.

Tokens: [theme.json](theme.json) (kit format, id `acrylic`).

## 3. Pages

**Home `/v3`**
1. **Keyring stage** (100svh, sticky behind the next section).
   - Content: a three.js canvas on paper. A chain from the top edge to a chrome ring, and four acrylic charms on chains of different lengths: Rool (spiky star), Apuro (round tag), Booklet (card), Gabagool (arch). Each has the project still on both faces and a printed name sticker.
   - Nothing behind it: no grain, no marquee, no shadows on the paper. Bottom-left hint pill. Bottom-right info pills.
   - Motion: the rope sways with pointer speed and charms twist on their chains. Hovering a charm calms the whole ring and prints its name and `NN / 04 · category · year` in the corner pills; the page stays paper.
   - Touch: tap pulls the charm for you, and drag works with a finger.
2. **Contact**: bottom-right pill on the same screen, "Contact" + presecki.iva@gmail.com, printing in on load. Home is one screen and doesn't scroll.
   - Petra's call: the showreel (`hero.mp4`) from the iva-portfolio home is dropped, because it diluted the keyring.

**Project `/v3/work/:id`** (a flood overlay over home, with its own scroll and shareable URL)
- Inside pages speak the navbar's language: DM Mono caps, square boxes, 1.5px ink rules. They stay calmer than the punk home (Petra's call).
- Top labels as nav pills, then the title in big DM Mono, rising out of its line.
- Hero video in a thin ink frame.
- The description on a white bordered card, with tool pills.
- The full gallery in the original row order (pairs and full-width rows), straight, with thin ink frames.
- previous / next project. "← PORTFOLIO" (or Escape) closes it, and the charm drops back onto the ring.

**About `/v3/about`** (off-white flood overlay, same navbar language)
- "Hi! :)", the E-MAIL pill, both bio paragraphs, EXIBITIONS right-aligned.

## 4. Motion language

- **Easings:** expo.out for floods and stretches. back.out for slaps. Elastic for snap shakes.
- **Hover:** the ring's damping goes from 0.965 to 0.88 and the labels print at 18ms per character.
- **Scroll:** home is one screen. Overlays scroll on their own.
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
| `pixel-cursor` | block | base | Her pixel hand, redrawn white with its black outline (copied with `pnpm kit add`) |
| `scramble-text` | block | reworked | Only the print head jitters, printed chars are final, white block caret |
| `lib-k95-hover` | pin | principle | Hover calms the whole scene so a busy moving thing becomes readable |
| `lib-an` | pin | principle | Physical "build your outfit" play, here as a keyring of her objects |
| `lib-gass-rows` | pin | principle | Loud flat colour bands, one colour per project |
| `lib-idea-variants` | pin | principle | Three punk prototypes were compared side by side before picking |
| theme | — | none | Paper, ink and white labels; new theme `acrylic` |
| grid | — | none | The ring hangs free; project pages use a plain 12 columns |

Left out, by Petra's call: the scan line (too minimal), the sticker bomb and the photocopier (saved in `creative-kit/iva-portfolio-prototypes/`).

## 7. New pieces

- 3D keyring: a verlet rope in world units, instanced chain links, a chrome torus ring, extruded acrylic charms with image faces and a canvas-texture name sticker, and a RoomEnvironment for reflections.
- Flood overlay with per-project pages, and the label printer.

## 8. Content checklist

- All copy, images and video already exist (from iva-portfolio, in `public/`).
- Copy kept verbatim, including "EXIBITIONS" and "Faculty of Graphic Arts exibitions". Ask Iva whether to fix the spelling.
- Nice to have: transparent PNG cut-outs of the 3D objects (bottle, keychain, book, bag) as charm faces.
- Licences: ABC Diatype and ABC Camera Mono, before launch.

## 9. Build plan

1. `pnpm kit add pixel-cursor --to .` (done).
2. `src/Root.tsx` switches between the existing app and `src/v3/` by path.
3. Signature first: `Keyring3D.tsx` (physics, rendering, snap), then the flood and pages, then the showreel and contact.
4. Check with Playwright frames on desktop and mobile, then `pnpm build`.

Open questions:
- Should v3 appear in the existing variant switcher?
- Real cut-out renders for the charms?
