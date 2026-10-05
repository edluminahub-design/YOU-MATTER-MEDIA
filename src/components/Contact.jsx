import { useRef, useState } from 'react'
import { CONTACT } from '@/data/site'
import { sendEnquiry } from '@/lib/enquiry'
import Reveal from './Reveal'

const TOPICS = [
  'Real estate',
  'Education',
  'Hospitality',
  'Healthcare',
  'Luxury retail',
  'Finance',
  'Personal brand',
  'Other',
]

const EMPTY = { name: '', email: '', company: '', phone: '', topic: '', message: '' }

// Contact details offered beside the form.
const PHONE = CONTACT.phone
const PHONE_HREF = `tel:${PHONE.replace(/[^+\d]/g, '')}` // tel:+919030404445
const PRIMARY_PHONE = CONTACT.primaryPhone
const PRIMARY_PHONE_HREF = `tel:${PRIMARY_PHONE.replace(/[^+\d]/g, '')}` // tel:+918712443605
const EMAIL_HREF = `mailto:${CONTACT.email}`

/**
 * Validates the whole form at once and returns a field -> message map.
 * Validating on submit (then re-validating on change once a field has erred)
 * avoids shouting at someone who is still halfway through typing their email.
 */
function validate(values) {
  const errors = {}

  if (!values.name.trim()) errors.name = 'Please tell us your name.'

  if (!values.email.trim()) {
    errors.email = 'Please add an email so we can reply.'
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(values.email.trim())) {
    errors.email = 'That email address doesn’t look right.'
  }

  // Required, and it has to be something we can actually dial.
  if (!values.phone.trim()) {
    errors.phone = 'Please enter your phone number.'
  } else if (!/^[+\d][\d\s()-]{6,}$/.test(values.phone.trim())) {
    errors.phone = 'That phone number doesn’t look right.'
  }

  if (!values.topic) errors.topic = 'Pick the closest option.'

  if (!values.message.trim()) {
    errors.message = 'A line or two about your project helps us reply properly.'
  } else if (values.message.trim().length < 10) {
    errors.message = 'Just a little more detail, please.'
  }

  return errors
}

function Field({ id, label, error, children, className = '' }) {
  return (
    <div className={className}>
      <label htmlFor={id} className="block text-sm font-semibold">
        {label}
      </label>
      {children}
      {error && (
        <p id={`${id}-error`} className="mt-1.5 text-sm font-medium text-[var(--color-accent-deep)]">
          {error}
        </p>
      )}
    </div>
  )
}

const inputCls = (invalid) =>
  `mt-2 w-full rounded-xl border bg-[var(--color-shell)] px-4 py-3 text-base outline-none transition-[border-color,background-color] duration-300 placeholder:text-[var(--color-ink-soft)]/75 focus:border-[var(--color-accent)] ${
    invalid ? 'border-[var(--color-accent-deep)]' : 'border-[var(--color-rule)]'
  }`

