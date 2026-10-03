// Content for v3, copied verbatim from iva-portfolio (projects, detail pages, about, contact)

export type Media = { src: string; alt?: string }
export type Row = Media[] // one item = full width, two = side by side

export type Shape = 'star' | 'round' | 'card' | 'arch'

export interface V3Project {
  id: string
  n: string
  title: string
  category: string
  year: number
  /** Flood colour, text colour on it, and the title colour */
  bg: string
  ink: string
  titleInk: string
  /** The still printed on its keyring charm, and the charm's cut */
  charm: string
  shape: Shape
  hero: string
  desc: string[]
  tools: string[]
  gallery: Row[]
}

const v = (src: string): Media => ({ src })
const img = (src: string, alt: string): Media => ({ src, alt })

export const projects: V3Project[] = [
  {
    id: 'rool',
    n: '01',
    title: 'Rool',
    category: 'Branding, visual identity',
    year: 2026,
    bg: '#ff5a00',
    ink: '#0a0a0a',
    titleInk: '#0a0a0a',
    charm: '/images/showcase/rool-8.jpg',
    shape: 'star',
    hero: '/videos/rool/rool-reel.mp4',
    desc: [
      'Rool is an event agency for electronic music, embodying the kinetic energy and pulsating rhythm of the scene through a bold, experimental visual language. Its logo, created with sharp edges and fluid contours, reflects the dynamic, unpredictable nature of sound, while the use of glow, metallic grays, dark reflective tones, and bright orange evoke club lights and laser shows.',
      "Dynamic animations translate rhythm into visual experience, and 3D-modeled metallic keychain and floating MP3 player reinforce the brand's connection to music culture.",
    ],
    tools: ['Blender', 'Adobe Illustrator', 'Adobe After Effects', 'Adobe Photoshop'],
    gallery: [
      [v('/videos/rool/rool-mp3-tile.mp4'), v('/videos/rool/rool-carousel.mp4')],
      [v('/videos/rool/rool-poster-klub.mp4'), v('/videos/rool/rool-distortion.mp4')],
      [v('/videos/rool/rool-tba-dirtyline.mp4')],
      [v('/videos/rool/rool-story-mp3.mp4'), v('/videos/rool/rool-parti-blur.mp4')],
      [img('/images/rool/rool-composition.jpg', 'Rool composition')],
      [v('/videos/rool/rool-sivo-anim.mp4'), v('/videos/rool/rool-poster-anim.mp4')],
    ],
  },
  {
    id: 'apuro',
    n: '02',
    title: 'Apuro',
    category: 'Branding, packaging, visual identity',
    year: 2025,
    bg: '#2b2bff',
    ink: '#ffffff',
    titleInk: '#ffffff',
    charm: '/images/showcase/apuro-8.jpg',
    shape: 'round',
    hero: '/videos/apuro/apuro.mp4',
    desc: [
      'Apuro is a refreshing craft cider made from organically grown apples from the Zagorje region. Its natural origins and bold character are embodied in a 3D-modeled bottle that follows an organic, fluid shape.',
      "The visual identity and branding highlight Apuro's regional roots. A hybrid creature illustration inspired by local animals; rooster, deer, and fox, paired with a dynamic logo, creates an expressive design that communicates its organic and contemporary qualities.",
      "The box, made from recycled cardboard, is 3D-modeled to follow the shape of the bottle, making it easy to carry and store. Animations were designed to visually express and reinforce the brand's natural and playful character.",
    ],
    tools: ['Blender', 'Adobe Illustrator', 'Adobe After Effects'],
    gallery: [
      [img('/images/apuro/apuro-bottles-hero.webp', 'Apuro bottles with apples'), v('/videos/apuro/apuro-splash.mp4')],
      [v('/videos/apuro/apuro-colors.mp4'), v('/videos/apuro/apuro-typography.mp4')],
      [img('/images/apuro/apuro-bottles-dark.jpg', 'Apuro bottles in dark')],
      [img('/images/apuro/apuro-packaging-boxes.jpg', 'Apuro packaging boxes'), img('/images/apuro/apuro-packaging-grass.jpg', 'Apuro packaging on grass')],
      [v('/videos/apuro/apuro-packaging.mp4')],
      [v('/videos/apuro/apuro-papple.mp4'), img('/images/apuro/apuro-bottle-moody.jpg', 'Apuro bottle moody')],
    ],
  },
  {
    id: 'booklet',
    n: '03',
    title: 'Booklet',
    category: 'Editorial design, cover design',
    year: 2025,
    bg: '#ff2e93',
    ink: '#0a0a0a',
    titleInk: '#0a0a0a',
    charm: '/images/showcase/booklet-1.jpg',
    shape: 'card',
    hero: '/videos/booklet/booklet-hero.mp4',
    desc: [
      'The booklet is a 41-page exploration of upcycled fashion, reflecting its unpredictable, rule-breaking nature through a dynamic visual language. Each spread embraces a different aesthetic and expression, mirroring the way upcycled pieces combine diverse fabrics, patterns, materials, shapes, and textures.',
      'The design rejects repetitive consistency in favor of bold, unexpected compositions, just like the garments it celebrates. The tactile nature of the 3D modeled book enhances this experience: thick, embossed pages invite touch; sturdy metal rings provide weight and structure; and a fluid, curved plastic keychain reflects the textures of fabric, connecting the reader to the materials behind the work.',
    ],
    tools: ['Blender', 'Adobe Illustrator', 'Adobe Photoshop', 'Adobe InDesign'],
    gallery: [
      [img('/images/booklet/booklet-ocean.webp', 'Booklet 3D render')],
      [img('/images/booklet/booklet-spread-1.jpg', 'Booklet spread 1'), img('/images/booklet/booklet-spread-2.jpg', 'Booklet spread 2')],
      [img('/images/booklet/booklet-spread-3.jpg', 'Booklet spread 3'), img('/images/booklet/booklet-spread-4.jpg', 'Booklet spread 4')],
      [img('/images/booklet/booklet-spread-5.jpg', 'Booklet spread 5'), img('/images/booklet/booklet-spread-6.jpg', 'Booklet spread 6')],
      [v('/videos/booklet/booklet-rotation.mp4')],
      [img('/images/booklet/booklet-spread-7.jpg', 'Booklet spread 7'), img('/images/booklet/booklet-spread-8.jpg', 'Booklet spread 8')],
      [img('/images/booklet/booklet-spread-9.jpg', 'Booklet spread 9'), img('/images/booklet/booklet-spread-10.jpg', 'Booklet spread 10')],
      [img('/images/booklet/booklet-spread-11.jpg', 'Booklet spread 11'), img('/images/booklet/booklet-spread-12.jpg', 'Booklet spread 12')],
    ],
  },
  {
    id: 'gabagool',
    n: '04',
    title: 'Gabagool',
    category: 'Branding, visual identity',
    year: 2026,
    bg: '#ff9ccf',
    ink: '#0a0a0a',
    titleInk: '#a3161c',
    charm: '/images/showcase/gabagool-6.jpg',
    shape: 'arch',
    hero: '/videos/gabagool.mp4',
    desc: [
      'Gabagool is an Italian-style sandwich shop that transforms the culture of cured meats into a playful, vibrant visual identity. The branding centers on soft, interactive blob-like and round forms inspired by the organic shapes of sliced ham, brought to life through subtle, fluid animations.',
      'A bold palette of reds and pinks references the natural tones of Italian deli meats. The geometric logotype complements the rounded forms, keeping the look balanced and cohesive.',
    ],
    tools: ['Adobe Illustrator', 'Adobe After Effects', 'Adobe Photoshop'],
    gallery: [
      [v('/videos/gabagool/gabagool-rotacija-3d.mp4'), v('/videos/gabagool/gabagool-sfera-meats.mp4')],
      [v('/videos/gabagool/gabagool-balls-bouncing.mp4'), v('/videos/gabagool/gabagool-kuponi.mp4')],
      [v('/videos/gabagool/gabagool-cupons-carousel.mp4'), img('/images/gabagool/gabagool-packaging.webp', 'Gabagool packaging')],
      [img('/images/gabagool/gabagool-showcase.webp', 'Gabagool showcase')],
      [v('/videos/gabagool/gabagool-blobs-motion.mp4'), img('/images/gabagool/gabagool-bag.webp', 'Gabagool bag')],
      [v('/videos/gabagool/gabagool-type-tiles.mp4'), v('/videos/gabagool/gabagool-colors.mp4')],
    ],
  },
]

export const about = {
  hi: 'Hi! :)',
  bio: [
    "My name is Iva, I'm a 24 year old Faculty of Graphic Arts graduate. During my studies, I explored a range of digital media practices, focusing on diverse tools, processes and practical approaches, with particular attention to how these forms can intersect, integrate and mutually enhance one another. I am motivated by continuous learning and the exploration of ways to integrate animation, 3D, and classic 2D practices into cohesive product presentations.",
    'I see design as a constantly evolving field shaped by new techniques and current trends. I believe it should balance innovation with timelessness, while staying clear and purposeful to communicate ideas in a direct and accessible way.',
  ],
  exhibitionsTitle: 'EXIBITIONS',
  exhibitions: ['Zagreb Design Week 2024.', 'MM Centar Zagreb', 'Faculty of Graphic Arts exibitions'],
  email: 'presecki.iva@gmail.com',
}

export const ABOUT_BG = '#efece4'
export const HOME_BG = '#05ff43'

export const getProject = (id?: string) => projects.find(p => p.id === id)
