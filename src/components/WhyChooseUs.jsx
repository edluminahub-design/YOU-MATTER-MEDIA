import { WHY } from '@/data/site'
import Reveal from './Reveal'

export default function WhyChooseUs() {
  return (
    <section className="on-band bg-[var(--color-band)] py-24 text-[var(--color-paper)] sm:py-32 lg:py-40">
      <div className="shell">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-5">
            <Reveal>
              <p className="eyebrow text-[var(--color-accent-lift)]">Why Choose You Matter?</p>
            </Reveal>

            <Reveal
              as="h2"
              variant="mask"
              delay={90}
              className="mt-5 text-[clamp(1.75rem,3.6vw,2.75rem)] font-semibold leading-tight"
            >
              Because the right partner will put in equal work as you would.
            </Reveal>
          </div>

          <ul className="lg:col-span-7">
            {WHY.map((line, i) => (
              <li
                key={line}
                className="group flex items-baseline gap-5 border-b border-[var(--color-paper)]/15 py-6 first:border-t sm:gap-8"
              >
                <Reveal
                  as="span"
                  delay={i * 90 + 120}
                  className="shrink-0 text-xs font-semibold tracking-widest text-[var(--color-accent-lift)]"
                >
                  0{i + 1}
                </Reveal>
                <Reveal
                  as="span"
                  variant="mask"
                  delay={i * 90}
                  className="block text-[clamp(1.375rem,4vw,2.75rem)] font-semibold leading-[1.15] transition-transform duration-500 ease-[var(--ease-out-expo)] group-hover:translate-x-2"
                >
                  {line}
                </Reveal>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-16 border-t border-[var(--color-paper)]/15 pt-12">
          <Reveal as="p" variant="mask" className="display text-[clamp(2rem,6.5vw,5rem)]">
            We are not your service-providers.
            <br />
            <span className="text-[var(--color-accent-lift)]">
              We are your partners for the long run.
            </span>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
