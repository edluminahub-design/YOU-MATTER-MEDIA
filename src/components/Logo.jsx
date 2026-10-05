import { LOGO } from '@/data/logo'

/**
 * The You Matter Media logo: cream League Gothic on the brand coral.
 *
 * The logo keeps its own colours rather than the interface red, as a logo
 * should. `plate={false}` drops the coral field for use on a surface that is
 * already coral (the opening screen).
 *
 * Decorative by default — the links that wrap it carry their own accessible
 * name. Pass `label` where the logo stands alone and needs one.
 */
export default function Logo({ className = '', label, plate = true, nameClass = '', mediaClass = '' }) {
  const a11y = label ? { role: 'img', 'aria-label': label } : { 'aria-hidden': true }

  return (
    <svg
      viewBox={`0 0 ${LOGO.width} ${LOGO.height}`}
      className={className}
      focusable="false"
      {...a11y}
    >
      {plate && <rect width={LOGO.width} height={LOGO.height} fill={LOGO.coral} />}
      <path className={nameClass} fill={LOGO.cream} d={LOGO.name} />
      <path className={mediaClass} fill={LOGO.cream} d={LOGO.media} />
    </svg>
  )
}
