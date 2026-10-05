import 'dotenv/config'
import express from 'express'
import nodemailer from 'nodemailer'

const app = express()
const port = Number(process.env.API_PORT || 8787)
const recipient = 'edluminahub@gmail.com'
const topics = new Set([
  'Real estate',
  'Education',
  'Hospitality',
  'Healthcare',
  'Luxury retail',
  'Finance',
  'Personal brand',
  'Other',
])
const attempts = new Map()
const windowMs = 15 * 60 * 1000
const maxAttempts = 5

app.use(express.json({ limit: '10kb' }))

function text(value, maxLength) {
  return typeof value === 'string' ? value.trim().slice(0, maxLength) : ''
}

function validate(body) {
  const name = text(body.name, 120)
  const email = text(body.email, 254)
  const company = text(body.company, 160)
  const phone = text(body.phone, 40)
  const topic = text(body.topic, 80)
  const message = text(body.message, 5000)
  const phoneDigits = phone.replace(/\D/g, '')

  if (!name || !email || !phone || !topic || !message) return null
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) return null
  if (!/^[+\d][\d\s()-]{6,39}$/.test(phone) || phoneDigits.length < 7 || phoneDigits.length > 15) return null
  if (!topics.has(topic) || message.length < 10) return null

  return { name, email, company, phone, topic, message }
}

function allowed(ip) {
  const now = Date.now()
  const recent = (attempts.get(ip) || []).filter((time) => now - time < windowMs)
  if (recent.length >= maxAttempts) {
    attempts.set(ip, recent)
    return false
  }
  recent.push(now)
  attempts.set(ip, recent)
  return true
}

function createTransporter() {
  const { SMTP_HOST, SMTP_PORT, SMTP_SECURE, SMTP_USER, SMTP_PASS } = process.env
  const password = SMTP_PASS?.replace(/\s+/g, '')
  if (!SMTP_HOST || !SMTP_USER || !password) return null

  return nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT || 587),
    secure: SMTP_SECURE === 'true',
    auth: { user: SMTP_USER, pass: password },
  })
}

const transporter = createTransporter()

app.post('/api/contact', async (req, res) => {
  if (!allowed(req.ip)) return res.status(429).json({ error: 'Too many requests.' })
  if (text(req.body?.website, 100)) return res.status(400).json({ error: 'Invalid submission.' })

  const enquiry = validate(req.body || {})
  if (!enquiry) return res.status(400).json({ error: 'Please provide valid enquiry details.' })
  if (!transporter) return res.status(503).json({ error: 'Email service is unavailable.' })

  const submittedAt = new Date().toISOString()
  const body = [
    'New website enquiry',
    '',
    `Name: ${enquiry.name}`,
    `Email: ${enquiry.email}`,
    `Company: ${enquiry.company || 'Not provided'}`,
    `Phone: ${enquiry.phone}`,
    `Selected service/help category: ${enquiry.topic}`,
    '',
    'Message:',
    enquiry.message,
    '',
    `Date/time of submission: ${submittedAt}`,
  ].join('\n')

  try {
    await transporter.sendMail({
      from: process.env.SMTP_USER,
      to: recipient,
      replyTo: enquiry.email,
      subject: `New enquiry - ${enquiry.topic}`,
      text: body,
    })
    return res.status(202).json({ ok: true })
  } catch (error) {
    console.error('Contact email delivery failed:', error instanceof Error ? error.message : 'unknown error')
    return res.status(502).json({ error: 'Email delivery failed.' })
  }
})

app.listen(port, () => {
  console.log(`Contact API listening on http://127.0.0.1:${port}`)
})
