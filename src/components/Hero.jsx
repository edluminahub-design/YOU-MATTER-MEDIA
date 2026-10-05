import { asset } from '@/lib/staticSite'

/**
 * The home page's opening: a single full-width banner image.
 *
 * All of its wording is inside the picture, which neither search engines nor
 * screen readers can read — so the page's h1 carries the banner's headline
 * (visually hidden) and the alt text spells out the rest.
 */

const BANNER = {
  src: asset('/work/hero-banner-lg.webp'),
  srcSet: asset('/work/hero-banner-sm.webp 960w, /work/hero-banner-lg.webp 1910w'),
  width: 1910,
  height: 823,
  alt: 'Your Vision. Our Expertise. Digital Growth That Matters. Data-Driven Marketing. Real Business Impact. Strategy and consulting, social media marketing, performance advertising, SEO and content, website design and development, analytics and growth. A smiling man working at a laptop by a window over a city skyline, beside the words "Brands grow, people matter".',
}

export default function Hero() {
  return (
    <section id="top" style={{ paddingTop: 'var(--nav-h)' }}>
      {/* tabIndex -1: focused after in-site navigation back to Home. */}
      <h1 tabIndex={-1} className="sr-only">
        You Matter Media — Digital Growth That Matters.
      </h1>

      {/* The frame opens on load (anim-media) while the picture settles from
          a slight zoom (hero-photo) — the entrance the hero already had, and
          switched off under reduced motion. */}
      <figure className="anim-media hero-photo overflow-hidden" style={{ '--d': '120ms' }}>
        <img
          src={BANNER.src}
          srcSet={BANNER.srcSet}
          sizes="100vw"
          width={BANNER.width}
          height={BANNER.height}
          alt={BANNER.alt}
          // Above the fold, so it loads eagerly: no `loading` attribute.
          decoding="async"
          className="block h-auto w-full"
        />
      </figure>
    </section>
  )
}
