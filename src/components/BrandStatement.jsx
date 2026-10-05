import { asset } from '@/lib/staticSite'
import Reveal from './Reveal'

// The studio desk photograph, shown whole at its native 3:2 beside the heading.
const PHOTO = {
  src: asset('/work/hero-studio-lg.webp'),
  srcSet: asset('/work/hero-studio-sm.webp 800w, /work/hero-studio-lg.webp 1536w'),
  width: 1536,
  height: 1024,
  alt: 'A studio desk: books on brand strategy, marketing and design, a notebook of goals and ideas, printed moodboards and colour swatches, a laptop and a phone.',
}

export default function BrandStatement() {
  return (
    // Less space above than below: the banner overhead already ends in white,
    // so a full-height gap here read as an empty band.
    <section className="shell pb-24 pt-14 sm:pb-32 sm:pt-20 lg:pb-40 lg:pt-24">
      <div className="grid items-center gap-14 lg:grid-cols-12 lg:gap-10">
        <h2 className="display text-[clamp(2.75rem,9vw,8.5rem)] lg:col-span-7">
          <Reveal as="span" variant="mask" className="block">
            You matter
          </Reveal>{' '}
          <Reveal as="span" variant="mask" delay={110} className="block">
            to the world<span className="text-[var(--color-accent)]">.</span>
          </Reveal>
        </h2>

        <div className="lg:col-span-5">
          <div className="relative mx-auto w-full max-w-md lg:max-w-none">
            {/* Offset outline, a half-step behind the photograph. */}
            <Reveal
              aria-hidden="true"
              delay={200}
              className="absolute -right-5 -top-6 hidden h-full w-full rounded-[1.75rem] border border-[var(--color-accent)]/40 lg:block"
            />

            {/* The frame opens upward while the picture settles back to 1:1. */}
            <Reveal
              variant="media"
              delay={120}
              className="relative overflow-hidden rounded-[1.75rem] bg-[var(--color-shell)] shadow-[0_30px_60px_-45px_rgba(255,80,58,0.6)]"
            >
              <img
                src={PHOTO.src}
                srcSet={PHOTO.srcSet}
                sizes="(min-width: 1024px) 38vw, (min-width: 640px) 70vw, 90vw"
                width={PHOTO.width}
                height={PHOTO.height}
                alt={PHOTO.alt}
                loading="lazy"
                decoding="async"
                className="block w-full"
              />
            </Reveal>
          </div>
        </div>
      </div>

      <div className="mt-14 grid gap-10 lg:grid-cols-12">
        <Reveal delay={80} className="lg:col-span-5">
          <p className="text-[clamp(1.25rem,2.4vw,1.75rem)] font-medium leading-snug">
            You matter to us, and you matter to the world — and we make sure the world knows.
          </p>
        </Reveal>

        <Reveal delay={160} className="lg:col-span-6 lg:col-start-7">
          <p className="text-lg leading-relaxed text-[var(--color-ink-soft)]">
            In a world overflowing with content, your identity can get drowned out. When achieving
            visibility becomes rare,{' '}
            <em className="font-bold not-italic text-[var(--color-accent)]">significance matters.</em>
          </p>

          <p className="mt-6 text-lg leading-relaxed text-[var(--color-ink-soft)]">
            We are built for brands, businesses, and bold individuals whose ideas spin the world on
            its head. We design, strategize, market, and execute — but more importantly, we add
            meaning, and we make it matter.
          </p>
        </Reveal>
      </div>
    </section>
  )
}
