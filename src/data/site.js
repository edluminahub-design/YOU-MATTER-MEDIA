/**
 * Site content.
 *
 * Every string here is taken from the You Matter Media portfolio deck. Nothing
 * is invented: there are no fabricated metrics, awards, testimonials or team
 * members, because the deck contains none. Where the site needed connective
 * wording the deck did not supply (button labels, section headings), it is
 * plain functional UI copy, never a claim about the business.
 */

export const CONTACT = {
  name: 'You Matter Media',
  phone: '+91-90304 04445',
  primaryPhone: '+91-87124 43605',
  email: 'enquiry@youmattermedia.in',
  site: 'youmattermedia.in',
}

/**
 * Social profiles for the fixed rail on the right of every page.
 *
 * An icon appears only once its `url` is filled in — none of these accounts
 * are listed in the portfolio, and a link to a guessed profile would send
 * visitors somewhere that isn't the studio. Paste each full profile URL
 * (e.g. 'https://www.instagram.com/yourhandle') to switch that icon on.
 *
 * WhatsApp opens a chat with the studio's own number, via wa.me.
 */
export const SOCIAL = [
  { key: 'facebook', label: 'Facebook', url: 'https://www.facebook.com/youmattermedia.in' },
  { key: 'x', label: 'X', url: '' },
  { key: 'instagram', label: 'Instagram', url: 'https://www.instagram.com/youmattermedia.in/' },
  // YouTube's home page for now; swap in the channel URL once there is one.
  { key: 'youtube', label: 'YouTube', url: 'https://www.youtube.com/@YouMatterMedia-m5o' },
  { key: 'linkedin', label: 'LinkedIn', url: 'https://www.linkedin.com/company/youmattermedia/' },
  { key: 'whatsapp', label: 'WhatsApp', url: 'https://wa.me/919030404445' },
]

const SUFFIX = 'You Matter Media'

/**
 * The site's pages. One record per route drives the router, the navbar, the
 * transition panel, the document title and each page's header, so a page
 * cannot be renamed in one place and not another.
 *
 * `eyebrow`, `heading` and `lede` are the strings that already opened each of
 * these sections on the single-page site — moved here verbatim, not rewritten.
 * `teaser` is the line the home page's index shows for that page; each one is
 * likewise an existing sentence from the page it points to.
 */
export const PAGES = {
  home: {
    path: '/',
    label: 'Home',
    title: `${SUFFIX} | Creative Strategy, Branding, Design & Digital`,
  },
  about: {
    path: '/about',
    label: 'About',
    title: `About | ${SUFFIX}`,
    eyebrow: 'About Us',
    heading: 'We are many things, but mostly we are:',
    teaser: 'We stand at the crossroads of clarity and excellence.',
  },
  services: {
    path: '/services',
    label: 'Services',
    title: `Services | ${SUFFIX}`,
    eyebrow: 'What We Do',
    heading: 'Our Services',
    lede: 'Seven disciplines, one standard. Take one, or take the system.',
  },
  work: {
    path: '/work',
    label: 'Work',
    title: `Work | ${SUFFIX}`,
    eyebrow: 'Selected Work',
    heading: 'The Work',
    lede: 'Our roster spans startups, institutions, established enterprises, and individual leaders. Different industries. Consistent standards.',
    teaser: 'Different industries. Consistent standards.',
  },
  clients: {
    path: '/clients',
    label: 'Clients',
    title: `Clients | ${SUFFIX}`,
    eyebrow: 'Our Clients',
    heading: 'In good company',
    lede: 'Institutions, governments, universities, hospitality groups and individual leaders.',
  },
  contact: {
    path: '/contact',
    label: 'Contact',
    title: `Contact | ${SUFFIX}`,
    eyebrow: 'Contact',
    heading: 'If you’re building something that matters — let’s talk.',
    lede: 'If your work matters to you, it should matter to the world. And we’ll make sure it does.',
    teaser: 'If your work matters to you, it should matter to the world.',
  },
}

/** The one page with new copy: a route that doesn't exist needs to say so. */
export const NOT_FOUND = {
  key: 'not-found',
  label: 'Not found',
  title: `Page not found | ${SUFFIX}`,
  eyebrow: '404',
  heading: 'Page not found.',
}

const ORDER = ['home', 'about', 'services', 'work', 'clients', 'contact']

/**
 * Pages temporarily hidden from the site: left out of every menu, the footer
 * and the home page's index, so nothing links to them. Each page itself —
 * its route, component, content and images — is untouched, and still opens
 * at its own address. Remove a key here to bring the page back everywhere.
 */
export const HIDDEN_PAGES = new Set(['work'])

