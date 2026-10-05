import {
  IconBrandFacebook,
  IconBrandInstagram,
  IconBrandLinkedin,
  IconBrandWhatsapp,
  IconBrandX,
  IconBrandYoutube,
} from '@tabler/icons-react'
import { SOCIAL } from '@/data/site'

const ICONS = {
  facebook: IconBrandFacebook,
  x: IconBrandX,
  instagram: IconBrandInstagram,
  youtube: IconBrandYoutube,
  linkedin: IconBrandLinkedin,
  whatsapp: IconBrandWhatsapp,
}

/**
 * The social icons fixed to the right edge of every page.
 *
 * It lives in the layout, so it stays put while the page scrolls and across
 * page changes. Only profiles with a real URL are shown (see SOCIAL); each
 * opens in a new tab so the visitor keeps their place on the site.
 *
 * It sits under the navbar's mobile menu, the transition curtain, the loader
 * and the project dialog, so any of those covers it rather than the reverse.
 */
export default function SocialRail() {
  const links = SOCIAL.filter((s) => s.url)
  if (!links.length) return null

  return (
    <nav
      aria-label="Social media"
      className="social-rail fixed right-1.5 top-1/2 z-30 -translate-y-1/2 sm:right-4"
    >
      <ul className="flex flex-col gap-2 sm:gap-3">
        {links.map(({ key, label, url }) => {
          const Icon = ICONS[key]
          return (
            <li key={key}>
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`${label} (opens in a new tab)`}
                className="group flex h-8 w-8 items-center justify-center rounded-full border-[1.5px] border-[var(--color-accent)] bg-[var(--color-paper)] text-[var(--color-accent)] shadow-[0_6px_16px_-8px_rgba(255,80,58,0.45)] transition-[background-color,color,transform,box-shadow] duration-300 ease-[var(--ease-out-expo)] hover:-translate-x-1 hover:bg-[var(--color-accent)] hover:text-[var(--color-paper)] hover:shadow-[0_10px_22px_-10px_rgba(255,80,58,0.7)] sm:h-11 sm:w-11 sm:border-2"
              >
                {/* Smaller on phones, where the rail sits over the text's edge. */}
                <Icon aria-hidden="true" stroke={1.9} className="h-4 w-4 sm:h-[22px] sm:w-[22px]" />
              </a>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
