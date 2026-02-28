import { Router, Request, Response } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { OAuth2Client } from 'google-auth-library'
import { v4 as uuidv4 } from 'uuid'
import { Resend } from 'resend'
import nodemailer from 'nodemailer'
import prisma from '../db/client'
import { verifyToken, AuthRequest } from './middleware'

const router = Router()
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID)

const JWT_SECRET = process.env.JWT_SECRET as string
const ACCESS_TOKEN_TTL = '15m'
const REFRESH_TOKEN_TTL_MS = 30 * 24 * 60 * 60 * 1000 // 30 days
const RESET_TOKEN_TTL_MS = 60 * 60 * 1000 // 1 hour

const REFRESH_COOKIE = 'fmt_refresh'
const isProd = process.env.NODE_ENV === 'production'
const COOKIE_OPTS = {
  httpOnly: true,
  secure: isProd,
  sameSite: (isProd ? 'none' : 'lax') as 'none' | 'lax',
  maxAge: REFRESH_TOKEN_TTL_MS
}

function signAccessToken(userId: string): string {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: ACCESS_TOKEN_TTL })
}

async function createRefreshToken(userId: string): Promise<string> {
  const token = uuidv4()
  const expiresAt = new Date(Date.now() + REFRESH_TOKEN_TTL_MS)
  await prisma.refreshToken.create({ data: { token, userId, expiresAt } })
  return token
}

function setRefreshCookie(res: Response, token: string): void {
  res.cookie(REFRESH_COOKIE, token, COOKIE_OPTS)
}

function clearRefreshCookie(res: Response): void {
  res.clearCookie(REFRESH_COOKIE)
}

const RESET_EMAIL_HTML = (resetUrl: string) => `
<!DOCTYPE html>
<html>
<body style="font-family:sans-serif;max-width:480px;margin:auto;padding:32px 16px;color:#222;">
  <h2 style="color:#1a7a4a;margin-bottom:8px;">Reset your FileMyTax password</h2>
  <p>Click the button below to set a new password. This link expires in <strong>1 hour</strong>.</p>
  <a href="${resetUrl}" style="display:inline-block;margin:20px 0;padding:12px 28px;background:#1a7a4a;color:#fff;border-radius:6px;text-decoration:none;font-weight:700;">Reset Password</a>
  <p style="color:#888;font-size:0.85rem;">Or copy this link into your browser:<br/><a href="${resetUrl}" style="color:#1a7a4a;">${resetUrl}</a></p>
  <hr style="border:none;border-top:1px solid #eee;margin:24px 0;"/>
  <p style="color:#aaa;font-size:0.78rem;">If you did not request this, you can safely ignore this email.</p>
</body>
</html>
`

const PLACEHOLDER_PATTERNS = [
  'xxxx-xxxx',
  'your@',
  'example.com',
  'changeme',
  'placeholder'
]
function isPlaceholder(val: string): boolean {
  return PLACEHOLDER_PATTERNS.some((p) => val.toLowerCase().includes(p))
}

async function sendViaResend(to: string, resetUrl: string): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY ?? ''
  if (!apiKey || isPlaceholder(apiKey))
    throw new Error('RESEND_API_KEY not configured')
  const resend = new Resend(apiKey)
  const fromAddr =
    process.env.RESEND_FROM || 'FileMyTax <onboarding@resend.dev>'
  const { error } = await resend.emails.send({
    from: fromAddr,
    to: [to],
    subject: 'Reset your FileMyTax password',
    html: RESET_EMAIL_HTML(resetUrl)
  })
  if (error) throw new Error(error.message)
}

