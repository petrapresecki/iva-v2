export interface Media {
  type: 'video' | 'image'
  src: string
  // CSS aspect-ratio, e.g. '16 / 9'
  ratio: string
  alt?: string
}

// A gallery row holds one full-width item or two side by side
export type GalleryRow = Media[]

export interface Project {
  id: string
  index: string
  title: string
  category: string
  year: number
  description: string[]
  tools: string[]
  hero: Media
  // Short selection shown on the home page
  snippets: Media[]
  // Stills used as textures in the 3D showcase
  cards: string[]
  // One strong image for the dotted reveal effect
  reveal: string
  gallery: GalleryRow[]
}

const video = (src: string, ratio: string): Media => ({ type: 'video', src, ratio })
const image = (src: string, ratio: string, alt: string): Media => ({ type: 'image', src, ratio, alt })

const cards = (id: string, count: number) =>
  Array.from({ length: count }, (_, i) => `/images/showcase/${id}-${i + 1}.jpg`)

export const projects: Project[] = [
  {
    id: 'rool',
    index: '01',
    title: 'Rool',
    category: 'Branding, visual identity',
    year: 2026,
    description: [
      'Rool is an event agency for electronic music, embodying the kinetic energy and pulsating rhythm of the scene through a bold, experimental visual language. Its logo, created with sharp edges and fluid contours, reflects the dynamic, unpredictable nature of sound, while the use of glow, metallic grays, dark reflective tones, and bright orange evoke club lights and laser shows.',
      "Dynamic animations translate rhythm into visual experience, and 3D-modeled metallic keychain and floating MP3 player reinforce the brand's connection to music culture.",
    ],
    tools: ['Blender', 'Adobe Illustrator', 'Adobe After Effects', 'Adobe Photoshop'],
    hero: video('/videos/rool/rool-reel.mp4', '16 / 9'),
    snippets: [
      video('/videos/rool.mp4', '16 / 9'),
      video('/videos/rool/rool-poster-anim.mp4', '608 / 1080'),
      video('/videos/rool/rool-mp3-tile.mp4', '858 / 1080'),
    ],
    cards: cards('rool', 8),
    reveal: '/images/rool/rool-composition.jpg',
    gallery: [
      [video('/videos/rool/rool-mp3-tile.mp4', '3 / 4'), video('/videos/rool/rool-carousel.mp4', '3 / 4')],
      [video('/videos/rool/rool-poster-klub.mp4', '3 / 4'), video('/videos/rool/rool-distortion.mp4', '3 / 4')],
      [video('/videos/rool/rool-tba-dirtyline.mp4', '16 / 9')],
      [video('/videos/rool/rool-story-mp3.mp4', '3 / 4'), video('/videos/rool/rool-parti-blur.mp4', '3 / 4')],
      [image('/images/rool/rool-composition.jpg', '4 / 3', 'Rool composition')],
      [video('/videos/rool/rool-sivo-anim.mp4', '3 / 4'), video('/videos/rool/rool-poster-anim.mp4', '3 / 4')],
    ],
  },
  {
    id: 'apuro',
    index: '02',
    title: 'Apuro',
    category: 'Branding, packaging, visual identity',
    year: 2025,
    description: [
      'Apuro is a refreshing craft cider made from organically grown apples from the Zagorje region. Its natural origins and bold character are embodied in a 3D-modeled bottle that follows an organic, fluid shape.',
      "The visual identity and branding highlight Apuro's regional roots. A hybrid creature illustration inspired by local animals; rooster, deer, and fox, paired with a dynamic logo, creates an expressive design that communicates its organic and contemporary qualities.",
      "The box, made from recycled cardboard, is 3D-modeled to follow the shape of the bottle, making it easy to carry and store. Animations were designed to visually express and reinforce the brand's natural and playful character.",
    ],
    tools: ['Blender', 'Adobe Illustrator', 'Adobe After Effects'],
    hero: video('/videos/apuro/apuro.mp4', '16 / 9'),
    snippets: [
      video('/videos/apuro/apuro.mp4', '16 / 9'),
      video('/videos/apuro/apuro-splash.mp4', '4 / 5'),
      video('/videos/apuro/apuro-typography.mp4', '1 / 1'),
    ],
    cards: cards('apuro', 8),
    reveal: '/images/apuro/apuro-bottles-dark.jpg',
    gallery: [
      [
        image('/images/apuro/apuro-bottles-hero.webp', '3 / 4', 'Apuro bottles with apples'),
        video('/videos/apuro/apuro-splash.mp4', '3 / 4'),
      ],
      [video('/videos/apuro/apuro-colors.mp4', '1 / 1'), video('/videos/apuro/apuro-typography.mp4', '1 / 1')],
      [image('/images/apuro/apuro-bottles-dark.jpg', '16 / 9', 'Apuro bottles in dark')],
      [
        image('/images/apuro/apuro-packaging-boxes.jpg', '1 / 1', 'Apuro packaging boxes'),
        image('/images/apuro/apuro-packaging-grass.jpg', '1 / 1', 'Apuro packaging on grass'),
      ],
      [video('/videos/apuro/apuro-packaging.mp4', '16 / 9')],
      [
        video('/videos/apuro/apuro-papple.mp4', '3 / 4'),
        image('/images/apuro/apuro-bottle-moody.jpg', '3 / 4', 'Apuro bottle moody'),
      ],
    ],
  },
  {
    id: 'booklet',
    index: '03',
    title: 'Booklet',
    category: 'Editorial design, cover design',
    year: 2025,
    description: [
      'The booklet is a 41-page exploration of upcycled fashion, reflecting its unpredictable, rule-breaking nature through a dynamic visual language. Each spread embraces a different aesthetic and expression, mirroring the way upcycled pieces combine diverse fabrics, patterns, materials, shapes, and textures.',
      'The design rejects repetitive consistency in favor of bold, unexpected compositions, just like the garments it celebrates. The tactile nature of the 3D modeled book enhances this experience: thick, embossed pages invite touch; sturdy metal rings provide weight and structure; and a fluid, curved plastic keychain reflects the textures of fabric, connecting the reader to the materials behind the work.',
    ],
    tools: ['Blender', 'Adobe Illustrator', 'Adobe Photoshop', 'Adobe InDesign'],
    hero: video('/videos/booklet/booklet-hero.mp4', '16 / 9'),
    snippets: [
      video('/videos/booklet/booklet-rotation.mp4', '16 / 9'),
      image('/images/booklet/booklet-spread-6.jpg', '13 / 10', 'Booklet spread'),
      image('/images/booklet/booklet-ocean.webp', '16 / 9', 'Booklet by the ocean'),
    ],
    cards: cards('booklet', 7),
    reveal: '/images/booklet/booklet-spread-6.jpg',
    gallery: [
      [image('/images/booklet/booklet-ocean.webp', '16 / 9', 'Booklet by the ocean')],
      ...[
        [1, 2],
        [3, 4],
        [5, 6],
      ].map(pair =>
        pair.map(n => image(`/images/booklet/booklet-spread-${n}.jpg`, '13 / 10', `Booklet spread ${n}`)),
      ),
      [video('/videos/booklet/booklet-rotation.mp4', '16 / 9')],
      ...[
        [7, 8],
        [9, 10],
        [11, 12],
      ].map(pair =>
        pair.map(n => image(`/images/booklet/booklet-spread-${n}.jpg`, '13 / 10', `Booklet spread ${n}`)),
      ),
    ],
  },
  {
    id: 'gabagool',
    index: '04',
    title: 'Gabagool',
    category: 'Branding, visual identity',
    year: 2026,
    description: [
      'Gabagool is an Italian-style sandwich shop that transforms the culture of cured meats into a playful, vibrant visual identity. The branding centers on soft, interactive blob-like and round forms inspired by the organic shapes of sliced ham, brought to life through subtle, fluid animations.',
      'A bold palette of reds and pinks references the natural tones of Italian deli meats. The geometric logotype complements the rounded forms, keeping the look balanced and cohesive.',
    ],
    tools: ['Adobe Illustrator', 'Adobe After Effects', 'Adobe Photoshop'],
    hero: video('/videos/gabagool.mp4', '16 / 9'),
    snippets: [
      video('/videos/gabagool.mp4', '16 / 9'),
      video('/videos/gabagool/gabagool-type-tiles.mp4', '1 / 1'),
      video('/videos/gabagool/gabagool-blobs-motion.mp4', '858 / 1080'),
    ],
    cards: cards('gabagool', 7),
    reveal: '/images/gabagool/gabagool-showcase.webp',
    gallery: [
      [
        video('/videos/gabagool/gabagool-rotacija-3d.mp4', '3 / 4'),
        video('/videos/gabagool/gabagool-sfera-meats.mp4', '3 / 4'),
      ],
      [
        video('/videos/gabagool/gabagool-balls-bouncing.mp4', '3 / 4'),
        video('/videos/gabagool/gabagool-kuponi.mp4', '3 / 4'),
      ],
      [
        video('/videos/gabagool/gabagool-cupons-carousel.mp4', '3 / 4'),
        image('/images/gabagool/gabagool-packaging.webp', '3 / 4', 'Gabagool packaging'),
      ],
      [image('/images/gabagool/gabagool-showcase.webp', '16 / 9', 'Gabagool showcase')],
      [
        video('/videos/gabagool/gabagool-blobs-motion.mp4', '3 / 4'),
        image('/images/gabagool/gabagool-bag.webp', '3 / 4', 'Gabagool bag'),
      ],
      [video('/videos/gabagool/gabagool-type-tiles.mp4', '1 / 1'), video('/videos/gabagool/gabagool-colors.mp4', '1 / 1')],
    ],
  },
]

export const getProject = (id?: string) => projects.find(p => p.id === id)
