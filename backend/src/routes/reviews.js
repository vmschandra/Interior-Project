import { Router } from 'express'
import { body, validationResult } from 'express-validator'
import { PrismaClient } from '@prisma/client'
import { authenticate, authorize } from '../middleware/auth.js'

const router = Router()
const prisma = new PrismaClient()

// ── POST /api/reviews ─────────────────────────────────────
router.post('/', authenticate, authorize('CUSTOMER'), [
  body('designerUserId').notEmpty(),
  body('rating').isInt({ min: 1, max: 5 }),
  body('comment').optional().trim().isLength({ max: 1000 }),
], async (req, res) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) return res.status(422).json({ message: errors.array()[0].msg })

  const { designerUserId, rating, comment } = req.body
  try {
    // Verify they've had a conversation
    const conversation = await prisma.conversation.findUnique({
      where: { customerId_designerId: { customerId: req.user.id, designerId: designerUserId } },
    })
    if (!conversation) {
      return res.status(403).json({ message: 'You can only review designers you have chatted with' })
    }

    const review = await prisma.review.upsert({
      where: { customerId_designerId: { customerId: req.user.id, designerId: designerUserId } },
      update: { rating, comment: comment || null },
      create: { customerId: req.user.id, designerId: designerUserId, rating, comment: comment || null },
    })

    // Recalculate designer's average rating
    const agg = await prisma.review.aggregate({
      where: { designerId: designerUserId },
      _avg: { rating: true },
      _count: true,
    })
    await prisma.designerProfile.update({
      where: { userId: designerUserId },
      data: {
        avgRating: agg._avg.rating || 0,
        totalReviews: agg._count,
      },
    })

    return res.status(201).json({ review })
  } catch (err) {
    console.error('[reviews/create]', err)
    res.status(500).json({ message: 'Failed to submit review' })
  }
})

// ── GET /api/reviews/:designerUserId ──────────────────────
router.get('/:designerUserId', async (req, res) => {
  try {
    const reviews = await prisma.review.findMany({
      where: { designerId: req.params.designerUserId },
      include: { customer: { include: { customerProfile: { select: { name: true, profilePhotoUrl: true } } } } },
      orderBy: { createdAt: 'desc' },
    })
    return res.json({ reviews })
  } catch {
    res.status(500).json({ message: 'Failed to fetch reviews' })
  }
})

export default router
