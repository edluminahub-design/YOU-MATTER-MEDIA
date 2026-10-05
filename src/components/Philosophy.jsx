import { BELIEFS } from '@/data/site'
import Reveal from './Reveal'

export default function Philosophy() {
  return (
    <section className="border-y border-[var(--color-rule)] py-24 sm:py-32 lg:py-40">
      <div className="shell">
        <Reveal>
          <p className="eyebrow text-[var(--color-accent)]">Our Philosophy</p>
          <p className="mt-4 text-lg text-[var(--color-ink-soft)]">
            We matter to you because we believe:
          </p>
        </Reveal>

        <ul className="mt-12">
          {BELIEFS.map((b, i) => (
            <li
              key={b.emph}
              className="group flex flex-col gap-2 border-t border-[var(--color-rule)] py-7 sm:flex-row sm:items-baseline sm:gap-8"
            >
              <Reveal
                as="span"
                delay={i * 70}
                className="shrink-0 pt-2 text-xs font-semibold tracking-widest text-[var(--color-accent)]"
              >
                0{i + 1}
              </Reveal>
              <Reveal
                as="p"
                variant="mask"
                delay={i * 70 + 60}
                className="text-[clamp(1.5rem,4.4vw,3.25rem)] font-semibold leading-[1.12]"
              >
                {b.text} <em className="not-italic text-[var(--color-accent)]">{b.emph}</em>
              </Reveal>
            </li>
          ))}
        </ul>

        <div className="mt-16 grid gap-10 border-t border-[var(--color-rule)] pt-12 lg:grid-cols-12">
          <Reveal className="lg:col-span-6">
            <p className="text-[clamp(1.25rem,2.4vw,1.75rem)] font-medium leading-snug">
              We don&rsquo;t chase after rainbows. We build systems that move mountains — and we
              treat your brand like it matters.{' '}
              <em className="not-italic text-[var(--color-accent)]">Because it does.</em>
            </p>
          </Reveal>

          <Reveal
            variant="mask"
            delay={120}
            className="display text-[clamp(1.75rem,3.6vw,2.75rem)] lg:col-span-5 lg:col-start-8"
          >
            No excess. No drama.
            <br />
            No hollow promises.
            <br />
            <span className="text-[var(--color-accent)]">Only work that stands.</span>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