export default function Contact() {
  const [values, setValues] = useState(EMPTY)
  const [errors, setErrors] = useState({})
  // idle → sending → sent | failed | unavailable
  const [status, setStatus] = useState('idle')
  const formRef = useRef(null)
  const noticeRef = useRef(null)

  const update = (key) => (e) => {
    const next = { ...values, [key]: e.target.value }
    setValues(next)
    // Once a field has shown an error, correct it live so the fix is visible.
    if (errors[key]) setErrors(validate(next))
  }

  const onSubmit = async (e) => {
    e.preventDefault()
    if (status === 'sending') return

    const found = validate(values)
    setErrors(found)

    const firstBad = Object.keys(found)[0]
    if (firstBad) {
      formRef.current?.querySelector(`#${firstBad}`)?.focus()
      return
    }

    setStatus('sending')
    const result = await sendEnquiry(values)
    setStatus(result)
    // Only a delivered enquiry clears the form; anything else keeps what the
    // visitor typed so nothing is lost.
    if (result === 'sent') setValues(EMPTY)
    else requestAnimationFrame(() => noticeRef.current?.focus())
  }

  return (
    <section id="contact" className="pb-16 pt-2 sm:pb-20">
      <div className="shell">
        {/* The eyebrow, "If you’re building something that matters — let’s
            talk." and its lede now open the Contact page, in its PageHeader. */}
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
          {/* Contact details and a button that dials the primary number. Centred
              against the (much taller) form on wide screens, so it doesn't
              sit at the top with a gap beneath. */}
          <Reveal className="lg:col-span-4 lg:self-center">
            <div className="mb-10">
              <p id="contact-mail" className="eyebrow flex text-[var(--color-ink-soft)]">
                Mail ID
              </p>
              <a
                href={EMAIL_HREF}
                aria-describedby="contact-mail"
                className="link-draw mt-3 block whitespace-nowrap text-lg font-semibold transition-colors duration-300 hover:text-[var(--color-accent)]"
              >
                {CONTACT.email}
              </a>
            </div>

            <p id="contact-phone" className="eyebrow flex text-[var(--color-ink-soft)]">
              Phone
            </p>
            <a
              href={PRIMARY_PHONE_HREF}
              aria-describedby="contact-phone"
              className="link-draw mt-3 block whitespace-nowrap text-2xl font-semibold transition-colors duration-300 hover:text-[var(--color-accent)]"
            >
              {PRIMARY_PHONE}
            </a>
            <a
              href={PHONE_HREF}
              className="link-draw mt-2 block whitespace-nowrap text-2xl font-semibold transition-colors duration-300 hover:text-[var(--color-accent)]"
            >
              {PHONE}
            </a>

            <div>
              <a href={PRIMARY_PHONE_HREF} className="btn btn-accent mt-8">
                Call Now
              </a>
            </div>
          </Reveal>

          <Reveal delay={100} className="lg:col-span-8">
            {status === 'sent' ? (
              <div
                role="status"
                className="rounded-3xl border border-[var(--color-rule)] bg-[var(--color-shell)] p-8 sm:p-12"
              >
                <p className="display text-[clamp(2rem,5vw,3.5rem)] text-[var(--color-accent)]">
                  Thank you.
                </p>
                <p className="mt-4 max-w-md text-lg leading-relaxed text-[var(--color-ink-soft)]">
                  Your enquiry is on its way &mdash; we&rsquo;ll be in touch soon. If it&rsquo;s
                  urgent, call us on{' '}
                  <a
                    href={PHONE_HREF}
                    className="font-semibold whitespace-nowrap text-[var(--color-ink)] underline underline-offset-4"
                  >
                    {PHONE}
                  </a>
                  .
                </p>
                <button type="button" onClick={() => setStatus('idle')} className="btn btn-outline mt-8">
                  Send another
                </button>
              </div>
            ) : (
              <form
                ref={formRef}
                onSubmit={onSubmit}
                noValidate
                aria-labelledby="contact-form-title"
                className="grid gap-6 sm:grid-cols-2"
              >
                <h2
                  id="contact-form-title"
                  className="text-[clamp(1.25rem,2.4vw,1.75rem)] font-medium leading-snug sm:col-span-2"
                >
                  Feel free to contact us<span className="text-[var(--color-accent)]">.</span>
                </h2>

                <Field id="name" label="Name" error={errors.name}>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    autoComplete="name"
                    value={values.name}
                    onChange={update('name')}
                    aria-invalid={Boolean(errors.name)}
                    aria-describedby={errors.name ? 'name-error' : undefined}
                    className={inputCls(errors.name)}
                    placeholder="Your name"
                  />
                </Field>

                <Field id="email" label="Email" error={errors.email}>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    value={values.email}
                    onChange={update('email')}
                    aria-invalid={Boolean(errors.email)}
                    aria-describedby={errors.email ? 'email-error' : undefined}
                    className={inputCls(errors.email)}
                    placeholder="you@company.com"
                  />
                </Field>

                <Field id="company" label="Company (optional)" error={errors.company}>
                  <input
                    id="company"
                    name="company"
                    type="text"
                    autoComplete="organization"
                    value={values.company}
                    onChange={update('company')}
                    className={inputCls(false)}
                    placeholder="Company or brand"
                  />
                </Field>

                <Field id="phone" label="Phone (required)" error={errors.phone}>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    autoComplete="tel"
                    required
                    aria-required="true"
                    value={values.phone}
                    onChange={update('phone')}
                    aria-invalid={Boolean(errors.phone)}
                    aria-describedby={errors.phone ? 'phone-error' : undefined}
                    className={inputCls(errors.phone)}
                    placeholder="+91"
                  />
                </Field>

                <Field
                  id="topic"
                  label="What can we help you with?"
                  error={errors.topic}
                  className="sm:col-span-2"
                >
                  <select
                    id="topic"
                    name="topic"
                    value={values.topic}
                    onChange={update('topic')}
                    aria-invalid={Boolean(errors.topic)}
                    aria-describedby={errors.topic ? 'topic-error' : undefined}
                    className={inputCls(errors.topic)}
                  >
                    <option value="">Choose the closest fit…</option>
                    {TOPICS.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </Field>

                <Field id="message" label="Message" error={errors.message} className="sm:col-span-2">
                  <textarea
                    id="message"
                    name="message"
                    rows={5}
                    value={values.message}
                    onChange={update('message')}
                    aria-invalid={Boolean(errors.message)}
                    aria-describedby={errors.message ? 'message-error' : undefined}
                    className={`${inputCls(errors.message)} resize-y`}
                    placeholder="Tell us what you're building."
                  />
                </Field>

                {(status === 'failed' || status === 'unavailable') && (
                  <div
                    ref={noticeRef}
                    tabIndex={-1}
                    role="alert"
                    className="rounded-2xl border border-[var(--color-accent)]/40 bg-[var(--color-shell)] p-5 outline-none sm:col-span-2"
                  >
                    <p className="font-semibold">
                      {status === 'failed' ? 'Something went wrong. Please try again.' : 'Online enquiries aren’t available just yet.'}
                    </p>
                    <p className="mt-1 text-[var(--color-ink-soft)]">
                      {status === 'failed' ? 'Please try again, or call us on ' : 'Please call us on '}
                      <a
                        href={PHONE_HREF}
                        className="whitespace-nowrap font-semibold text-[var(--color-accent)] underline underline-offset-4"
                      >
                        {PHONE}
                      </a>
                      . Your details are still here.
                    </p>
                  </div>
                )}

                <div className="sm:col-span-2">
                  <button
                    type="submit"
                    disabled={status === 'sending'}
                    aria-busy={status === 'sending'}
                    className="btn btn-accent w-full disabled:cursor-progress disabled:opacity-70 sm:w-auto"
                  >
                    {status === 'sending' ? 'Sending…' : 'Start a Conversation'}
                  </button>
                </div>
              </form>
            )}
          </Reveal>
        </div>
      </div>
    </section>
  )
}
