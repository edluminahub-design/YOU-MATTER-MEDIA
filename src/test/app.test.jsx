import { afterEach, describe, expect, it, vi } from 'vitest'
import { act, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { RouterProvider, createMemoryRouter } from 'react-router'
import { routes } from '@/routes'
import { NAV, PAGE, NOT_FOUND, SOCIAL } from '@/data/site'
import { PROJECTS } from '@/data/projects'
import { sendEnquiry } from '@/lib/enquiry'

// Any email address at all — the site should show none of its own.
const AN_EMAIL = /[\w.+-]+@[\w-]+\.[a-z]{2,}/i

afterEach(() => {
  vi.unstubAllEnvs()
  vi.restoreAllMocks()
})

/** Renders the real route table at `path`; returns the router for history checks. */
function renderAt(path) {
  const router = createMemoryRouter(routes, { initialEntries: [path] })
  const utils = render(<RouterProvider router={router} />)
  return { router, ...utils }
}

const primaryNav = () => screen.getByRole('navigation', { name: 'Primary' })
const heading = () => screen.getByRole('heading', { level: 1 })
const titleOf = (key) => PAGE[key].heading ?? PAGE[key].label

describe('routes', () => {
  const INNER = ['about', 'services', 'work', 'clients', 'contact']

  it('renders the home page at /', () => {
    renderAt('/')
    expect(heading()).toHaveTextContent(/you\s*matter/i)
    expect(document.title).toBe(PAGE.home.title)
  })

  it.each(INNER)('renders /%s directly, with its own heading and title', (key) => {
    renderAt(PAGE[key].path)
    expect(heading()).toHaveTextContent(titleOf(key))
    expect(document.title).toBe(PAGE[key].title)
  })

  it.each(['/', ...INNER.map((k) => PAGE[k].path)])('renders exactly one h1 on %s', (path) => {
    const { container } = renderAt(path)
    expect(container.querySelectorAll('h1')).toHaveLength(1)
  })

  it('tolerates a trailing slash', () => {
    renderAt('/about/')
    expect(heading()).toHaveTextContent(titleOf('about'))
  })

  it('shows a not-found page for unknown paths', () => {
    renderAt('/nope')
    expect(heading()).toHaveTextContent(NOT_FOUND.heading)
    expect(document.title).toBe(NOT_FOUND.title)
    expect(screen.getByRole('link', { name: /back to home/i })).toHaveAttribute('href', '/')
  })

  it.each(['/', ...INNER.map((k) => PAGE[k].path)])('gives every image alt text on %s', (path) => {
    const { container } = renderAt(path)
    for (const img of container.querySelectorAll('img')) {
      expect(img.getAttribute('alt')?.trim(), img.getAttribute('src')).toBeTruthy()
    }
  })
})

describe('social rail', () => {
  const rail = () => screen.getByRole('navigation', { name: 'Social media' })

  it.each(['/', '/about', '/services', '/work', '/clients', '/contact'])(
    'is present on %s, fixed to the right edge',
    (path) => {
      renderAt(path)
      expect(rail()).toHaveClass('fixed', 'right-1.5')
    },
  )

  it('shows one icon per profile that has a link, and none for the rest', () => {
    renderAt('/')
    const links = within(rail()).getAllByRole('link')
    expect(links).toHaveLength(SOCIAL.filter((s) => s.url).length)
    for (const s of SOCIAL.filter((x) => !x.url)) {
      expect(within(rail()).queryByRole('link', { name: new RegExp(s.label) })).not.toBeInTheDocument()
    }
  })

  it('opens every profile in a new tab, safely', () => {
    renderAt('/')
    for (const link of within(rail()).getAllByRole('link')) {
      expect(link).toHaveAttribute('target', '_blank')
      expect(link.getAttribute('rel')).toMatch(/noopener/)
      expect(link.getAttribute('href')).toMatch(/^https:\/\//)
      expect(link).toHaveAccessibleName(/opens in a new tab/i)
    }
  })

  it('links Facebook, Instagram and LinkedIn to the studio profiles', () => {
    renderAt('/')
    const href = (name) => within(rail()).getByRole('link', { name }).getAttribute('href')
    expect(href(/facebook/i)).toBe('https://www.facebook.com/youmattermedia.in')
    expect(href(/instagram/i)).toBe('https://www.instagram.com/youmattermedia.in/')
    expect(href(/linkedin/i)).toBe('https://www.linkedin.com/company/youmattermedia/')
  })

  it('shows the five linked icons in order, and not X yet', () => {
    renderAt('/')
    const names = within(rail()).getAllByRole('link').map((a) => a.getAttribute('aria-label').split(' (')[0])
    expect(names).toEqual(['Facebook', 'Instagram', 'YouTube', 'LinkedIn', 'WhatsApp'])
  })

  it('links WhatsApp to the studio number', () => {
    renderAt('/')
    expect(within(rail()).getByRole('link', { name: /whatsapp/i })).toHaveAttribute(
      'href',
      'https://wa.me/919030404445',
    )
  })

  it('stays in place across a page change', async () => {
    const user = userEvent.setup()
    renderAt('/')
    const before = rail()
    await user.click(within(primaryNav()).getByRole('link', { name: 'Clients' }))
    expect(rail()).toBe(before)
  })
})

describe('inner page header', () => {
  it('keeps the About heading visible', () => {
    renderAt('/about')
    const h1 = screen.getByRole('heading', { level: 1 })
    expect(h1).toHaveTextContent('We are many things, but mostly we are:')
    expect(h1).not.toHaveClass('sr-only')
    expect(document.querySelectorAll('h1')).toHaveLength(1)
  })

  it.each(['/about', '/services', '/work', '/clients', '/contact'])(
    'shows no page count and no divider line on %s',
    (path) => {
      const { container } = renderAt(path)
      expect(container.querySelector('main')).not.toHaveTextContent(/\b0[1-6]\s*\/\s*06\b/)
      expect(container.querySelector('.reveal-rule')).toBeNull()
    },
  )
})

describe('page banner', () => {
  it.each(['about', 'services', 'work', 'clients', 'contact'])(
    'opens /%s with its name, centred, and a trail back home',
    (key) => {
      renderAt(PAGE[key].path)
      const banner = screen.getByRole('region', { name: `${PAGE[key].label} page` })
      expect(banner).toHaveTextContent(`${PAGE[key].label}.`)

      const trail = within(banner).getByRole('navigation', { name: 'Breadcrumb' })
      expect(within(trail).getByRole('link', { name: 'Home' })).toHaveAttribute('href', '/')
      expect(within(trail).getByText(PAGE[key].label)).toHaveAttribute('aria-current', 'page')

      // It comes before the page's own heading, which stays the only h1.
      const h1 = screen.getByRole('heading', { level: 1 })
      expect(banner.compareDocumentPosition(h1) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
      expect(document.querySelectorAll('h1')).toHaveLength(1)
    },
  )

  it('does not appear on the home page', () => {
    renderAt('/')
    expect(screen.queryByRole('navigation', { name: 'Breadcrumb' })).not.toBeInTheDocument()
    expect(screen.queryByRole('region', { name: /page$/ })).not.toBeInTheDocument()
  })
})

describe('content placement', () => {
  it('keeps each section on the page it was assigned to', () => {
    const expectations = {
      '/about': [/we stand at the crossroads/i, /^vision$/i, /^mission$/i, /our philosophy/i, /strategists/i],
      '/services': ['Brand Strategy', 'Business Consulting'],
      '/clients': ['Rockland Group'],
      '/contact': [/why choose you matter/i, '+91-90304 04445'],
    }
    for (const [path, needles] of Object.entries(expectations)) {
      const { unmount } = renderAt(path)
      const main = screen.getByRole('main')
      for (const needle of needles) {
        const found =
          within(main).queryAllByText(needle).length > 0 ||
          within(main).queryAllByAltText(needle).length > 0
        expect(found, `${String(needle)} on ${path}`).toBe(true)
      }
      unmount()
    }
  })

  it('does not repeat a page title as a section heading', () => {
    // The section headers moved into PageHeader; they must not also remain
    // in the sections below it.
    // Matched on whole heading text: a title ending in a full stop renders
    // that stop in its own red span.
    for (const key of ['about', 'services', 'work', 'clients', 'contact']) {
      const { unmount } = renderAt(PAGE[key].path)
      const matches = screen
        .getAllByRole('heading')
        .filter((h) => h.textContent.trim() === PAGE[key].heading)
      expect(matches, key).toHaveLength(1)
      expect(matches[0].tagName, key).toBe('H1')
      unmount()
    }
  })
})

describe('navigation', () => {
  it('links every primary nav item to its own route', () => {
    renderAt('/')
    const links = within(primaryNav()).getAllByRole('link')
    const hrefs = links.map((a) => a.getAttribute('href'))
    for (const page of NAV) expect(hrefs).toContain(page.path)
  })

  it.each(NAV.map((p) => [p.path, p.label]))('marks only the current page active on %s', (path, label) => {
    renderAt(path)
    const current = within(primaryNav()).getAllByRole('link', { current: 'page' })
    expect(current).toHaveLength(1)
    expect(current[0]).toHaveTextContent(label)
  })

  it('moves between pages, updating the URL, heading and active link', async () => {
    const user = userEvent.setup()
    const { router } = renderAt('/')

    const order = ['about', 'services', 'clients', 'contact']
    for (const key of order) {
      await user.click(within(primaryNav()).getByRole('link', { name: PAGE[key].label }))
      expect(router.state.location.pathname).toBe(PAGE[key].path)
      expect(heading()).toHaveTextContent(titleOf(key))
      expect(within(primaryNav()).getByRole('link', { current: 'page' })).toHaveTextContent(
        PAGE[key].label,
      )
    }

    // …and home again, completing the loop.
    await user.click(within(primaryNav()).getByRole('link', { name: 'Home' }))
    expect(router.state.location.pathname).toBe('/')
    expect(heading()).toHaveTextContent(/you\s*matter/i)
  })

  it('supports browser back and forward', async () => {
    const user = userEvent.setup()
    const { router } = renderAt('/')

    await user.click(within(primaryNav()).getByRole('link', { name: 'About' }))
    await user.click(within(primaryNav()).getByRole('link', { name: 'Clients' }))
    expect(router.state.location.pathname).toBe('/clients')

    await act(() => router.navigate(-1))
    expect(router.state.location.pathname).toBe('/about')
    expect(heading()).toHaveTextContent(titleOf('about'))

    await act(() => router.navigate(-1))
    expect(router.state.location.pathname).toBe('/')

    await act(() => router.navigate(1))
    expect(router.state.location.pathname).toBe('/about')
    expect(within(primaryNav()).getByRole('link', { current: 'page' })).toHaveTextContent('About')
  })

  it('leaves modified clicks to the browser', async () => {
    const user = userEvent.setup()
    const { router } = renderAt('/')
    // A ctrl/cmd-click must not be swallowed into an in-app navigation.
    await user.keyboard('{Control>}')
    await user.click(within(primaryNav()).getByRole('link', { name: 'About' }))
    await user.keyboard('{/Control}')
    expect(router.state.location.pathname).toBe('/')
  })

  it('opens the home page with the single banner image and nothing else in the hero', () => {
    renderAt('/')
    const hero = document.getElementById('top')
    const imgs = hero.querySelectorAll('img')
    expect(imgs).toHaveLength(1)
    expect(imgs[0]).toHaveAttribute('src', '/work/hero-banner-lg.webp')
    expect(imgs[0].getAttribute('alt')).toMatch(/digital growth that matters/i)
    expect(hero.querySelectorAll('a, button')).toHaveLength(0)
    expect(within(hero).getByRole('heading', { level: 1 })).toHaveTextContent(/digital growth that matters/i)
  })

  it('offers every inner page from the home page index', () => {
    renderAt('/')
    const main = screen.getByRole('main')
    for (const key of ['about', 'services', 'clients', 'contact']) {
      const link = within(main)
        .getAllByRole('link')
        .find((a) => a.getAttribute('href') === PAGE[key].path && a.textContent.includes(PAGE[key].label))
      expect(link, key).toBeTruthy()
    }
  })

  it('offers a skip link to the main content', () => {
    renderAt('/')
    expect(screen.getByRole('link', { name: /skip to content/i })).toHaveAttribute('href', '#main')
  })
})

describe('mobile navigation', () => {
  it('opens, closes on Escape, and closes when a destination is chosen', async () => {
    const user = userEvent.setup()
    const { router } = renderAt('/')

    await user.click(screen.getByRole('button', { name: /open menu/i }))
    expect(screen.getByRole('button', { name: /close menu/i })).toHaveAttribute('aria-expanded', 'true')

    await user.keyboard('{Escape}')
    expect(screen.getByRole('button', { name: /open menu/i })).toHaveAttribute('aria-expanded', 'false')

    await user.click(screen.getByRole('button', { name: /open menu/i }))
    const panel = document.getElementById('mobile-nav')
    await user.click(within(panel).getByRole('link', { name: 'Clients' }))

    expect(router.state.location.pathname).toBe('/clients')
    expect(screen.getByRole('button', { name: /open menu/i })).toHaveAttribute('aria-expanded', 'false')
    expect(document.body.style.overflow).toBe('')
  })

  it('marks the current page in the menu', async () => {
    const user = userEvent.setup()
    renderAt('/services')
    await user.click(screen.getByRole('button', { name: /open menu/i }))
    const panel = document.getElementById('mobile-nav')
    expect(within(panel).getByRole('link', { current: 'page' })).toHaveTextContent('Services')
  })
})

describe('hidden work page', () => {
  it.each(['/', '/about', '/services', '/clients', '/contact'])(
    'links to Work nowhere on %s — not the menus, the footer or the home index',
    (path) => {
      renderAt(path)
      const toWork = screen
        .queryAllByRole('link', { hidden: true })
        .filter((a) => a.getAttribute('href') === '/work' || /^work$/i.test(a.textContent.trim()))
      expect(toWork).toEqual([])
    },
  )

  it('numbers the remaining pages without a gap', () => {
    expect(NAV.map((p) => p.index)).toEqual(['01', '02', '03', '04', '05'])
  })

  it('keeps the page itself: it still opens at its own address', () => {
    renderAt('/work')
    expect(heading()).toHaveTextContent(titleOf('work'))
  })
})

describe('work page', () => {
  it('shows every project until a filter is applied', () => {
    renderAt('/work')
    expect(screen.getAllByRole('button', { name: /^view project:/i })).toHaveLength(PROJECTS.length)
  })

  it('filters the grid by category', async () => {
    const user = userEvent.setup()
    renderAt('/work')

    const webCount = PROJECTS.filter((p) => p.category === 'Web').length
    await user.click(screen.getByRole('tab', { name: /^web/i }))

    expect(screen.getAllByRole('button', { name: /^view project:/i })).toHaveLength(webCount)
    expect(screen.getByRole('tab', { name: /^web/i })).toHaveAttribute('aria-selected', 'true')
  })

  it('opens a project and closes it again', async () => {
    const user = userEvent.setup()
    renderAt('/work')

    const first = PROJECTS[0]
    await user.click(screen.getByRole('button', { name: `View project: ${first.title}` }))

    const dialog = screen.getByRole('dialog')
    expect(within(dialog).getByRole('heading', { level: 2 })).toHaveTextContent(first.title)
    expect(within(dialog).getByText(first.body)).toBeInTheDocument()

    await user.click(within(dialog).getByRole('button', { name: /close project/i }))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('closes the project on Escape', async () => {
    const user = userEvent.setup()
    renderAt('/work')

    await user.click(screen.getByRole('button', { name: `View project: ${PROJECTS[0].title}` }))
    await user.keyboard('{Escape}')
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('goes from a project to the contact page, releasing the dialog', async () => {
    const user = userEvent.setup()
    const { router } = renderAt('/work')

    await user.click(screen.getByRole('button', { name: `View project: ${PROJECTS[0].title}` }))
    await user.click(screen.getByRole('link', { name: /start a project like this/i }))

    expect(router.state.location.pathname).toBe('/contact')
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(document.body.style.overflow).toBe('')
  })
})

describe('contact details', () => {
  const contactSection = () => document.getElementById('contact')

  it('shows both phones, email and Call Now without location or map', () => {
    renderAt('/contact')
    const section = contactSection()
    expect(section).not.toHaveTextContent('+91-96677 63331')

    // The details column is separate from the form's own Email field.
    const details = document.getElementById('contact-phone').parentElement
    const labels = [...details.querySelectorAll('.eyebrow')].map((el) => el.textContent.trim())
    expect(labels).toEqual(['Mail ID', 'Phone'])
    expect(within(details).getAllByRole('link').map((a) => a.textContent.trim())).toEqual([
      'enquiry@youmattermedia.in',
      '+91-87124 43605',
      '+91-90304 04445',
      'Call Now',
    ])
    expect(details).toHaveTextContent(/mail id\s*enquiry@youmattermedia\.in\s*phone\s*\+91-87124 43605\s*\+91-90304 04445\s*call now/i)
    expect(details).not.toHaveTextContent(/where|india|global reach|maps/i)

    expect(section).not.toHaveTextContent('India | Global Reach')
    expect(section.querySelector('a[href*="google.com/maps"]')).toBeNull()
    expect(section.querySelector('a[href="mailto:enquiry@youmattermedia.in"]')).toBeTruthy()
  })

  it('dials both phone numbers, with the primary number on Call Now', () => {
    renderAt('/contact')
    const section = contactSection()
    expect(within(section).getByRole('link', { name: '+91-87124 43605' })).toHaveAttribute(
      'href',
      'tel:+918712443605',
    )
    expect(within(section).getByRole('link', { name: '+91-90304 04445' })).toHaveAttribute(
      'href',
      'tel:+919030404445',
    )
    expect(within(section).getByRole('link', { name: /call now/i })).toHaveAttribute(
      'href',
      'tel:+918712443605',
    )
    const telLinks = [...section.querySelectorAll('a[href^="tel:"]')]
    expect(new Set(telLinks.map((a) => a.getAttribute('href')))).toEqual(
      new Set(['tel:+918712443605', 'tel:+919030404445']),
    )
  })

  it('shows a map banner between the form and Why Choose that opens Google Maps', () => {
    renderAt('/contact')
    const banner = screen.getByRole('link', { name: /open in google maps/i })
    expect(banner).toHaveAttribute(
      'href',
      'https://www.google.com/maps/search/?api=1&query=You%20Matter%20Media%2C%20India',
    )
    expect(banner).toHaveAttribute('target', '_blank')
    expect(banner.getAttribute('rel')).toMatch(/noopener/)
    expect(banner).toHaveTextContent(/you matter media · india/i)
    expect(banner).toHaveTextContent(/open in google maps/i)
    // Only one way into Maps on the page, and it is the banner.
    expect(document.querySelectorAll('a[href*="google.com/maps"]')).toHaveLength(1)

    // Order on the page: the form's submit button, then the banner, then Why Choose.
    const submit = screen.getByRole('button', { name: /start a conversation/i })
    const why = screen.getByText(/why choose you matter\?/i)
    const FOLLOWS = Node.DOCUMENT_POSITION_FOLLOWING
    expect(submit.compareDocumentPosition(banner) & FOLLOWS).toBeTruthy()
    expect(banner.compareDocumentPosition(why) & FOLLOWS).toBeTruthy()
  })

  it('shows the map banner on the contact page only', () => {
    for (const path of ['/', '/about', '/services', '/work', '/clients']) {
      const { unmount } = renderAt(path)
      expect(screen.queryByRole('link', { name: /open in google maps/i }), path).not.toBeInTheDocument()
      unmount()
    }
  })

  it.each(['/', '/about', '/contact'])('shows both phones and email in the footer on %s', (path) => {
    renderAt(path)
    const footer = screen.getByRole('contentinfo')
    expect(footer).not.toHaveTextContent('+91-96677 63331')
    expect(within(footer).getByRole('link', { name: '+91-87124 43605' })).toHaveAttribute(
      'href',
      'tel:+918712443605',
    )
    expect(within(footer).getByRole('link', { name: '+91-90304 04445' })).toHaveAttribute(
      'href',
      'tel:+919030404445',
    )
    expect(within(footer).getByRole('link', { name: 'enquiry@youmattermedia.in' })).toHaveAttribute(
      'href',
      'mailto:enquiry@youmattermedia.in',
    )
    expect(footer).not.toHaveTextContent(/india|global reach/i)
  })

  it('does not show retired contact details anywhere on the page', () => {
    for (const path of ['/', '/about', '/services', '/work', '/clients', '/contact']) {
      const { unmount } = renderAt(path)
      expect(document.body, path).not.toHaveTextContent('+91-96677 63331')
      unmount()
    }
  })
})

describe('contact form', () => {
  const submit = () => screen.getByRole('button', { name: /start a conversation/i })

  it('opens the form with an invitation to get in touch', () => {
    renderAt('/contact')
    const form = screen.getByRole('form', { name: /feel free to contact us/i })
    const title = within(form).getByRole('heading', { name: /feel free to contact us/i })
    // It comes before the first field, the Name box.
    expect(
      title.compareDocumentPosition(screen.getByLabelText(/^name$/i)) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy()
  })

  it('offers the eight industry options, after the prompt', () => {
    renderAt('/contact')
    const options = [...screen.getByLabelText(/what can we help you with/i).options]
    expect(options.map((o) => o.textContent)).toEqual([
      'Choose the closest fit…',
      'Real estate',
      'Education',
      'Hospitality',
      'Healthcare',
      'Luxury retail',
      'Finance',
      'Personal brand',
      'Other',
    ])
    expect(options[0].value).toBe('')
  })

  it('reports errors for an empty submission and does not claim to have sent', async () => {
    const user = userEvent.setup()
    renderAt('/contact')

    await user.click(submit())

    expect(screen.getByText(/please tell us your name/i)).toBeInTheDocument()
    expect(screen.getByText(/please add an email/i)).toBeInTheDocument()
    expect(screen.getByText(/pick the closest option/i)).toBeInTheDocument()
    expect(screen.getByText('Please enter your phone number.')).toBeInTheDocument()
    expect(screen.queryByText(/thank you/i)).not.toBeInTheDocument()
  })

  it('requires a phone number even when everything else is filled in', async () => {
    vi.stubEnv('VITE_CONTACT_ENDPOINT', 'https://example.test/enquiries')
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue({ ok: true })
    const user = userEvent.setup()
    renderAt('/contact')

    const phone = screen.getByLabelText(/^phone \(required\)$/i)
    expect(phone).toBeRequired()

    await user.type(screen.getByLabelText(/^name$/i), 'Asha Rao')
    await user.type(screen.getByLabelText(/^email$/i), 'asha@example.com')
    await user.selectOptions(screen.getByLabelText(/what can we help you with/i), 'Real estate')
    await user.type(screen.getByLabelText(/^message$/i), 'We are launching a new brand.')
    await user.click(submit())

    expect(screen.getByText('Please enter your phone number.')).toBeInTheDocument()
    expect(phone).toHaveAttribute('aria-invalid', 'true')
    expect(phone).toHaveFocus()
    expect(fetchSpy).not.toHaveBeenCalled()
    expect(screen.queryByRole('status')).not.toBeInTheDocument()

    // Fixing it clears the message straight away.
    await user.type(phone, '+91 98765 43210')
    expect(screen.queryByText('Please enter your phone number.')).not.toBeInTheDocument()
  })

  it('rejects a phone number that could not be dialled', async () => {
    const user = userEvent.setup()
    renderAt('/contact')
    await user.type(screen.getByLabelText(/^phone \(required\)$/i), 'call me')
    await user.click(submit())
    expect(screen.getByText(/phone number doesn’t look right/i)).toBeInTheDocument()
  })

  it('rejects a malformed email and marks the field invalid', async () => {
    const user = userEvent.setup()
    renderAt('/contact')

    await user.type(screen.getByLabelText(/^name$/i), 'Asha')
    await user.type(screen.getByLabelText(/^email$/i), 'asha@nope')
    await user.click(submit())

    expect(screen.getByText(/doesn’t look right/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/^email$/i)).toHaveAttribute('aria-invalid', 'true')
  })

  it('rejects a too-short message', async () => {
    const user = userEvent.setup()
    renderAt('/contact')

    await user.type(screen.getByLabelText(/^name$/i), 'Asha')
    await user.type(screen.getByLabelText(/^email$/i), 'asha@example.com')
    await user.selectOptions(screen.getByLabelText(/what can we help you with/i), 'Real estate')
    await user.type(screen.getByLabelText(/^message$/i), 'hi')
    await user.click(submit())

    expect(screen.getByText(/a little more detail/i)).toBeInTheDocument()
  })

  async function fillValidForm(user) {
    await user.type(screen.getByLabelText(/^name$/i), 'Asha Rao')
    await user.type(screen.getByLabelText(/^email$/i), 'asha@example.com')
    await user.type(screen.getByLabelText(/^phone \(required\)$/i), '+91 98765 43210')
    await user.selectOptions(screen.getByLabelText(/what can we help you with/i), 'Real estate')
    await user.type(
      screen.getByLabelText(/^message$/i),
      'We are launching a new hospitality brand and need positioning.',
    )
  }

  it('sends to the contact API and confirms', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue({ ok: true })

    const user = userEvent.setup()
    renderAt('/contact')
    await fillValidForm(user)
    await user.click(submit())

    const status = await screen.findByRole('status')
    expect(status).toHaveTextContent(/thank you/i)
    expect(status).not.toHaveTextContent(AN_EMAIL)
    expect(within(status).getByRole('link', { name: '+91-90304 04445' })).toHaveAttribute(
      'href',
      'tel:+919030404445',
    )

    expect(fetchSpy).toHaveBeenCalledOnce()
    const [url, init] = fetchSpy.mock.calls[0]
    expect(url).toBe('/api/contact')
    expect(init.method).toBe('POST')
    expect(init.headers.Accept).toBe('application/json')
    expect(JSON.parse(init.body)).toMatchObject({
      name: 'Asha Rao',
      email: 'asha@example.com',
      phone: '+91 98765 43210',
      topic: 'Real estate',
      _subject: 'New enquiry — Real estate',
    })
  })

  it('says so, and keeps the details, when the service refuses the enquiry', async () => {
    vi.stubEnv('VITE_CONTACT_ENDPOINT', 'https://example.test/enquiries')
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({ ok: false })

    const user = userEvent.setup()
    renderAt('/contact')
    await fillValidForm(user)
    await user.click(submit())

    const alert = await screen.findByRole('alert')
    expect(alert).toHaveTextContent(/something went wrong/i)
    expect(within(alert).getByRole('link', { name: '+91-90304 04445' })).toBeInTheDocument()
    expect(screen.queryByRole('status')).not.toBeInTheDocument()
    expect(screen.getByLabelText(/^name$/i)).toHaveValue('Asha Rao')
  })

  it('treats a network error as a failed send', async () => {
    vi.stubEnv('VITE_CONTACT_ENDPOINT', 'https://example.test/enquiries')
    vi.spyOn(globalThis, 'fetch').mockRejectedValue(new TypeError('Failed to fetch'))

    const user = userEvent.setup()
    renderAt('/contact')
    await fillValidForm(user)
    await user.click(submit())

    expect(await screen.findByRole('alert')).toHaveTextContent(/something went wrong/i)
  })

  it('uses the contact API when no external endpoint is configured', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue({ ok: true })

    const user = userEvent.setup()
    renderAt('/contact')
    await fillValidForm(user)
    await user.click(submit())

    expect(await screen.findByRole('status')).toHaveTextContent(/thank you/i)
    expect(fetchSpy).toHaveBeenCalledOnce()
    expect(fetchSpy.mock.calls[0][0]).toBe('/api/contact')
  })

  it('reports each outcome from the sending helper', async () => {
    expect(await sendEnquiry({ topic: 'x' }, '')).toBe('unavailable')
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({ ok: true })
    expect(await sendEnquiry({ topic: 'x' }, 'https://example.test')).toBe('sent')
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({ ok: false })
    expect(await sendEnquiry({ topic: 'x' }, 'https://example.test')).toBe('failed')
  })
})
