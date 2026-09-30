// Every piece of copy from the original site lives here, so nothing gets lost

const currentlyAt = 'Studio Sudar'

export const site = {
  name: 'Iva Presečki',
  role: 'Graphic designer',
  location: 'Zagreb',
  email: 'presecki.iva@gmail.com',
  greeting: 'Hi! :)',
  currentlyAt,

  bio: [
    "My name is Iva, I'm a 24 year old Faculty of Graphic Arts graduate. During my studies, I explored a range of digital media practices, focusing on diverse tools, processes and practical approaches, with particular attention to how these forms can intersect, integrate and mutually enhance one another. I am motivated by continuous learning and the exploration of ways to integrate animation, 3D, and classic 2D practices into cohesive product presentations.",
    'I see design as a constantly evolving field shaped by new techniques and current trends. I believe it should balance innovation with timelessness, while staying clear and purposeful to communicate ideas in a direct and accessible way.',
  ],

  // Hero introduction and facts, all drawn from her bio and exhibitions
  intro: 'Graphic designer working across branding, packaging, motion and 3D.',
  hello: "My name is Iva, I'm a 24 year old Faculty of Graphic Arts graduate.",
  facts: [
    { label: 'Based in', value: 'Zagreb' },
    { label: 'Studied at', value: 'Faculty of Graphic Arts' },
    { label: 'Currently at', value: currentlyAt },
  ],

  // Short pull quotes taken from the bio for the home page
  statement: 'I see design as a constantly evolving field shaped by new techniques and current trends.',
  approach:
    'I am motivated by continuous learning and the exploration of ways to integrate animation, 3D, and classic 2D practices into cohesive product presentations.',

  exhibitions: ['Zagreb Design Week 2024', 'MM Centar Zagreb', 'Faculty of Graphic Arts exhibitions'],
}
