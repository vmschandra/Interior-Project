import express, { Router } from 'express'
import { PrismaClient } from '@prisma/client'
import { authenticate } from '../middleware/auth.js'
import Razorpay from 'razorpay'
import crypto from 'crypto'

const router = Router()
const prisma = new PrismaClient()
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
})

const PLANS = {
  CUSTOMER_MONTHLY:  { amount: 100000, rolePlan: 'CUSTOMER_PREMIUM', planType: 'MONTHLY',  days: 30  },
  CUSTOMER_YEARLY:   { amount: 900000, rolePlan: 'CUSTOMER_PREMIUM', planType: 'YEARLY',   days: 365 },
  DESIGNER_MONTHLY:  { amount: 20000,  rolePlan: 'DESIGNER_PREMIUM', planType: 'MONTHLY',  days: 30  },
  DESIGNER_YEARLY:   { amount: 180000, rolePlan: 'DESIGNER_PREMIUM', planType: 'YEARLY',   days: 365 },
}

// ── GET /api/subscriptions/plans ──────────────────────────
router.get('/plans', (_, res) => res.json({ plans: PLANS }))

// ── GET /api/subscriptions/status ─────────────────────────
router.get('/status', authenticate, async (req, res) => {
  try {
    const sub = await prisma.subscription.findFirst({
      where: { userId: req.user.id, status: { in: ['ACTIVE', 'PAST_DUE'] } },
      orderBy: { createdAt: 'desc' },
    })
    return res.json({ subscription: sub })
  } catch {
    res.status(500).json({ message: 'Failed to fetch subscription' })
  }
})

// ── POST /api/subscriptions/checkout ──────────────────────
router.post('/checkout', authenticate, async (req, res) => {
  const { planKey } = req.body
  const plan = PLANS[planKey]
  if (!plan) return res.status(400).json({ message: 'Invalid plan' })

  // Validate role matches plan
  const role = req.user.role
  if (plan.rolePlan === 'CUSTOMER_PREMIUM' && role !== 'CUSTOMER') {
    return res.status(403).json({ message: 'This plan is for customers only' })
  }
  if (plan.rolePlan === 'DESIGNER_PREMIUM' && role !== 'DESIGNER') {
    return res.status(403).json({ message: 'This plan is for designers only' })
  }

  try {
    const order = await razorpay.orders.create({
      amount: plan.amount,
      currency: 'INR',
      receipt: `receipt_${req.user.id}_${Date.now()}`,
      notes: { userId: req.user.id, planKey },
    })
    return res.json({ order, key: process.env.RAZORPAY_KEY_ID })
  } catch (err) {
    console.error('[checkout]', err)
    res.status(500).json({ message: 'Failed to create payment order' })
  }
})

// ── POST /api/subscriptions/verify ────────────────────────
router.post('/verify', authenticate, async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, planKey } = req.body
  const plan = PLANS[planKey]
  if (!plan) return res.status(400).json({ message: 'Invalid plan' })

  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest('hex')

  if (expectedSignature !== razorpay_signature) {
    return res.status(400).json({ message: 'Invalid payment signature' })
  }

  // Idempotency: skip if already processed
  const existing = await prisma.payment.findUnique({ where: { razorpayPaymentId: razorpay_payment_id } })
  if (existing) return res.json({ message: 'Already processed' })

  try {
    const now = new Date()
    const expiresAt = new Date(now.getTime() + plan.days * 24 * 60 * 60 * 1000)
    const graceEndsAt = new Date(expiresAt.getTime() + 3 * 24 * 60 * 60 * 1000)

    const subscription = await prisma.subscription.create({
      data: {
        userId: req.user.id,
        planType: plan.planType,
        rolePlan: plan.rolePlan,
        amount: plan.amount,
        currency: 'INR',
        razorpaySubscriptionId: razorpay_order_id,
        startsAt: now,
        expiresAt,
        graceEndsAt,
        status: 'ACTIVE',
      },
    })

    await prisma.payment.create({
      data: {
        userId: req.user.id,
        subscriptionId: subscription.id,
        amount: plan.amount,
        currency: 'INR',
        razorpayPaymentId: razorpay_payment_id,
        razorpayOrderId: razorpay_order_id,
        status: 'SUCCESS',
      },
    })

    await prisma.user.update({ where: { id: req.user.id }, data: { isPremium: true } })

    return res.json({ message: 'Payment verified. Premium activated!', subscription })
  } catch (err) {
    console.error('[verify]', err)
    res.status(500).json({ message: 'Failed to activate subscription' })
  }
})

// ── POST /api/subscriptions/webhook ───────────────────────
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET
  const signature = req.headers['x-razorpay-signature']

  if (webhookSecret) {
    const expected = crypto.createHmac('sha256', webhookSecret).update(req.body).digest('hex')
    if (expected !== signature) return res.status(400).json({ message: 'Invalid signature' })
  }

  const event = JSON.parse(req.body)
  console.log('[webhook]', event.event)

  // Handle subscription events (Razorpay webhooks for auto-renewal etc.)
  // Full implementation would handle: subscription.charged, subscription.halted, payment.failed
  res.json({ received: true })
})

// ── DELETE /api/subscriptions/cancel ──────────────────────
router.delete('/cancel', authenticate, async (req, res) => {
  try {
    const sub = await prisma.subscription.findFirst({
      where: { userId: req.user.id, status: 'ACTIVE' },
    })
    if (!sub) return res.status(404).json({ message: 'No active subscription' })

    await prisma.subscription.update({
      where: { id: sub.id },
      data: { status: 'CANCELLED', cancelledAt: new Date() },
    })
    // Features remain until expiresAt
    return res.json({ message: 'Subscription cancelled. Premium access remains until expiry.' })
  } catch {
    res.status(500).json({ message: 'Failed to cancel subscription' })
  }
})

export default router
