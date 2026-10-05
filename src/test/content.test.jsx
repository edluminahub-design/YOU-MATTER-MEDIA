import { describe, expect, it } from 'vitest'
import { CLIENTS, CONTACT, HIDDEN_PAGES, NAV, PAGE, SERVICES, pageFor } from '@/data/site'
import { CATEGORIES, PROJECTS } from '@/data/projects'

/**
 * Guards the content layer against the two failure modes that matter for this
 * site: losing something the portfolio actually says, and gaining something it
 * doesn't.
 */
describe('content integrity', () => {
  it('carries all seven services from the portfolio, in order', () => {
    expect(SERVICES).toHaveLength(7)
    expect(SERVICES.map((s) => s.no)).toEqual(['01', '02', '03', '04', '05', '06', '07'])
    expect(SERVICES.map((s) => s.name)).toEqual([
      'Brand Strategy',
      'Branding & Design',
      'Web Design & Development',
      'Art Direction',
      'Commercial Films & Content',
      'Marketing & Advertising',
      'Business Consulting',
    ])
    for (const s of SERVICES) expect(s.desc.length).toBeGreaterThan(10)
  })

  it('lists all twenty-three supplied clients with unique slugs', () => {
    expect(CLIENTS).toHaveLength(23)
    expect(new Set(CLIENTS.map((c) => c.slug)).size).toBe(23)
    expect(CLIENTS.map((c) => c.name)).toEqual([
      'Rockland Group', 'UC Kindies', 'Edify Education', 'GSR Eduwizer', 'EDGROW',
      'Amaravati IIT-JEE Academy', 'Ravindra Bharathi School', 'Olympia International School',
      'Pallavi', 'Narayana Educational Institutions', 'Crown Technologies', 'Sri Chaitanya Schools',
      'STRACONS', 'My School Italy', 'Noble Nations', 'Tejaswi Vidyaranya', 'Sequent Media House',
      'Birla Open Minds International School', 'Delhi Public School', 'Dhruva Global School',
      'Ganges Valley School', 'EdLumina', 'EdLumina Excellence Centre',
    ])
    for (const c of CLIENTS) expect(c.name.trim()).not.toBe('')
  })

  it('uses the portfolio contact details verbatim', () => {
    expect(CONTACT.email).toBe('enquiry@youmattermedia.in')
    expect(CONTACT.primaryPhone).toBe('+91-87124 43605')
    expect(CONTACT.phone).toBe('+91-90304 04445')
    // The second number was retired and must not ship at all.
    expect(JSON.stringify(CONTACT)).not.toContain('96677')
    expect(CONTACT).not.toHaveProperty('reach')
  })

  it('gives every nav item its own route, in order (Work is hidden for now)', () => {
    expect(NAV.map((n) => n.path)).toEqual(['/', '/about', '/services', '/clients', '/contact'])
    expect(NAV.map((n) => n.label)).toEqual(['Home', 'About', 'Services', 'Clients', 'Contact'])
    expect(new Set(NAV.map((n) => n.title)).size).toBe(NAV.length)
  })

  it('keeps the hidden Work page complete, ready to be shown again', () => {
    expect(HIDDEN_PAGES.has('work')).toBe(true)
    expect(PAGE.work).toMatchObject({ path: '/work', label: 'Work', heading: 'The Work' })
    expect(pageFor('/work')).toBe(PAGE.work)
    expect(PROJECTS.length).toBeGreaterThan(0)
  })

  it('carries the original section copy into the page headers verbatim', () => {
    // These are the strings that opened each section on the single-page site.
    expect(PAGE.about).toMatchObject({ eyebrow: 'About Us', heading: 'We are many things, but mostly we are:' })
    expect(PAGE.services).toMatchObject({
      eyebrow: 'What We Do',
      heading: 'Our Services',
      lede: 'Seven disciplines, one standard. Take one, or take the system.',
    })
    expect(PAGE.work).toMatchObject({
      eyebrow: 'Selected Work',
      heading: 'The Work',
      lede: 'Our roster spans startups, institutions, established enterprises, and individual leaders. Different industries. Consistent standards.',
    })
    expect(PAGE.clients).toMatchObject({
      eyebrow: 'Our Clients',
      heading: 'In good company',
      lede: 'Institutions, governments, universities, hospitality groups and individual leaders.',
    })
    expect(PAGE.contact).toMatchObject({
      eyebrow: 'Contact',
      heading: 'If you’re building something that matters — let’s talk.',
      lede: 'If your work matters to you, it should matter to the world. And we’ll make sure it does.',
    })
  })

  it('resolves pathnames to pages', () => {
    expect(pageFor('/')).toBe(PAGE.home)
    expect(pageFor('/work')).toBe(PAGE.work)
    expect(pageFor('/work/')).toBe(PAGE.work)
    expect(pageFor('/missing')).toBeUndefined()
  })

  it('invents no statistics, awards or testimonials in project copy', () => {
    // The deck carries no numbers for these projects, so any digit-led claim in
    // the prose would be fabricated. Years and proper nouns are allowed.
    const banned = /\b\d+\s*(%|percent|x\b|million|crore|lakh|followers|clients|awards)/i
    for (const p of PROJECTS) {
      expect(p.body, `${p.id} body`).not.toMatch(banned)
      expect(p.summary, `${p.id} summary`).not.toMatch(banned)
    }
  })
})

describe('project catalogue', () => {
  it('has a unique id and a known category for every project', () => {
    expect(new Set(PROJECTS.map((p) => p.id)).size).toBe(PROJECTS.length)
    for (const p of PROJECTS) {
      expect(CATEGORIES, `${p.id} category`).toContain(p.category)
      expect(['wide', 'tall', 'square'], `${p.id} span`).toContain(p.span)
    }
  })

  it('gives every image a non-empty alt and intrinsic dimensions', () => {
    for (const p of PROJECTS) {
      for (const img of [p.cover, ...p.gallery]) {
        expect(img.alt.trim(), `${p.id} alt`).not.toBe('')
        expect(img.width).toBeGreaterThan(0)
        expect(img.height).toBeGreaterThan(0)
        expect(img.src).toMatch(/^\/work\/.+-lg\.webp$/)
        expect(img.srcSet).toContain('-sm.webp')
      }
    }
  })

  it('leaves no filter category empty', () => {
    for (const c of CATEGORIES.filter((x) => x !== 'All')) {
      expect(PROJECTS.filter((p) => p.category === c).length, `${c} is empty`).toBeGreaterThan(0)
    }
  })
})
