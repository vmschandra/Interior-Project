import { Router } from 'express'
import { PrismaClient } from '@prisma/client'
import { authenticate, authorize } from '../middleware/auth.js'

const router = Router()
const prisma = new PrismaClient()

// All admin routes require ADMIN role
router.use(authenticate, authorize('ADMIN'))

// ── GET /api/admin/stats ──────────────────────────────────
router.get('/stats', async (_, res) => {
  try {
    const [totalUsers, totalDesigners, totalCustomers, activeSubscriptions, pendingDesigners] = await Promise.all([
      prisma.user.count({ where: { isActive: true } }),
      prisma.user.count({ where: { role: 'DESIGNER', isActive: true } }),
      prisma.user.count({ where: { role: 'CUSTOMER', isActive: true } }),
      prisma.subscription.count({ where: { status: 'ACTIVE' } }),
      prisma.designerProfile.count({ where: { status: 'PENDING_REVIEW' } }),
    ])
    return res.json({ totalUsers, totalDesigners, totalCustomers, activeSubscriptions, pendingDesigners })
  } catch {
    res.status(500).json({ message: 'Failed to fetch stats' })
  }
})

// ── GET /api/admin/designers/pending ──────────────────────
router.get('/designers/pending', async (_, res) => {
  try {
    const designers = await prisma.designerProfile.findMany({
      where: { status: 'PENDING_REVIEW' },
      include: {
        user: { select: { email: true, createdAt: true } },
        projects: { include: { images: true } },
      },
      orderBy: { createdAt: 'asc' },
    })
    return res.json({ designers })
  } catch {
    res.status(500).json({ message: 'Failed to fetch pending designers' })
  }
})

// ── POST /api/admin/designers/:id/approve ─────────────────
router.post('/designers/:id/approve', async (req, res) => {
  try {
    const profile = await prisma.designerProfile.update({
      where: { id: req.params.id },
      data: { status: 'APPROVED', rejectionReason: null },
    })
    return res.json({ profile })
  } catch {
    res.status(500).json({ message: 'Failed to approve designer' })
  }
})

// ── POST /api/admin/designers/:id/reject ──────────────────
router.post('/designers/:id/reject', async (req, res) => {
  const { reason } = req.body
  try {
    const profile = await prisma.designerProfile.update({
      where: { id: req.params.id },
      data: { status: 'REJECTED', rejectionReason: reason || 'Profile does not meet our standards.' },
    })
    return res.json({ profile })
  } catch {
    res.status(500).json({ message: 'Failed to reject designer' })
  }
})

// ── GET /api/admin/users ──────────────────────────────────
router.get('/users', async (req, res) => {
  const { page = 1, limit = 20, search, role } = req.query
  const skip = (parseInt(page) - 1) * parseInt(limit)
  try {
    const where = {
      ...(search && { email: { contains: search, mode: 'insensitive' } }),
      ...(role && { role }),
    }
    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where, skip, take: parseInt(limit),
        select: { id: true, email: true, role: true, isPremium: true, isActive: true, createdAt: true },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.user.count({ where }),
    ])
    return res.json({ users, total })
  } catch {
    res.status(500).json({ message: 'Failed to fetch users' })
  }
})

// ── PATCH /api/admin/users/:id/suspend ────────────────────
router.patch('/users/:id/suspend', async (req, res) => {
  try {
    const user = await prisma.user.update({
      where: { id: req.params.id },
      data: { isActive: false },
    })
    return res.json({ message: 'User suspended' })
  } catch {
    res.status(500).json({ message: 'Failed to suspend user' })
  }
})

export default router
