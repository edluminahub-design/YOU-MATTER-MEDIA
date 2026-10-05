/**
 * Finishes the shareable static package after `vite build --mode static`.
 *
 *   share/you-matter-media/
 *     index.html about.html services.html work.html clients.html contact.html
 *     css/style.css   js/script.js   images/…   README.txt
 *   share/you-matter-media.zip
 *
 * Every page file is the same shell — one classic script, one stylesheet —
 * told which page it is by <html data-route>. Run through `npm run build:static`.
 */
import { execFileSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const shareDir = path.join(root, 'share')
const out = path.join(shareDir, 'you-matter-media')
const zipPath = path.join(shareDir, 'you-matter-media.zip')
const ORIGIN = 'https://youmattermedia.in'

const { PAGES } = await import(pathToFileURL(path.join(root, 'src/data/site.js')).href)
// Mirrors ARRIVAL_KEY in src/lib/staticSite.js (which can't be imported here:
// it reads Vite's import.meta.env).
const ARRIVAL_KEY = 'ymm:arrival'

const fail = (msg) => {
  console.error(`\n✗ package-static: ${msg}\n`)
  process.exit(1)
}

// ---------------------------------------------------------------- images ----
// Everything the pages use from /public goes under images/, keeping its folders.
const PUBLIC_FILES = [
  'favicon.svg',
  'favicon-32.png',
  'apple-touch-icon.png',
  'logo.svg',
  'logo-512.png',
  'og.jpg',
]
const images = path.join(out, 'images')
fs.mkdirSync(images, { recursive: true })
for (const dir of ['work', 'logos']) {
  fs.cpSync(path.join(root, 'public', dir), path.join(images, dir), { recursive: true })
}
for (const file of PUBLIC_FILES) fs.copyFileSync(path.join(root, 'public', file), path.join(images, file))

// ----------------------------------------------------------------- pages ----
const template = fs.readFileSync(path.join(out, 'index.html'), 'utf8')

// Must match the colour of .page-curtain (--color-band in src/index.css).
const CURTAIN = '#d6341f'

// Arriving from an in-site link, the previous page left the curtain closed.
// Paint its colour before the script loads, so the swap never flashes white.
const ARRIVAL_PAINT = `
    <script>
      try {
        var a = JSON.parse(sessionStorage.getItem('${ARRIVAL_KEY}') || 'null')
        if (a && a.to === document.documentElement.getAttribute('data-route') &&
            !matchMedia('(prefers-reduced-motion: reduce)').matches) {
          document.documentElement.className += ' ymm-arriving'
        }
      } catch (e) {}
    </script>
    <style>
      html.ymm-arriving, html.ymm-arriving body { background: ${CURTAIN}; }
    </style>`

const escapeHtml = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;')

function replaceOnce(html, from, to, what) {
  if (!html.includes(from)) fail(`could not find ${what} in the built index.html`)
  return html.replace(from, to)
}

function buildPage(page) {
  let html = template

  html = replaceOnce(html, '<html lang="en">', `<html lang="en" data-route="${page.path}">`, '<html>')

  // One classic, deferred script: module scripts are blocked on file://.
  html = html.replace(/\s*<script type="module" crossorigin src="\.\/js\/script\.js"><\/script>/, '')
  html = replaceOnce(html, '<div id="root"></div>', '<div id="root"></div>\n    <script defer src="./js/script.js"></script>', '#root')
  html = html.replace(/<link rel="stylesheet" crossorigin href="\.\/css\/style\.css">/, '<link rel="stylesheet" href="./css/style.css">')

  // Root-relative files from /public now live in ./images/.
  html = html.replace(/(href|content)="\/((?:favicon|apple-touch-icon|logo|og)[^"]*)"/g, '$1="./images/$2"')

  // This page's own title and address (the script sets the same at runtime).
  const title = escapeHtml(page.title)
  html = html.replace(/<title>[^<]*<\/title>/, `<title>${title}</title>`)
  html = html.replace(/(property="og:title" content=")[^"]*"/, `$1${title}"`)
  html = html.replace(/(name="twitter:title" content=")[^"]*"/, `$1${title}"`)
  html = html.replace(/(rel="canonical" href=")[^"]*"/, `$1${ORIGIN}${page.path}"`)
  html = html.replace(/(property="og:url" content=")[^"]*"/, `$1${ORIGIN}${page.path}"`)

  html = replaceOnce(html, '\n  </head>', `${ARRIVAL_PAINT}\n  </head>`, '</head>')
  return html
}

const files = []
for (const page of Object.values(PAGES)) {
  const file = page.path === '/' ? 'index.html' : `${page.path.slice(1)}.html`
  fs.writeFileSync(path.join(out, file), buildPage(page))
  files.push(file)
}

// ---------------------------------------------------------------- checks ----
// Nothing may point at the drive root, a dev server or this machine.
for (const file of [...files, 'css/style.css']) {
  const text = fs.readFileSync(path.join(out, file), 'utf8')
  const bad =
    text.match(/(?:src|href|content)="\/(?!\/)[^"]*"/) ||
    text.match(/url\(\s*['"]?\/(?!\/)[^)]*\)/) ||
    text.match(/localhost|127\.0\.0\.1|[A-Z]:\\\\|\/Users\/|type="module"|\/src\/main/)
  if (bad) fail(`${file} still contains "${bad[0]}"`)
}
// Every image the site names must be in the package.
const script = fs.readFileSync(path.join(out, 'js/script.js'), 'utf8')
const named = new Set([...script.matchAll(/\/(work|logos)\/([\w-]+\.webp)/g)].map((m) => `${m[1]}/${m[2]}`))
for (const rel of named) {
  if (!rel.includes('${') && !fs.existsSync(path.join(images, rel))) fail(`missing image images/${rel}`)
}

// ---------------------------------------------------------------- readme ----
fs.writeFileSync(
  path.join(out, 'README.txt'),
  `YOU MATTER MEDIA — WEBSITE
==========================

HOW TO OPEN
-----------
1. Extract you-matter-media.zip (right-click > Extract All...).
   Open it from the extracted folder, not from inside the zip.
2. Open the "you-matter-media" folder.
3. Double-click index.html. It opens in your web browser
   (Chrome or Edge recommended).

No installation, no server and no internet setup are needed.

PAGES
-----
  index.html      Home
  about.html      About
  services.html   Services
  work.html       Work
  clients.html    Clients
  contact.html    Contact

Any page can be opened directly; the menu moves between them.

WHAT NEEDS AN INTERNET CONNECTION
---------------------------------
The website itself, its images and its animations all work offline.
With a connection you also get:
  - The two brand fonts (League Gothic and Poppins, from Google Fonts).
    Offline, similar fonts already on the computer are used instead,
    so the text looks slightly different but everything still works.
  - The Google Maps link and the social media links (Facebook,
    Instagram, YouTube, LinkedIn, WhatsApp), which open those sites.

THE CONTACT FORM
----------------
The form checks what is typed, but it cannot send messages by itself:
sending needs an email/form service (for example Formspree), which
this package does not include. Until one is connected, pressing
"Start a Conversation" asks the visitor to call +91-90304 04445
instead, and nothing is lost or falsely reported as sent.
The phone number and "Call Now" buttons work normally (tel: links).

To connect a form service, a developer sets VITE_CONTACT_ENDPOINT in the
project source and rebuilds this package with: npm run build:static

FOLDERS
-------
  css/style.css   the site's styles
  js/script.js    the site's code (everything in one file)
  images/         every image, logo and icon the site uses
`.replace(/\n/g, '\r\n'),
)

// ------------------------------------------------------------------- zip ----
// The zip holds the you-matter-media/ folder itself, so extracting it gives
// one tidy folder. Windows' own tar.exe writes a standard zip ("-a" picks the
// format from the extension) with forward-slash paths that open anywhere.
fs.rmSync(zipPath, { force: true })
if (process.platform === 'win32') {
  const tar = path.join(process.env.SystemRoot || 'C:\\Windows', 'System32', 'tar.exe')
  execFileSync(tar, ['-a', '-c', '-f', zipPath, '-C', shareDir, 'you-matter-media'], { stdio: 'inherit' })
} else {
  execFileSync('zip', ['-rq', zipPath, 'you-matter-media'], { cwd: shareDir, stdio: 'inherit' })
}

const count = (dir) =>
  fs.readdirSync(dir, { withFileTypes: true }).reduce(
    (n, d) => n + (d.isDirectory() ? count(path.join(dir, d.name)) : 1),
    0,
  )
console.log(`\n✓ Static site: ${out} (${count(out)} files: ${files.join(', ')})`)
console.log(`✓ Zip:         ${zipPath} (${(fs.statSync(zipPath).size / 1048576).toFixed(1)} MB)\n`)
