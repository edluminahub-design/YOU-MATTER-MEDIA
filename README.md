# You Matter Media

Marketing site for You Matter Media — a multi-page agency site built from the
company's portfolio deck.

```bash
npm install
npm run dev          # http://localhost:5174
```

| Script            | What it does                          |
| ----------------- | ------------------------------------- |
| `npm run dev`     | Dev server on port 5174               |
| `npm run build`   | Production build into `dist/`         |
| `npm run preview` | Serve the production build            |
| `npm run lint`    | ESLint, zero warnings tolerated       |
| `npm test`        | Vitest (content + component coverage) |

Stack: React 18, Vite 5, Tailwind CSS 4, React Router 7 (library mode). No
animation library — all motion is CSS.

## Pages and routing

| Route       | Page     | Contains                                                     |
| ----------- | -------- | ------------------------------------------------------------ |
| `/`         | Home     | Hero, "You matter to the world", an index of the other pages |
| `/about`    | About    | About Us, What Defines Us, Vision & Mission, Philosophy      |
| `/services` | Services | The seven services                                           |
| `/work`     | Work     | The filterable portfolio and project detail dialog          |
| `/clients`  | Clients  | The eighteen client logos                                    |
| `/contact`  | Contact  | Contact details and form, Why Choose You Matter              |
| anything else | 404    | "Page not found" with a way home                             |

Every page is defined once in `PAGES` (`src/data/site.js`): path, nav label,
document title, and the eyebrow / heading / lede its `PageHeader` shows. Those
header strings are the lines that opened each section on the old single-page
site, moved verbatim — the split changed where content sits, not what it says.

Routes live in `src/routes.jsx`; `src/components/Layout.jsx` is the frame
(navbar, footer, loader, transition system, scroll restoration) that every page
renders inside.

### Hosting: the SPA fallback

Routes are handled in the browser, so the host must serve `index.html` for any
path it doesn't have a file for — otherwise opening `/about` directly or
refreshing it returns a 404. `vite dev` and `vite preview` already do this.

- **Netlify / Cloudflare Pages** — `public/_redirects` is included and handles it.
- **Vercel** — add a `vercel.json` with a rewrite of `/(.*)` to `/index.html`.
- **Render (static site)** — add a rewrite rule: source `/*`, destination
  `/index.html`, action *Rewrite*.

## Content is sourced, not invented

Every claim on this site comes from the portfolio deck. There are no invented
clients, metrics, awards, testimonials, team members or case-study results,
because the deck contains none of those — and a test
(`src/test/content.test.jsx`) fails the build if digit-led claims appear in
project copy.

- `src/data/site.js` — contact details, nav, the seven services, the belief
  statements, the eighteen clients.
- `src/data/projects.js` — the thirteen projects, their categories and imagery.
  Descriptions describe only what is visible in the artwork.
- `src/data/images.js` — generated; intrinsic image sizes.

## Design tokens

Defined once in `src/index.css` under `@theme`. The site is red and white, from
the brand portfolio: white carries the pages, red carries the brand (full-bleed
bands, buttons, links, accents, the page curtain and the footer), and a dark
warm ink is kept for running text. Every pair was contrast-checked before
adoption; the ratios are recorded in that file.

| Token                 | Value     | Role                                        |
| --------------------- | --------- | ------------------------------------------- |
| `--color-paper`       | `#FFFFFF` | Page background                             |
| `--color-shell`       | `#FFF7F5` | Secondary surface, alternating sections     |
| `--color-ink`         | `#1C1412` | Running text (18.13:1 on white)             |
| `--color-ink-soft`    | `#5C4F4C` | Secondary text (7.84:1)                     |
| `--color-rule`        | `#F0D3CD` | Hairlines                                   |
| `--color-band`        | `#D6341F` | Red sections, curtain, footer               |
| `--color-accent`      | `#D6341F` | Buttons, links, emphasis (4.81:1 on white)  |
| `--color-accent-deep` | `#A92716` | Hover state                                 |
| `--color-accent-lift` | `#FFFFFF` | Small labels on red                         |
| `--color-accent-2`    | `#8C1F12` | Image overlays and the dialog backdrop      |

The portfolio's own coral (`#FF503A`) holds white text at only 3.25:1, so the
working red is a slightly deeper cut of it that passes (4.81:1).

Type: League Gothic for display, Poppins for text, both as used in the brand
portfolio and both loaded from Google Fonts in `index.html`.

## Logo

The logo is cream League Gothic (`#E9E3DB`) on coral (`#FF503A`) — the lockup
on the portfolio's cover. It keeps those colours everywhere it appears, even
though the interface red is the deeper `#D6341F`: a logo is reproduced as
supplied.

- `src/components/Logo.jsx` renders it inline from vector outlines
  (`src/data/logo.js`), so it is crisp at any size and never waits on the web
  font. Used in the navbar (it steps down when the bar condenses), the footer,
  and full-screen on the first-visit opening screen.
