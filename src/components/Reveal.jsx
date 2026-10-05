import { useReveal } from '@/hooks/useReveal'

const VARIANTS = {
  /** Fade and rise. The default, for blocks of content. */
  up: 'reveal',
  /** Wipe upward from the baseline. For headings. */
  mask: 'reveal-mask',
  /** Frame opens while the picture settles back to 1:1. For imagery. */
  media: 'reveal-media',
  /** Wipe plus a short lift out of a tilt. For page titles only. */
  title: 'reveal-title',
  /** A hairline drawing left to right. */
  rule: 'reveal-rule',
}

/**
 * Wraps children in a scroll reveal. `delay` staggers siblings in a list.
 *
 * `as` lets a reveal be a semantic element (li, section, figure…) rather than
 * forcing a wrapper div into the markup where one would be wrong.
 */
export default function Reveal({
  as: Tag = 'div',
  variant = 'up',
  delay = 0,
  className = '',
  style,
  ...rest
}) {
  const ref = useReveal()

  return (
    <Tag
      ref={ref}
      data-revealed="false"
      className={`${VARIANTS[variant] ?? VARIANTS.up} ${className}`}
      style={delay ? { ...style, '--reveal-delay': `${delay}ms` } : style}
      {...rest}
    />
  )
}
