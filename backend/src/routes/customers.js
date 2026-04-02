import { Router } from 'express'
import { PrismaClient } from '@prisma/client'
import { authenticate, authorize } from '../middleware/auth.js'

const router = Router()
const prisma = new PrismaClient()

// ── GET /api/customers/profile ─────────────────────────────
router.get('/profile', authenticate, authorize('CUSTOMER'), async (req, res) => {
  try {
    const profile = await prisma.customerProfile.findUnique({ where: { userId: req.user.id } })
    return res.json({ profile })
  } catch {
    res.status(500).json({ message: 'Failed to fetch profile' })
  }
})

// ── PUT /api/customers/profile ─────────────────────────────
router.put('/profile', authenticate, authorize('CUSTOMER'), async (req, res) => {
  const { name, city } = req.body
  try {
    const profile = await prisma.customerProfile.update({
      where: { userId: req.user.id },
      data: {
        ...(name && { name }),
        ...(city !== undefined && { city }),
      },
    })
    return res.json({ profile })
  } catch {
    res.status(500).json({ message: 'Update failed' })
  }
})

// ── POST /api/customers/favorites/:designerId ──────────────
router.post('/favorites/:designerId', authenticate, authorize('CUSTOMER'), async (req, res) => {
  try {
    const profile = await prisma.customerProfile.findUnique({ where: { userId: req.user.id } })
    const ids = profile.favoritedDesignerIds || []
    const isAlready = ids.includes(req.params.designerId)
    const updated = await prisma.customerProfile.update({
      where: { userId: req.user.id },
      data: {
        favoritedDesignerIds: isAlready
          ? ids.filter(id => id !== req.params.designerId)
          : [...ids, req.params.designerId],
      },
    })
    return res.json({ favorited: !isAlready, favorites: updated.favoritedDesignerIds })
  } catch {
    res.status(500).json({ message: 'Failed to update favorites' })
  }
})

// ── GET /api/customers/favorites ──────────────────────────
router.get('/favorites', authenticate, authorize('CUSTOMER'), async (req, res) => {
  try {
    const profile = await prisma.customerProfile.findUnique({ where: { userId: req.user.id } })
    const designers = await prisma.designerProfile.findMany({
      where: { id: { in: profile.favoritedDesignerIds || [] }, status: 'APPROVED' },
      include: { user: { select: { isPremium: true } } },
    })
    return res.json({ designers })
  } catch {
    res.status(500).json({ message: 'Failed to fetch favorites' })
  }
})

export default router