async function sendViaSmtp(to: string, resetUrl: string): Promise<void> {
  const smtpUser = process.env.SMTP_USER ?? ''
  const smtpPass = process.env.SMTP_PASS ?? ''
  if (
    !smtpUser ||
    !smtpPass ||
    isPlaceholder(smtpUser) ||
    isPlaceholder(smtpPass)
  ) {
    throw new Error('SMTP not configured')
  }
  const transportConfig = process.env.SMTP_SERVICE
    ? {
        service: process.env.SMTP_SERVICE,
        auth: { user: smtpUser, pass: smtpPass }
      }
    : {
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT) || 587,
        secure: Number(process.env.SMTP_PORT) === 465,
        auth: { user: smtpUser, pass: smtpPass }
      }
  const transporter = nodemailer.createTransport(transportConfig)
  await transporter.sendMail({
    from: `"FileMyTax" <${process.env.SMTP_FROM || smtpUser}>`,
    to,
    subject: 'Reset your FileMyTax password',
    html: RESET_EMAIL_HTML(resetUrl)
  })
}

async function sendResetEmail(to: string, resetUrl: string): Promise<void> {
  // Try Resend first (recommended), then SMTP, then fall back to console
  const resendKey = process.env.RESEND_API_KEY ?? ''
  const smtpPass = process.env.SMTP_PASS ?? ''

  if (resendKey && !isPlaceholder(resendKey)) {
    await sendViaResend(to, resetUrl)
    console.log(`[EMAIL] Reset link sent via Resend to ${to}`)
    return
  }

  if (smtpPass && !isPlaceholder(smtpPass)) {
    await sendViaSmtp(to, resetUrl)
    console.log(`[EMAIL] Reset link sent via SMTP to ${to}`)
    return
  }

  // No provider configured — print to console so developer can use the link manually
  console.log(`\n[EMAIL] No email provider configured.`)
  console.log(`[EMAIL] Reset link for ${to}:\n${resetUrl}\n`)
}

// POST /api/auth/register
router.post('/register', async (req: Request, res: Response): Promise<void> => {
  const { email, password, name } = req.body as {
    email?: string
    password?: string
    name?: string
  }
  if (!email || !password) {
    res.status(400).json({ error: 'Email and password are required' })
    return
  }
  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) {
    if (existing.googleId && !existing.passwordHash) {
      res.status(409).json({
        error: 'GOOGLE_ACCOUNT',
        message:
          'This email is linked to a Google account. Use "Forgot password?" to set a password and enable email login.'
      })
    } else {
      res.status(409).json({ error: 'Email already in use' })
    }
    return
  }
  const passwordHash = await bcrypt.hash(password, 12)
  const user = await prisma.user.create({
    data: { email, passwordHash, name: name ?? null }
  })
  const accessToken = signAccessToken(user.id)
  const refreshToken = await createRefreshToken(user.id)
  setRefreshCookie(res, refreshToken)
  res.status(201).json({ accessToken, user: formatUser(user) })
})

// POST /api/auth/login
router.post('/login', async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body as { email?: string; password?: string }
  if (!email || !password) {
    res.status(400).json({ error: 'Email and password are required' })
    return
  }
  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) {
    res.status(401).json({ error: 'Invalid credentials' })
    return
  }
  if (!user.passwordHash) {
    res.status(401).json({
      error: 'GOOGLE_ACCOUNT',
      message:
        'This account uses Google Sign-In. Click the Google button to sign in, or use "Forgot password?" to set a password.'
    })
    return
  }
  const valid = await bcrypt.compare(password, user.passwordHash)
  if (!valid) {
    res.status(401).json({ error: 'Invalid credentials' })
    return
  }
  const accessToken = signAccessToken(user.id)
  const refreshToken = await createRefreshToken(user.id)
  setRefreshCookie(res, refreshToken)
  res.json({ accessToken, user: formatUser(user) })
})

