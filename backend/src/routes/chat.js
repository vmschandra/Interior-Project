import { Router } from 'express'
import { body, validationResult } from 'express-validator'
import { PrismaClient } from '@prisma/client'
import { authenticate, authorize } from '../middleware/auth.js'

const router = Router()
const prisma = new PrismaClient()

async function checkBothPremium(customerId, designerId) {
  const [customer, designer] = await Promise.all([
    prisma.user.findUnique({ where: { id: customerId }, select: { isPremium: true, isActive: true } }),
    prisma.user.findUnique({ where: { id: designerId }, select: { isPremium: true, isActive: true } }),
  ])
  return customer?.isPremium && designer?.isPremium && customer.isActive && designer.isActive
}

// ── GET /api/chat/conversations ───────────────────────────
router.get('/conversations', authenticate, async (req, res) => {
  try {
    const isCustomer = req.user.role === 'CUSTOMER'
    const conversations = await prisma.conversation.findMany({
      where: isCustomer ? { customerId: req.user.id } : { designerId: req.user.id },
      include: {
        customer: { include: { customerProfile: { select: { name: true, profilePhotoUrl: true } } } },
        designer: { include: { designerProfile: { select: { name: true, profilePhotoUrl: true, firmName: true } } } },
        messages: { orderBy: { createdAt: 'desc' }, take: 1 },
      },
      orderBy: { lastMessageAt: 'desc' },
    })
    return res.json({ conversations })
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch conversations' })
  }
})

// ── POST /api/chat/conversations — initiate ────────────────
router.post('/conversations', authenticate, authorize('CUSTOMER'), [
  body('designerUserId').notEmpty(),
], async (req, res) => {
  const { designerUserId } = req.body
  const customerId = req.user.id

  const canChat = await checkBothPremium(customerId, designerUserId)
  if (!canChat) {
    return res.status(403).json({ message: 'Both parties must have an active Premium subscription to chat' })
  }

  try {
    const existing = await prisma.conversation.findUnique({
      where: { customerId_designerId: { customerId, designerId: designerUserId } },
    })
    if (existing) return res.json({ conversation: existing })

    const conversation = await prisma.conversation.create({
      data: { customerId, designerId: designerUserId },
    })
    return res.status(201).json({ conversation })
  } catch (err) {
    res.status(500).json({ message: 'Failed to create conversation' })
  }
})

// ── GET /api/chat/conversations/:id/messages ──────────────
router.get('/conversations/:id/messages', authenticate, async (req, res) => {
  try {
    const conversation = await prisma.conversation.findUnique({
      where: { id: req.params.id },
    })
    if (!conversation) return res.status(404).json({ message: 'Conversation not found' })

    const isParticipant = conversation.customerId === req.user.id ||
      conversation.designerId === req.user.id
    if (!isParticipant) return res.status(403).json({ message: 'Access denied' })

    const messages = await prisma.message.findMany({
      where: { conversationId: req.params.id },
      orderBy: { createdAt: 'asc' },
      take: 100,
    })

    // Mark messages as read
    await prisma.message.updateMany({
      where: { conversationId: req.params.id, senderId: { not: req.user.id }, isRead: false },
      data: { isRead: true },
    })

    return res.json({ messages })
  } catch {
    res.status(500).json({ message: 'Failed to fetch messages' })
  }
})

// ── POST /api/chat/conversations/:id/messages ─────────────
router.post('/conversations/:id/messages', authenticate, [
  body('content').trim().isLength({ min: 1, max: 2000 }),
], async (req, res) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) return res.status(422).json({ message: errors.array()[0].msg })

  try {
    const conversation = await prisma.conversation.findUnique({ where: { id: req.params.id } })
    if (!conversation) return res.status(404).json({ message: 'Conversation not found' })

    const isParticipant = conversation.customerId === req.user.id || conversation.designerId === req.user.id
    if (!isParticipant) return res.status(403).json({ message: 'Access denied' })

    // Check both still have premium
    const canChat = await checkBothPremium(conversation.customerId, conversation.designerId)
    if (!canChat) {
      return res.status(403).json({ message: 'Premium subscription required to send messages' })
    }

    const { content } = req.body
    const isCustomer = req.user.id === conversation.customerId

    const message = await prisma.message.create({
      data: {
        conversationId: conversation.id,
        senderId: req.user.id,
        senderRole: req.user.role,
        content,
      },
    })

    // Update conversation metadata
    await prisma.conversation.update({
      where: { id: conversation.id },
      data: {
        lastMessageAt: new Date(),
        ...(isCustomer
          ? { designerUnreadCount: { increment: 1 } }
          : { customerUnreadCount: { increment: 1 } }),
      },
    })

    return res.status(201).json({ message })
  } catch {
    res.status(500).json({ message: 'Failed to send message' })
  }
})

export default router
