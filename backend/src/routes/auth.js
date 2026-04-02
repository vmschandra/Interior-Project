import { Router } from 'express'
import { body, validationResult } from 'express-validator'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { PrismaClient } from '@prisma/client'
import { authenticate } from '../middleware/auth.js'
import crypto from 'crypto'

const router = Router()
const prisma = new PrismaClient()

function generateSlug(name, id) {
  return name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') + '-' + id.slice(-6)
}

function signTokens(userId, role) {
  const accessToken = jwt.sign(
    { id: userId, role },
    process.env.JWT_SECRET,
    { expiresIn: '15m' }
  )
  const refreshToken = jwt.sign(
    { id: userId, role },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: '7d' }
  )
  return { accessToken, refreshToken }
}

function setRefreshCookie(res, token) {
  res.cookie('refreshToken', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: '/api/auth',
  })
}

// ── POST /api/auth/register ────────────────────────────────
router.post('/register', [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 8 }),
  body('role').isIn(['CUSTOMER', 'DESIGNER']),
  body('name').trim().isLength({ min: 2 }),
], async (req, res) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) return res.status(422).json({ message: errors.array()[0].msg })

  const { email, password, role, name, phone, city, firmName, experienceYears, pricingTier, bio, areasServed } = req.body

  try {
    const exists = await prisma.user.findUnique({ where: { email } })
    if (exists) return res.status(409).json({ message: 'Email already registered' })

    const passwordHash = await bcrypt.hash(password, 12)
    const { accessToken, refreshToken } = signTokens('tmp', role)

    const user = await prisma.user.create({
      data: {
        email,
        phone: phone || null,
        passwordHash,
        role,
        refreshToken: await bcrypt.hash(refreshToken, 6),
        ...(role === 'CUSTOMER' && {
          customerProfile: {
            create: { name, city: city || null, profileCompletionScore: 25 },
          },
        }),
        ...(role === 'DESIGNER' && {
          designerProfile: {
            create: {
              name,
              firmName: firmName || null,
              experienceYears: parseInt(experienceYears) || 0,
              pricingTier: pricingTier || 'BUDGET',
              bio: bio || null,
              areasServed: areasServed || [],
              slug: `${name.toLowerCase().replace(/\s+/g, '-')}-${Date.now().toString(36)}`,
              status: 'PENDING_REVIEW',
              profileCompletionScore: 40,
            },
          },
        }),
      },
      include: { customerProfile: true, designerProfile: true },
    })

    // Fix slug with actual ID
    if (role === 'DESIGNER' && user.designerProfile) {
      await prisma.designerProfile.update({
        where: { id: user.designerProfile.id },
        data: { slug: generateSlug(name, user.id) },
      })
    }

    const { accessToken: at, refreshToken: rt } = signTokens(user.id, user.role)
    await prisma.user.update({ where: { id: user.id }, data: { refreshToken: await bcrypt.hash(rt, 6) } })
    setRefreshCookie(res, rt)

    return res.status(201).json({
      user: {
        id: user.id, email: user.email, role: user.role, isPremium: user.isPremium,
        profile: user.customerProfile || user.designerProfile,
      },
      accessToken: at,
    })
  } catch (err) {
    console.error('[register]', err)
    res.status(500).json({ message: 'Registration failed' })
  }
})

// ── POST /api/auth/login ───────────────────────────────────
router.post('/login', [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty(),
], async (req, res) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) return res.status(422).json({ message: errors.array()[0].msg })

  const { email, password } = req.body
  try {
    const user = await prisma.user.findUnique({
      where: { email },
      include: { customerProfile: true, designerProfile: true },
    })
    if (!user) return res.status(401).json({ message: 'Invalid email or password' })
    if (!user.isActive) return res.status(403).json({ message: 'Account deactivated' })

    const valid = await bcrypt.compare(password, user.passwordHash)
    if (!valid) return res.status(401).json({ message: 'Invalid email or password' })

    const { accessToken, refreshToken } = signTokens(user.id, user.role)
    await prisma.user.update({ where: { id: user.id }, data: { refreshToken: await bcrypt.hash(refreshToken, 6) } })
    setRefreshCookie(res, refreshToken)

    return res.json({
      user: {
        id: user.id, email: user.email, role: user.role, isPremium: user.isPremium,
        profile: user.customerProfile || user.designerProfile,
      },
      accessToken,
    })
  } catch (err) {
    console.error('[login]', err)
    res.status(500).json({ message: 'Login failed' })
  }
})

// ── POST /api/auth/refresh ─────────────────────────────────
router.post('/refresh', async (req, res) => {
  const token = req.cookies.refreshToken
  if (!token) return res.status(401).json({ message: 'No refresh token' })

  try {
    const payload = jwt.verify(token, process.env.JWT_REFRESH_SECRET)
    const user = await prisma.user.findUnique({ where: { id: payload.id } })
    if (!user || !user.isActive) return res.status(401).json({ message: 'Invalid session' })

    const { accessToken, refreshToken } = signTokens(user.id, user.role)
    await prisma.user.update({ where: { id: user.id }, data: { refreshToken: await bcrypt.hash(refreshToken, 6) } })
    setRefreshCookie(res, refreshToken)

    return res.json({
      accessToken,
      user: { id: user.id, email: user.email, role: user.role, isPremium: user.isPremium },
    })
  } catch {
    return res.status(401).json({ message: 'Invalid refresh token' })
  }
})

// ── POST /api/auth/logout ──────────────────────────────────
router.post('/logout', async (req, res) => {
  const token = req.cookies.refreshToken
  if (token) {
    try {
      const payload = jwt.verify(token, process.env.JWT_REFRESH_SECRET)
      await prisma.user.update({ where: { id: payload.id }, data: { refreshToken: null } })
    } catch {}
  }
  res.clearCookie('refreshToken', { path: '/api/auth' })
  return res.json({ message: 'Logged out' })
})

// ── POST /api/auth/forgot-password ────────────────────────
router.post('/forgot-password', [body('email').isEmail().normalizeEmail()], async (req, res) => {
  const { email } = req.body
  try {
    const user = await prisma.user.findUnique({ where: { email } })
    if (user) {
      const token = crypto.randomBytes(32).toString('hex')
      const expires = new Date(Date.now() + 60 * 60 * 1000) // 1 hour
      await prisma.user.update({
        where: { id: user.id },
        data: { passwordResetToken: token, passwordResetExpiresAt: expires },
      })
      // TODO: send email with reset link
      console.log(`[forgot-password] Reset link: /reset-password?token=${token}`)
    }
    // Always return 200 to prevent email enumeration
    return res.json({ message: 'If the account exists, a reset email has been sent.' })
  } catch (err) {
    console.error('[forgot-password]', err)
    res.status(500).json({ message: 'Failed to process request' })
  }
})

// ── GET /api/auth/me ───────────────────────────────────────
router.get('/me', authenticate, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: { customerProfile: true, designerProfile: true },
    })
    if (!user) return res.status(404).json({ message: 'User not found' })
    return res.json({
      id: user.id, email: user.email, role: user.role, isPremium: user.isPremium,
      profile: user.customerProfile || user.designerProfile,
    })
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch user' })
  }
})

export default router
