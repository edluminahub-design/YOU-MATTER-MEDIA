import { ROLES } from '@/data/site'
import Reveal from './Reveal'
import TransitionLink from './TransitionLink'

export default function AboutUs() {
  return (
    <section className="shell pb-24 pt-4 sm:pb-32 lg:pb-40">
      <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
        {/* The section's eyebrow and "We are many things, but mostly we are:"
            now open the About page, in its PageHeader. */}
        <div className="lg:col-span-5">
          <Reveal delay={120}>
            <p className="text-lg leading-relaxed text-[var(--color-ink-soft)]">
              More importantly —{' '}
              <strong className="font-bold text-[var(--color-ink)]">we are partners.</strong> We
              think. We laugh. And we hold each other accountable, like families do.
            </p>

            <p className="mt-6 text-lg leading-relaxed text-[var(--color-ink-soft)]">
              If you care deeply about what you&rsquo;re building — you&rsquo;ll feel at home here.
            </p>

            <TransitionLink to="/services" className="btn btn-outline mt-9">
              See what we do
            </TransitionLink>
          </Reveal>
        </div>

        {/* The roles are the section's image. Set large and flush, they carry
            the block visually so it needs no stock photography. */}
        <ul className="lg:col-span-7">
          {ROLES.map((role, i) => (
            <li
              key={role}
              className="group flex items-baseline justify-between gap-6 border-b border-[var(--color-rule)] first:border-t"
            >
              <Reveal
                as="span"
                variant="mask"
                delay={i * 70}
                className="display block py-4 text-[clamp(2.25rem,6.5vw,4.5rem)] italic text-[var(--color-ink)] transition-[transform,color] duration-500 ease-[var(--ease-out-expo)] group-hover:translate-x-3 group-hover:text-[var(--color-accent)]"
              >
                {role}
              </Reveal>
              {/* Revealed with its word, so a number never arrives alone. */}
              <Reveal
                as="span"
                delay={i * 70 + 120}
                className="shrink-0 text-xs font-semibold tracking-widest text-[var(--color-ink-soft)] transition-colors duration-500 group-hover:text-[var(--color-accent)]"
              >
                0{i + 1}
              </Reveal>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
