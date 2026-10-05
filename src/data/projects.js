import dims from './images.js'
import { asset } from '../lib/staticSite'

/**
 * Selected work.
 *
 * Each entry points at imagery extracted from the portfolio deck. Descriptions
 * describe only what is visible in that imagery — the deck carries no briefs,
 * results or metrics for these projects, so none are stated here. `span`
 * controls the masonry footprint so the grid has rhythm instead of 13
 * identical tiles.
 */

/** Builds an <img>-ready object from the asset manifest written at build time. */
export function image(slug, alt) {
  const d = dims[slug]
  if (!d) throw new Error(`Unknown image asset: ${slug}`)
  return {
    src: asset(`/work/${slug}-lg.webp`),
    srcSet: asset(`/work/${slug}-sm.webp ${d.smw}w, /work/${slug}-lg.webp ${d.w}w`),
    width: d.w,
    height: d.h,
    alt,
  }
}

export const CATEGORIES = ['All', 'Branding', 'Digital', 'Web', 'Campaigns', 'Social']

export const PROJECTS = [
  {
    id: 'nest-identity',
    client: 'Landmark Nest Pvt. Ltd.',
    title: 'Nest Residence',
    category: 'Branding',
    discipline: 'Brand Identity',
    summary: 'A residential identity built around a nesting bird, set in a layered mosaic mark.',
    body: 'A visual identity for Nest Residence by Landmark — a mosaic-shell monogram housing a bird and its young, carried across a turquoise and soft-green palette and into the project brochure.',
    span: 'wide',
    cover: image('nest-mark', 'Nest Residence logo — a mosaic shell enclosing a bird, on turquoise'),
    gallery: [
      image('nest-mark', 'Nest Residence logo — a mosaic shell enclosing a bird, on turquoise'),
      image('nest-brochure', 'Nest Residence project brochure covers in teal, carrying the identity mark'),
    ],
  },
  {
    id: 'nest-collateral',
    client: 'Landmark Nest Pvt. Ltd.',
    title: 'Nest — Stationery System',
    category: 'Branding',
    discipline: 'Print & Collateral',
    summary: 'The identity extended into a full business and print system.',
    body: 'Letterheads, invoices, envelopes, compliment slips, notebooks, badges, carry bags and a wax seal — the Nest identity applied across the day-to-day materials of the business.',
    span: 'tall',
    cover: image('nest-stationery', 'Nest Residence stationery suite — letterheads, bags, notebooks, badges and a wax seal'),
    gallery: [
      image('nest-stationery', 'Nest Residence stationery suite laid out on a soft green ground'),
      image('nest-letterhead', 'Nest Residence letterheads, invoice and envelopes'),
    ],
  },
  {
    id: 'mulgund-social',
    client: 'Ananth Mulgund',
    title: 'Festive & Brand Social',
    category: 'Social',
    discipline: 'Social Media Design',
    summary: 'Festival and greeting creatives for a vastu, numerology and gemology practice.',
    body: 'A run of social creatives for Ananth Mulgund — Akshaya Tritiya, Ugadi and new financial year greetings, each combining the practitioner, a rendered centrepiece and a short blessing.',
    span: 'square',
    cover: image('mulgund-1', 'Akshaya Tritiya greeting creative with a gold pot and coins'),
    gallery: [
      image('mulgund-1', 'Akshaya Tritiya greeting creative with a gold pot and coins'),
      image('mulgund-2', 'Ugadi greeting creative with a festive arrangement'),
      image('mulgund-3', 'New financial year creative with a gold rupee symbol'),
    ],
  },
  {
    id: 'spiritual-numerology',
    client: 'Ananth Mulgund',
    title: 'Spiritual Numerology',
    category: 'Campaigns',
    discipline: 'Book Campaign',
    summary: 'A launch campaign for a book on numbers, markets and prosperity.',
    body: 'Campaign creatives for the Spiritual Numerology title — a stock-market framing, a decoding-the-secrets teaser and a business-numbers execution, each built around the book itself.',
    span: 'square',
    cover: image('numerology-1', 'Buy the fear, sell the greed — stock market creative with the book'),
    gallery: [
      image('numerology-1', 'Buy the fear, sell the greed — stock market creative with the book'),
      image('numerology-2', 'Decoding the Secrets — teaser creative with a buy-now call to action'),
      image('numerology-3', 'Your Magical Business Numbers — prosperity creative with the book'),
    ],
  },
  {
    id: 'izhaar-gifting',
    client: 'Izhaar',
    title: 'Izhaar — Expression of Joy',
    category: 'Social',
    discipline: 'Luxury Gifting Creatives',
    summary: 'Product-led social design for a luxury gifting house.',
    body: 'Creatives for the Izhaar gifting range — off-the-shelf collections, seasonal and Valentine campaigns, a film festival partnership and corporate gifting, held together by a gold-on-pastel treatment.',
    span: 'square',
    cover: image('izhaar-1', 'Izhaar sparkling gifts creative with a gold monogram on a pedestal'),
    gallery: [
      image('izhaar-1', 'Izhaar sparkling gifts creative with a gold monogram on a pedestal'),
      image('izhaar-2', 'Izhaar Off the Shelf gifting grid of products'),
      image('izhaar-3', 'Izhaar Off the Shelf creative with a gold monogram on a green pedestal'),
      image('izhaar-4', 'Izhaar cinematic excellence partnership creative with a film reel'),
      image('izhaar-5', 'Izhaar Valentine collection creative in a heart motif'),
      image('izhaar-6', 'Izhaar corporate gifting creative — hands holding a wrapped gift'),
    ],
  },
  {
    id: 'izzhaar-visual',
    client: 'Izhaar',
    title: 'A Visual Retreat',
    category: 'Digital',
    discipline: 'Art Direction & Social',
    summary: 'A darker, gold-lit chapter of the Izhaar brand, carried onto Instagram.',
    body: 'Brand-led creatives on black and gold — craftsmanship, the founders, an IIFA association and a visual-retreat teaser — shown alongside the live Instagram profile they were built for.',
    span: 'wide',
    cover: image('izzhaar-board', 'Izhaar black and gold social creatives shown with the brand Instagram profile'),
    gallery: [
      image('izzhaar-board', 'Izhaar black and gold social creatives shown with the brand Instagram profile'),
    ],
  },
  {
    id: 'education-campaigns',
    client: 'Education & training institutions',
    title: 'Education & Career Campaigns',
    category: 'Campaigns',
    discipline: 'Campaign Design',
    summary: 'Admissions, recruitment and course campaigns across several institutions.',
    body: 'Campaign creatives spanning aviation training, overseas medical admissions, hospital administration, fire and safety recruitment, NEBOSH certification and digital marketing courses — including regional-language executions and a live social placement.',
    span: 'tall',
    cover: image('edu-1', 'VIMS Aviation free career guidance seminar creative'),
    gallery: [
      image('edu-1', 'VIMS Aviation free career guidance seminar creative'),
      image('edu-2', 'IMS The Source hospital administration course creative in Malayalam'),
      image('edu-3', 'Study MBBS abroad campaign creative with world landmarks'),
      image('edu-4', 'Al Salama we-are-hiring creative for a fire and safety trainer'),
      image('edu-5', 'GSR Eduwizer business partnership creative'),
      image('edu-6', 'Al Salama NEBOSH IGC course creative'),
      image('edu-7', 'AIQU digital marketing creative shown in an Instagram post mockup'),
    ],
  },
  {
    id: 'monash-irt',
    client: 'Monash University — Institute of Railway Technology',
    title: 'National Agenda for Railway Innovation',
    category: 'Digital',
    discipline: 'Publication & Invitation',
    summary: 'A discussion paper and a 50-years invitation for a university research institute.',
    body: 'Cover design for the National Agenda for Railway Innovation in Australia discussion paper, plus the invitation built for the institute 50 years of excellence event — shown as a digital invite and a printed folder.',
    span: 'wide',
    cover: image('monash-irt', 'National Agenda for Railway Innovation cover on a tablet, with the event invitation'),
    gallery: [
      image('monash-irt', 'National Agenda for Railway Innovation cover on a tablet, with the event invitation'),
    ],
  },
  {
    id: 'iisc-wellness',
    client: 'Indian Institute of Science — Wellness Centre',
    title: 'IISc Wellness Centre',
    category: 'Campaigns',
    discipline: 'Poster Series',
    summary: 'A mental health and well-being poster series for a campus wellness centre.',
    body: 'Posters for the IISc Wellness Centre covering stress management, a mental health and well-being workshop, and understanding mental health stigma — a consistent blue system with QR codes for registration.',
    span: 'wide',
    cover: image('iisc-wellness', 'Three IISc Wellness Centre posters on mental health, displayed on a wall'),
    gallery: [
      image('iisc-wellness', 'Three IISc Wellness Centre posters on mental health, displayed on a wall'),
    ],
  },
  {
    id: 'rajiv-talreja',
    client: 'Rajiv Talreja',
    title: 'Rajiv Talreja',
    category: 'Web',
    discipline: 'Web Design',
    summary: 'A workshop-led website for a business coach.',
    body: 'A dark, high-contrast site fronted by the Business Success Workshop — event framing, pricing and a single sign-up action above the fold.',
    span: 'square',
    cover: image('rajiv-talreja', 'Rajiv Talreja website shown on a laptop, with the Business Success Workshop hero'),
    gallery: [
      image('rajiv-talreja', 'Rajiv Talreja website shown on a laptop, with the Business Success Workshop hero'),
    ],
  },
  {
    id: 'master-graphology',
    client: 'Master Practitioner of Graphology',
    title: 'Master Practitioner of Graphology',
    category: 'Web',
    discipline: 'Web Design',
    summary: 'A course website for handwriting analysis and grapho-therapy.',
    body: 'A light, blue-accented site for the Global Penmanship Academy programme, leading with the curriculum and a wall of student achievement.',
    span: 'square',
    cover: image('master-graphology', 'Master Practitioner of Graphology website shown on a laptop'),
    gallery: [image('master-graphology', 'Master Practitioner of Graphology website shown on a laptop')],
  },
  {
    id: 'truemerit-ias',
    client: 'True Merit IAS',
    title: 'True Merit IAS',
    category: 'Web',
    discipline: 'Web Design',
    summary: 'A UPSC preparation website for an IAS academy in Bengaluru.',
    body: 'A deep-blue site for True Merit IAS built around UPSC preparation, with course navigation, enquiry contact and sign-up carried through the header.',
    span: 'square',
    cover: image('truemerit-ias', 'True Merit IAS website shown on a laptop with a UPSC preparation hero'),
    gallery: [image('truemerit-ias', 'True Merit IAS website shown on a laptop with a UPSC preparation hero')],
  },
  {
    id: 'truemerit-junior',
    client: 'True Merit Junior',
    title: 'True Merit Junior',
    category: 'Web',
    discipline: 'Web Design',
    summary: 'A schools programme site, built as a lighter companion to the main academy.',
    body: 'A competitive skill development programme for school students — an initiative by True Merit IAS, with olympiad, registration and brochure routes on the landing screen.',
    span: 'square',
    cover: image('truemerit-junior', 'True Merit Junior website shown on a desktop monitor'),
    gallery: [image('truemerit-junior', 'True Merit Junior website shown on a desktop monitor')],
  },
]
