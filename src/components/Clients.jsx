import { CLIENTS } from '@/data/site'
import { asset } from '@/lib/staticSite'
import Reveal from './Reveal'

export default function Clients() {
  return (
    <section
      id="clients"
      className="border-y border-[var(--color-rule)] bg-[var(--color-shell)] py-24 sm:py-32"
    >
      <div className="shell">
        {/* "Our Clients" / "In good company" and the lede now open the
            Clients page, in its PageHeader. */}
        {/* Separate tiles rather than a gap-px grid with a coloured backdrop:
            21 logos leave the same balanced 4-up layout on larger screens, and a shared backdrop
            renders those gaps as stray blocks. Each tile is painted in
            --color-paper so a logo's own ground disappears into it. */}
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
          {CLIENTS.map((c, i) => (
            <Reveal
              as="li"
              key={c.slug}
              delay={Math.min(i, 8) * 50}
              className="group flex min-h-[8.5rem] items-center justify-center rounded-2xl border border-transparent bg-[var(--color-paper)] p-5 transition-[transform,border-color,box-shadow] duration-500 ease-[var(--ease-out-expo)] hover:-translate-y-1 hover:border-[var(--color-accent)]/35 hover:shadow-[0_18px_40px_-28px_rgba(255,80,58,0.55)] sm:min-h-[10rem] sm:p-7"
            >
              <img
                src={asset(`/logos/${c.slug}.${c.extension ?? 'webp'}`)}
                alt={c.name}
                width={c.width ?? 560}
                height={c.height ?? 320}
                loading="lazy"
                decoding="async"
                // Every logo file shares one 560×320 canvas, so a single width
                // makes the whole wall optically even without per-logo tuning.
                // Opacity rather than greyscale: several of these marks carry
                // their meaning in colour.
                className="w-full max-w-[12.5rem] opacity-80 transition-opacity duration-500 group-hover:opacity-100"
              />
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  )
}
