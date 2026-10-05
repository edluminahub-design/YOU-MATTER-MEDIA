/**
 * Sends a contact-form enquiry.
 *
 * Enquiries go to a form service (Formspree or anything that accepts a JSON
 * POST) whose URL is set at build time in VITE_CONTACT_ENDPOINT. The address
 * enquiries are delivered to lives in that service's settings, so no email
 * address appears anywhere in this site's code.
 *
 * Resolves to one of:
 *   'sent'         the service accepted the enquiry
 *   'failed'       the service refused it, or the network failed
 *   'unavailable'  no endpoint is configured, so nothing was sent
 */
export async function sendEnquiry(values, endpoint = '/api/contact') {
  if (!endpoint) return 'unavailable'

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Formspree and similar services answer with JSON rather than
        // redirecting to a thank-you page when asked for it.
        Accept: 'application/json',
      },
      body: JSON.stringify({
        ...values,
        _subject: `New enquiry — ${values.topic}`,
      }),
    })
    return response.ok ? 'sent' : 'failed'
  } catch {
    return 'failed'
  }
}
