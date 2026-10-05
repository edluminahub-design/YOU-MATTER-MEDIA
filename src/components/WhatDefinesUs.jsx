import Reveal from './Reveal'

const QUESTIONS = ['What you stand for.', 'What differentiates you.', 'What must change for you to grow.']

export default function WhatDefinesUs() {
  return (
    <section
      id="about"
      className="border-y border-[var(--color-rule)] bg-[var(--color-shell)] py-24 sm:py-32 lg:py-40"
    >
      <div className="shell">
        <Reveal>
          <p className="eyebrow text-[var(--color-accent)]">What Defines Us</p>
        </Reveal>

        <div className="mt-10 grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <Reveal as="h2" variant="mask" className="text-[clamp(2rem,4.6vw,3.75rem)] font-semibold leading-[1.1]">
              We stand at the crossroads of clarity and excellence.
            </Reveal>
            <Reveal delay={120}>
              <p className="mt-6 text-lg text-[var(--color-ink-soft)]">We start with understanding:</p>
            </Reveal>
          </div>

          <div className="lg:col-span-5">
            <ol className="border-t border-[var(--color-rule)]">
              {QUESTIONS.map((q, i) => (
                <Reveal
                  as="li"
                  key={q}
                  delay={140 + i * 90}
                  className="flex items-baseline gap-5 border-b border-[var(--color-rule)] py-5"
                >
                  <span className="shrink-0 text-xs font-semibold tracking-widest text-[var(--color-accent)]">
                    0{i + 1}
                  </span>
                  <span className="text-[clamp(1.125rem,2.2vw,1.5rem)] font-medium italic">{q}</span>
                </Reveal>
              ))}
            </ol>

            <Reveal delay={420}>
              <p className="mt-6 text-lg text-[var(--color-ink-soft)]">
                From there, we design roads ahead.
              </p>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  )
}