/**
 * The visible pages in nav order, each with its position (01, 02, …) used by
 * the menus and the transition panel. Hidden pages are skipped, so the
 * numbering stays continuous.
 */
export const NAV = ORDER.filter((key) => !HIDDEN_PAGES.has(key)).map((key, i) => ({
  key,
  index: String(i + 1).padStart(2, '0'),
  ...PAGES[key],
}))

// Every page, hidden ones included: pages look themselves up here.
const ALL_PAGES = ORDER.map((key) => NAV.find((p) => p.key === key) ?? { key, index: '', ...PAGES[key] })

/** Page records by key, e.g. PAGE.about (hidden pages included). */
export const PAGE = Object.fromEntries(ALL_PAGES.map((p) => [p.key, p]))

/** Finds the page record for a pathname; undefined for unknown routes. */
export function pageFor(pathname) {
  const clean = pathname.length > 1 ? pathname.replace(/\/+$/, '') : pathname
  return ALL_PAGES.find((p) => p.path === clean)
}

export const SERVICES = [
  {
    no: '01',
    name: 'Brand Strategy',
    desc: 'Positioning, messaging, naming, identity systems.',
  },
  {
    no: '02',
    name: 'Branding & Design',
    desc: 'Logos, visual identity, brand guidelines, packaging, digital assets.',
  },
  {
    no: '03',
    name: 'Web Design & Development',
    desc: 'Strategic websites built for clarity, conversion, and experience.',
  },
  {
    no: '04',
    name: 'Art Direction',
    desc: 'Campaign concepts, brand storytelling, visual narrative systems.',
  },
  {
    no: '05',
    name: 'Commercial Films & Content',
    desc: 'Brand films, advertisements, social content, documentaries.',
  },
  {
    no: '06',
    name: 'Marketing & Advertising',
    desc: 'Performance campaigns, paid media, funnels, launch strategies.',
  },
  {
    no: '07',
    name: 'Business Consulting',
    desc: 'Brand architecture, growth strategy, audience mapping, market clarity.',
  },
]

/** The belief statements, set as editorial lines rather than a paragraph. */
export const BELIEFS = [
  { text: 'Attention is earned,', emph: 'not demanded.' },
  { text: 'Creativity without strategy is', emph: 'decoration.' },
  { text: 'Strategy without execution is', emph: 'theory.' },
  { text: 'A brand is not a logo — it’s a', emph: 'lived experience.' },
  { text: 'Good marketing sells. Our marketing makes things', emph: 'meaningful.' },
]

export const ROLES = [
  'Strategists',
  'Designers',
  'Directors',
  'Writers',
  'Developers',
  'Marketers',
  'Consultants',
]

export const WHY = [
  'Place you where you belong.',
  'Give you a voice to speak.',
  'Help you be understood.',
  'Take you places.',
]

/** Client logos extracted individually from the supplied client reference sheet. */
export const CLIENTS = [
  { slug: 'rockland-group', name: 'Rockland Group' },
  { slug: 'uc-kindies', name: 'UC Kindies' },
  { slug: 'edify-education', name: 'Edify Education' },
  { slug: 'gsr-eduwizer', name: 'GSR Eduwizer' },
  { slug: 'edgrow', name: 'EDGROW' },
  { slug: 'amaravati-iit-jee-academy', name: 'Amaravati IIT-JEE Academy' },
  { slug: 'ravindra-bharathi-school', name: 'Ravindra Bharathi School' },
  { slug: 'olympia-international-school', name: 'Olympia International School' },
  { slug: 'pallavi', name: 'Pallavi' },
  { slug: 'narayana-educational-institutions', name: 'Narayana Educational Institutions' },
  { slug: 'crown-technologies', name: 'Crown Technologies' },
  { slug: 'sri-chaitanya-schools', name: 'Sri Chaitanya Schools' },
  { slug: 'stracons', name: 'STRACONS' },
  { slug: 'my-school-italy', name: 'My School Italy' },
  { slug: 'noble-nations', name: 'Noble Nations' },
  { slug: 'tejaswi-vidyaranya', name: 'Tejaswi Vidyaranya' },
  { slug: 'sequent-media-house', name: 'Sequent Media House' },
  { slug: 'birla-open-minds-international-school', name: 'Birla Open Minds International School' },
  { slug: 'delhi-public-school', name: 'Delhi Public School' },
  { slug: 'dhruva-global-school', name: 'Dhruva Global School' },
  { slug: 'ganges-valley-school', name: 'Ganges Valley School' },
  { slug: 'edlumina', name: 'EdLumina', extension: 'png', width: 237, height: 186 },
  {
    slug: 'edlumina-excellence-centre',
    name: 'EdLumina Excellence Centre',
    extension: 'png',
    width: 322,
    height: 136,
  },
]
