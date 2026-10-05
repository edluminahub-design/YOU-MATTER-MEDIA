import { CONTACT, NAV, SERVICES } from '@/data/site'
import Logo from './Logo'
import TransitionLink from './TransitionLink'

const PHONE = CONTACT.phone
const PRIMARY_PHONE = CONTACT.primaryPhone
const EMAIL_HREF = `mailto:${CONTACT.email}`

export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer
      className="on-ink border-t border-[var(--color-paper)]/10 bg-[var(--color-footer)] text-[var(--color-paper)]"
      style={{
        '--color-footer': '#E8DFD6',
        '--color-paper': '#2F3437',
        '--color-accent': '#FF4F43',
        '--color-accent-deep': '#FF4F43',
        '--color-accent-on-ink': '#FF4F43',
        '--color-ink-soft': '#596064',
      }}
    >
      <div className="shell py-16 sm:py-20">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-8">
          <div className="lg:col-span-5">
            <Logo label="You Matter Media" className="block h-20 w-auto sm:h-24" />

            <p className="mt-6 max-w-xs text-lg italic text-[var(--color-paper)]/75">
              Because you matter to the world.
            </p>
          </div>

          <nav aria-label="Footer" className="lg:col-span-2">
            <h2 className="eyebrow text-[var(--color-paper)]/50">Navigate</h2>
            <ul className="mt-5 space-y-2.5">
              {NAV.map((item) => (
                <li key={item.key}>
                  <TransitionLink
                    nav
                    to={item.path}
                    className="link-draw text-sm text-[var(--color-paper)]/80 transition-colors duration-300 hover:text-[var(--color-accent-on-ink)] aria-[current=page]:text-[var(--color-accent-on-ink)]"
                  >
                    {item.label}
                  </TransitionLink>
                </li>
              ))}
            </ul>
          </nav>

          <div className="lg:col-span-2">
            <h2 className="eyebrow text-[var(--color-paper)]/50">Services</h2>
            <ul className="mt-5 space-y-2.5">
              {SERVICES.map((s) => (
                <li key={s.no}>
                  <TransitionLink
                    to="/services"
                    className="link-draw text-sm text-[var(--color-paper)]/80 transition-colors duration-300 hover:text-[var(--color-accent-on-ink)]"
                  >
                    {s.name}
                  </TransitionLink>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-3">
            <h2 className="eyebrow text-[var(--color-paper)]/50">Mail ID</h2>
            <ul className="mt-5 space-y-2.5 text-sm">
              <li>
                <a
                  href={EMAIL_HREF}
                    className="link-draw break-all text-[var(--color-ink-soft)] transition-colors duration-300 hover:text-[var(--color-accent-on-ink)]"
                >
                  {CONTACT.email}
                </a>
              </li>
            </ul>

            <h2 className="eyebrow mt-8 text-[var(--color-paper)]/50">Phone</h2>
            <ul className="mt-5 space-y-2.5 text-sm">
              <li>
                <a
                  href={`tel:${PRIMARY_PHONE.replace(/[^+\d]/g, '')}`}
                  className="link-draw text-[var(--color-ink-soft)] transition-colors duration-300 hover:text-[var(--color-accent-on-ink)]"
                >
                  {PRIMARY_PHONE}
                </a>
              </li>
              <li>
                <a
                  href={`tel:${PHONE.replace(/[^+\d]/g, '')}`}
                  className="link-draw text-[var(--color-ink-soft)] transition-colors duration-300 hover:text-[var(--color-accent-on-ink)]"
                >
                  {PHONE}
                </a>
              </li>
            </ul>

            <TransitionLink to="/contact" className="btn btn-accent mt-7 !px-6 !py-3 text-sm">
              Let&rsquo;s Talk
            </TransitionLink>
          </div>
        </div>

        <div className="mt-16 flex flex-col gap-3 border-t border-[var(--color-paper)]/15 pt-8 text-xs text-[var(--color-paper)]/55 sm:flex-row sm:items-center sm:justify-between">
          <p className="w-full text-center">
            &copy; {year} {CONTACT.name}. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
