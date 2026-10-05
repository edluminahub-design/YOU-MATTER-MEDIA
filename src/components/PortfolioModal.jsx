import { useEffect, useRef } from 'react'
import { useScrollLock } from '@/hooks/useScrollLock'
import TransitionLink from './TransitionLink'

const FOCUSABLE = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'

/**
 * Project detail overlay.
 *
 * Presented as a modal dialog: focus moves in on open, is trapped while open,
 * and returns to the card that launched it on close. Escape and a backdrop
 * click both dismiss.
 */
export default function PortfolioModal({ project, onClose }) {
  const panelRef = useRef(null)
  const closeRef = useRef(null)
  const openerRef = useRef(null)

  useScrollLock(Boolean(project))

  useEffect(() => {
    if (!project) return

    openerRef.current = document.activeElement
    closeRef.current?.focus()

    const onKey = (e) => {
      if (e.key === 'Escape') {
        onClose()
        return
      }
      if (e.key !== 'Tab') return

      const items = panelRef.current?.querySelectorAll(FOCUSABLE)
      if (!items?.length) return

      const first = items[0]
      const last = items[items.length - 1]

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('keydown', onKey)
      // Returning focus to the launching card keeps keyboard position in the
      // grid instead of dumping the visitor back at the top of the document.
      openerRef.current?.focus?.()
    }
  }, [project, onClose])

  if (!project) return null

  return (
    <div
      className="fixed inset-0 z-[60] overflow-y-auto overscroll-contain bg-[var(--color-accent-2)]/80 p-4 backdrop-blur-md sm:p-8"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="project-title"
        className="mx-auto my-4 w-full max-w-5xl rounded-3xl bg-[var(--color-paper)] shadow-2xl"
      >
        <div className="sticky top-0 z-10 flex items-start justify-between gap-6 rounded-t-3xl border-b border-[var(--color-rule)] bg-[var(--color-paper)] p-6 sm:p-8">
          <div className="min-w-0">
            <p className="eyebrow text-[var(--color-accent)]">{project.discipline}</p>
            <h2 id="project-title" className="mt-2 text-2xl font-semibold leading-tight sm:text-3xl">
              {project.title}
            </h2>
            <p className="mt-1 text-sm text-[var(--color-ink-soft)]">{project.client}</p>
          </div>

          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[var(--color-rule)] transition-colors hover:border-[var(--color-accent)] hover:bg-[var(--color-accent)] hover:text-[var(--color-paper)]"
          >
            <span className="sr-only">Close project</span>
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <div className="p-6 sm:p-8">
          <p className="max-w-2xl text-lg leading-relaxed text-[var(--color-ink-soft)]">
            {project.body}
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {project.gallery.map((img, i) => (
              <figure
                key={img.src + i}
                // A single image gets the full width; a pair or more sits two-up.
                className={`overflow-hidden rounded-2xl bg-[var(--color-shell)] ${
                  project.gallery.length === 1 ? 'sm:col-span-2' : ''
                }`}
              >
                <img
                  src={img.src}
                  srcSet={img.srcSet}
                  sizes="(min-width: 640px) 45vw, 90vw"
                  width={img.width}
                  height={img.height}
                  alt={img.alt}
                  loading="lazy"
                  decoding="async"
                  className="w-full"
                />
              </figure>
            ))}
          </div>

          <div className="mt-10 flex flex-wrap items-center gap-3 border-t border-[var(--color-rule)] pt-8">
            {/* Closes the dialog first, so its scroll lock is released before
                the transition resets the window to the top. */}
            <TransitionLink to="/contact" onNavigate={onClose} className="btn btn-accent">
              Start a project like this
            </TransitionLink>
            <button type="button" onClick={onClose} className="btn btn-outline">
              Back to work
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