- `public/logo.svg` / `favicon.svg` are the square version; `logo-512.png`,
  `apple-touch-icon.png` and `favicon-32.png` are its raster sizes.

All of these are generated from the PDF by `scripts/build_logo.py`, which
traces the glyphs embedded on the cover at their exact positions:

```bash
pip install pymupdf fonttools
python scripts/build_logo.py "path/to/You Matter Media Portfolio.pdf"
```

## Motion

All of it is CSS — no animation library. Everything animates `transform`,
`opacity` or `clip-path` only, so the compositor does the work. Durations that
JavaScript has to wait on live in `src/motion/config.js`.

- **Page transitions** (`PageTransition.jsx`) — every in-site link goes through
  `TransitionLink`, which hands the click to a small state machine:
  `cover → swap → reveal`. An ink curtain rises over the outgoing page (which
  dims and drifts up — its exit), the route changes and the window resets to
  the top **only once the curtain fully covers the screen**, the destination's
  name holds for a beat, then the curtain carries on off the top while the new
  page plays its entrance. About 1.3s end to end. There is never a blank or
  white frame, because nothing changes while anything is visible.
- **Page entrances** (`PageWrapper.jsx`) — each page is `waiting`, `leaving`
  or `ready`. While covered, reveals are held in their starting pose by CSS
  (and the home hero's keyframes are paused), so every page's opening plays as
  it is uncovered rather than finishing unseen. Inner pages share one sequence
  through `PageHeader`: eyebrow and page index, the title lifting out of a
  slight tilt, the lede, a rule drawing across — then the page's own content
  (service rows stagger, portfolio frames open, logos rise, the form follows
  the call to action).
- **Back / forward** skip the curtain (the browser has already moved) and get
  the page entrance with scroll position restored.
- **Navigation** — links draw an underline on hover; the current page stays
  underlined, turns brass and carries a dot (a bar in the mobile menu).
  `NavLink` sets `aria-current="page"`, which is what the styles key off.
- **Accessibility** — after an in-site navigation, focus moves to the new
  page's heading and a live region announces the page title. Modified clicks
  (cmd/ctrl/shift, middle-click) are left to the browser.

- **Page load** (`Preloader.jsx`) — the wordmark wipes in on ink, the panel
  lifts at 750ms and is out of the DOM by 1.5s. It is `pointer-events: none`
  throughout, so it never delays a click or a scroll.
- **Scroll reveals** (`Reveal.jsx`, `useReveal.js`) — three variants: `up`
  (fade and rise), `mask` (headings wipe up from the baseline) and `media`
  (the frame opens while the picture settles from 1.14 to 1:1). One shared
  IntersectionObserver serves the whole page and unobserves each element once
  it has played.
- **Parallax** (`useParallax.js`) — hero plates only, desktop only, capped
  travel, one rAF-throttled listener writing a single custom property.
- **Hover** — buttons fill from the bottom, nav and footer links draw an
  underline, cards zoom and dim, service rows wash to paper, logo tiles lift.

`prefers-reduced-motion: reduce` removes all of it: navigation is immediate
with no curtain, the loader never renders,
reveals and entrances are cancelled outright rather than shortened (a delayed
`fill-mode: both` animation would otherwise hold content invisible), parallax
is inert, and smooth scrolling is off.

## Images

All imagery is extracted from the portfolio PDF. `scripts/extract_assets.py`
is the reproducible record of how — it pulls the embedded bitmaps, splits the
composite grids, crops the eighteen client logos off the "Our Clients" page,
and writes WebP at two widths plus the size manifest:

```bash
pip install pymupdf pillow numpy
python scripts/extract_assets.py "path/to/You Matter Media Portfolio.pdf"
```

Two details in there are load-bearing. Client logos are encoded **lossless**,
because a lossy encode shifts their flat cream ground by a level or two and
that shows as a visible rectangle against the tile behind them. And the logo
crops stop at coordinates read from the PDF's own text layer, so the dashed
rule under each mark is never included.

## The contact form

The contact form posts to the server-side `/api/contact` endpoint. The API
validates the enquiry, applies a basic rate limit, and sends it through SMTP to
the configured delivery inbox. SMTP credentials stay in `.env` and are never
included in the frontend bundle.

Copy `.env.example` to `.env`, set the SMTP values, and start both processes:

```bash
npm run dev
```

The form posts `{ name, email, company, phone, topic, message }` as JSON. The
server adds the submission timestamp and sends the visitor's email as the
reply-to address.

What visitors see:

- **Sent** — a thank-you, with the phone number for anything urgent.
- **Service refused it, or the network failed** — an error with the phone
  number; everything they typed stays in the form.
- **Email service unavailable** — the form keeps the entered details and asks
  visitors to try again or call instead. It never pretends a message was sent.

## Before going live

- Point `index.html`'s canonical URL, Open Graph URL and `public/sitemap.xml`
  at the real domain if it is not `youmattermedia.in`.
- Add social profile links to the footer (the deck lists none, so none are
  shown).
- **Connect the contact form**: set the SMTP variables in `.env` (see above)
  before deploying the API.
