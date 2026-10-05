import Reveal from './Reveal'

/**
 * Vision and Mission as two deliberately unlike blocks: the vision is short and
 * set on red, the mission is long and set on paper. Making them identical cards
 * would flatten the difference between a one-line ambition and a manifesto.
 */
export default function VisionMission() {
  return (
    <section className="shell grid gap-6 py-24 sm:py-32 lg:grid-cols-2 lg:gap-8">
      <Reveal className="on-band group flex flex-col justify-between rounded-3xl bg-[var(--color-band)] p-8 text-[var(--color-paper)] sm:p-12">
        <p className="eyebrow text-[var(--color-accent-lift)]">Vision</p>

        <p className="mt-10 text-[clamp(1.5rem,3vw,2.375rem)] font-semibold leading-[1.15]">
          To nurture brands and businesses that shape culture, influence markets, and create lasting
          impact.
        </p>

        <p className="display mt-10 text-[clamp(1.75rem,4vw,3rem)] text-[var(--color-accent-lift)]">
          Your work should outlive you.
        </p>
      </Reveal>

      <Reveal
        delay={120}
        className="flex flex-col justify-between rounded-3xl border border-[var(--color-rule)] bg-[var(--color-shell)] p-8 transition-colors duration-500 hover:border-[var(--color-accent)]/50 sm:p-12"
      >
        <p className="eyebrow text-[var(--color-accent)]">Mission</p>

        <p className="mt-10 text-[clamp(1.25rem,2.4vw,1.75rem)] font-medium leading-snug">
          We call ourselves <strong className="font-bold">You Matter</strong> because you matter. You
          matter, we matter, and the world around us matters — to one another.
        </p>

        <p className="mt-6 text-lg leading-relaxed text-[var(--color-ink-soft)]">
          To create a world that matters, one should take matters into their own hands. So we did —
          we took up the mission.
        </p>
      </Reveal>
    </section>
  )
}