// POST /api/auth/google
router.post('/google', async (req: Request, res: Response): Promise<void> => {
  const { idToken } = req.body as { idToken?: string }
  if (!idToken) {
    res.status(400).json({ error: 'idToken is required' })
    return
  }
  let payload
  try {
    const ticket = await googleClient.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID
    })
    payload = ticket.getPayload()
  } catch {
    res.status(401).json({ error: 'Invalid Google token' })
    return
  }
  if (!payload || !payload.email) {
    res.status(401).json({ error: 'Could not read Google profile' })
    return
  }
  const { sub: googleId, email, name } = payload
  let user = await prisma.user.findFirst({
    where: { OR: [{ googleId }, { email }] }
  })
  if (!user) {
    user = await prisma.user.create({
      data: { email, googleId, name: name ?? null }
    })
  } else if (!user.googleId) {
    user = await prisma.user.update({
      where: { id: user.id },
      data: { googleId }
    })
  }
  const accessToken = signAccessToken(user.id)
  const refreshToken = await createRefreshToken(user.id)
  setRefreshCookie(res, refreshToken)
  res.json({ accessToken, user: formatUser(user) })
})

// POST /api/auth/refresh — reads refresh token from HTTP-only cookie
router.post('/refresh', async (req: Request, res: Response): Promise<void> => {
  const refreshToken = (req.cookies as Record<string, string | undefined>)[
    REFRESH_COOKIE
  ]
  if (!refreshToken) {
    res.status(401).json({ error: 'No refresh token' })
    return
  }
  const stored = await prisma.refreshToken.findUnique({
    where: { token: refreshToken }
  })
  if (!stored || stored.expiresAt < new Date()) {
    clearRefreshCookie(res)
    res.status(401).json({ error: 'Invalid or expired refresh token' })
    return
  }
  // Rotate: delete old, issue new
  await prisma.refreshToken.delete({ where: { token: refreshToken } })
  const newAccessToken = signAccessToken(stored.userId)
  const newRefreshToken = await createRefreshToken(stored.userId)
  setRefreshCookie(res, newRefreshToken)
  res.json({ accessToken: newAccessToken })
})

// POST /api/auth/logout
router.post('/logout', async (req: Request, res: Response): Promise<void> => {
  const refreshToken = (req.cookies as Record<string, string | undefined>)[
    REFRESH_COOKIE
  ]
  if (refreshToken) {
    await prisma.refreshToken.deleteMany({ where: { token: refreshToken } })
  }
  clearRefreshCookie(res)
  res.json({ message: 'Logged out' })
})

function formatUser(user: {
  id: string
  email: string
  name: string | null
  firstName: string | null
  middleName: string | null
  lastName: string | null
  phone: string | null
  dateOfBirth: string | null
  addressLine1: string | null
  addressLine2: string | null
  city: string | null
  state: string | null
  zip: string | null
  country: string | null
  passwordHash: string | null
}) {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    firstName: user.firstName,
    middleName: user.middleName,
    lastName: user.lastName,
    phone: user.phone,
    dateOfBirth: user.dateOfBirth,
    addressLine1: user.addressLine1,
    addressLine2: user.addressLine2,
    city: user.city,
    state: user.state,
    zip: user.zip,
    country: user.country,
    hasPassword: !!user.passwordHash
  }
}

// GET /api/auth/me
router.get(
  '/me',
  verifyToken,
  async (req: AuthRequest, res: Response): Promise<void> => {
    const user = await prisma.user.findUnique({ where: { id: req.userId } })
    if (!user) {
      res.status(404).json({ error: 'User not found' })
      return
    }
    res.json(formatUser(user))
  }
)

// PUT /api/auth/profile
router.put(
  '/profile',
  verifyToken,
  async (req: AuthRequest, res: Response): Promise<void> => {
    const {
      firstName,
      middleName,
      lastName,
      phone,
      dateOfBirth,
      addressLine1,
      addressLine2,
      city,
      state,
      zip,
      country
    } = req.body as {
      firstName?: string
      middleName?: string
      lastName?: string
      phone?: string
      dateOfBirth?: string
      addressLine1?: string
      addressLine2?: string
      city?: string
      state?: string
      zip?: string
      country?: string
    }

    // Derive display name from first + last if provided
    const first = (firstName ?? '').trim()
    const last = (lastName ?? '').trim()
    const derivedName =
      first && last ? `${first} ${last}` : first || last || null

    const user = await prisma.user.update({
      where: { id: req.userId },
      data: {
        firstName: first || null,
        middleName: (middleName ?? '').trim() || null,
        lastName: last || null,
        name: derivedName,
        phone: (phone ?? '').trim() || null,
        dateOfBirth: (dateOfBirth ?? '').trim() || null,
        addressLine1: (addressLine1 ?? '').trim() || null,
        addressLine2: (addressLine2 ?? '').trim() || null,
        city: (city ?? '').trim() || null,
        state: (state ?? '').trim() || null,
        zip: (zip ?? '').trim() || null,
        country: (country ?? '').trim() || null
      }
    })
    res.json(formatUser(user))
  }
)

// POST /api/auth/set-password (authenticated — works for both setting and changing)
router.post(
  '/set-password',
  verifyToken,
  async (req: AuthRequest, res: Response): Promise<void> => {
    const { currentPassword, newPassword } = req.body as {
      currentPassword?: string
      newPassword?: string
    }
    if (!newPassword || newPassword.length < 8) {
      res
        .status(400)
        .json({ error: 'New password must be at least 8 characters' })
      return
    }
    const user = await prisma.user.findUnique({ where: { id: req.userId } })
    if (!user) {
      res.status(404).json({ error: 'User not found' })
      return
    }
    if (user.passwordHash) {
      // Existing password account — verify current password first
      if (!currentPassword) {
        res.status(400).json({ error: 'Current password is required' })
        return
      }
      const valid = await bcrypt.compare(currentPassword, user.passwordHash)
      if (!valid) {
        res.status(401).json({ error: 'Current password is incorrect' })
        return
      }
    }
    const passwordHash = await bcrypt.hash(newPassword, 12)
    await prisma.user.update({ where: { id: user.id }, data: { passwordHash } })
    res.json({ message: 'Password set successfully' })
  }
)

// POST /api/auth/forgot-password
router.post(
  '/forgot-password',
  async (req: Request, res: Response): Promise<void> => {
    const { email } = req.body as { email?: string }
    // Always return 200 to avoid revealing if an email is registered
    res.json({
      message: 'If this email is registered, a reset link has been sent.'
    })

    if (!email) return
    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) return

    // Remove any existing reset tokens for this user
    await prisma.passwordResetToken.deleteMany({ where: { userId: user.id } })

    const token = uuidv4()
    const expiresAt = new Date(Date.now() + RESET_TOKEN_TTL_MS)
    await prisma.passwordResetToken.create({
      data: { token, userId: user.id, expiresAt }
    })

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000'
    const resetUrl = `${frontendUrl}/reset-password?token=${token}`
    await sendResetEmail(email, resetUrl).catch((err: unknown) => {
      console.error('Failed to send reset email:', err)
    })
  }
)

// POST /api/auth/reset-password
router.post(
  '/reset-password',
  async (req: Request, res: Response): Promise<void> => {
    const { token, newPassword } = req.body as {
      token?: string
      newPassword?: string
    }
    if (!token || !newPassword) {
      res.status(400).json({ error: 'Token and new password are required' })
      return
    }
    if (newPassword.length < 8) {
      res.status(400).json({ error: 'Password must be at least 8 characters' })
      return
    }
    const resetRecord = await prisma.passwordResetToken.findUnique({
      where: { token }
    })
    if (!resetRecord || resetRecord.expiresAt < new Date()) {
      res.status(400).json({
        error: 'Invalid or expired reset link. Please request a new one.'
      })
      return
    }
    const passwordHash = await bcrypt.hash(newPassword, 12)
    await prisma.user.update({
      where: { id: resetRecord.userId },
      data: { passwordHash }
    })
    await prisma.passwordResetToken.delete({ where: { token } })
    res.json({ message: 'Password updated successfully. You can now log in.' })
  }
)

export default router
