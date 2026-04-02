import { Router } from 'express'
import { body, query, validationResult } from 'express-validator'
import { PrismaClient } from '@prisma/client'
import { authenticate, authorize } from '../middleware/auth.js'
import { uploadImage, deleteImage } from '../utils/cloudinary.js'
import multer from 'multer'

const router = Router()
const prisma = new PrismaClient()
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } })

// ── GET /api/designers — public listing with filters ───────
router.get('/', async (req, res) => {
  const {
    page = 1, limit = 12, sort = 'rating_desc',
    search, area, tier, min_rating, premium,
  } = req.query

  const skip = (parseInt(page) - 1) * parseInt(limit)
  const where = {
    status: 'APPROVED',
    ...(search && {
      OR: [
        { name: { contains: search, mode: 'insensitive' } },
        { firmName: { contains: search, mode: 'insensitive' } },
        { bio: { contains: search, mode: 'insensitive' } },
      ],
    }),
    ...(area && { areasServed: { hasSome: area.split(',').map(a => a.trim()) } }),
    ...(tier && { pricingTier: { in: tier.split(',').map(t => t.toUpperCase()) } }),
    ...(min_rating && { avgRating: { gte: parseFloat(min_rating) } }),
    ...(premium === 'true' && { user: { isPremium: true } }),
  }

  const orderBy = {
    rating_desc:      { avgRating: 'desc' },
    rating_asc:       { avgRating: 'asc' },
    experience_desc:  { experienceYears: 'desc' },
    newest:           { createdAt: 'desc' },
  }[sort] || { avgRating: 'desc' }

  try {
    const [designers, total] = await Promise.all([
      prisma.designerProfile.findMany({
        where, skip, take: parseInt(limit), orderBy,
        include: { user: { select: { isPremium: true, isActive: true } } },
      }),
      prisma.designerProfile.count({ where }),
    ])
    return res.json({ designers, total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)) })
  } catch (err) {
    console.error('[designers/list]', err)
    res.status(500).json({ message: 'Failed to fetch designers' })
  }
})

// ── GET /api/designers/:slug — public profile ──────────────
router.get('/:slug', async (req, res) => {
  try {
    const designer = await prisma.designerProfile.findUnique({
      where: { slug: req.params.slug },
      include: {
        user: { select: { isPremium: true } },
        projects: {
          where: { status: 'PUBLISHED' },
          include: { images: { orderBy: { sortOrder: 'asc' } } },
          orderBy: { createdAt: 'desc' },
        },
      },
    })
    if (!designer || designer.status !== 'APPROVED') {
      return res.status(404).json({ message: 'Designer not found' })
    }

    // Fetch reviews separately (via join)
    const reviews = await prisma.review.findMany({
      where: { designerId: designer.userId },
      include: { customer: { include: { customerProfile: { select: { name: true } } } } },
      orderBy: { createdAt: 'desc' },
      take: 20,
    })

    // Increment profile view count (non-blocking)
    prisma.designerProfile.update({
      where: { id: designer.id },
      data: { totalProfileViews: { increment: 1 } },
    }).catch(() => {})

    return res.json({
      designer: {
        ...designer,
        reviews: reviews.map(r => ({
          ...r,
          customer: { name: r.customer.customerProfile?.name || 'Anonymous' },
        })),
      },
    })
  } catch (err) {
    console.error('[designers/profile]', err)
    res.status(500).json({ message: 'Failed to fetch designer' })
  }
})

// ── PUT /api/designers/profile — update own profile ────────
router.put('/profile', authenticate, authorize('DESIGNER'), async (req, res) => {
  const { name, firmName, bio, experienceYears, pricingTier, areasServed, certifications } = req.body
  try {
    const profile = await prisma.designerProfile.update({
      where: { userId: req.user.id },
      data: {
        ...(name && { name }),
        ...(firmName !== undefined && { firmName }),
        ...(bio !== undefined && { bio }),
        ...(experienceYears !== undefined && { experienceYears: parseInt(experienceYears) }),
        ...(pricingTier && { pricingTier }),
        ...(areasServed && { areasServed }),
        ...(certifications && { certifications }),
      },
    })
    return res.json({ profile })
  } catch (err) {
    console.error('[designers/update-profile]', err)
    res.status(500).json({ message: 'Update failed' })
  }
})

// ── POST /api/designers/projects — create project ──────────
router.post('/projects', authenticate, authorize('DESIGNER'), [
  body('title').trim().isLength({ min: 2 }),
], async (req, res) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) return res.status(422).json({ message: errors.array()[0].msg })

  try {
    const designer = await prisma.designerProfile.findUnique({ where: { userId: req.user.id } })
    if (!designer) return res.status(404).json({ message: 'Designer profile not found' })

    // Enforce 5-project limit
    const count = await prisma.project.count({
      where: { designerId: designer.id, status: { not: 'DELETED' } },
    })
    if (count >= 5) return res.status(400).json({ message: 'Maximum 5 projects allowed' })

    const { title, description, budgetMin, budgetMax, area, styleTags, completionDate } = req.body
    const project = await prisma.project.create({
      data: {
        designerId: designer.id,
        title,
        description: description || null,
        budgetMin: budgetMin ? parseInt(budgetMin) : null,
        budgetMax: budgetMax ? parseInt(budgetMax) : null,
        area: area || null,
        styleTags: styleTags || [],
        completionDate: completionDate ? new Date(completionDate) : null,
        status: 'PUBLISHED',
      },
      include: { images: true },
    })
    return res.status(201).json({ project })
  } catch (err) {
    console.error('[designers/create-project]', err)
    res.status(500).json({ message: 'Failed to create project' })
  }
})

// ── POST /api/designers/projects/:id/images — upload photos ─
router.post(
  '/projects/:id/images',
  authenticate,
  authorize('DESIGNER'),
  upload.array('images', 10),
  async (req, res) => {
    try {
      const designer = await prisma.designerProfile.findUnique({ where: { userId: req.user.id } })
      const project = await prisma.project.findFirst({
        where: { id: req.params.id, designerId: designer.id },
        include: { images: true },
      })
      if (!project) return res.status(404).json({ message: 'Project not found' })

      const currentCount = project.images.length
      const newFiles = req.files || []
      if (currentCount + newFiles.length > 10) {
        return res.status(400).json({ message: `Can only add ${10 - currentCount} more photos` })
      }

      const uploaded = await Promise.all(
        newFiles.map((file, i) => uploadImage(file.buffer, {
          folder: `designnest/designers/${designer.id}/projects/${project.id}`,
          sortOrder: currentCount + i,
        }))
      )

      const images = await Promise.all(
        uploaded.map((result, i) =>
          prisma.projectImage.create({
            data: {
              projectId: project.id,
              imageUrl: result.secure_url,
              thumbnailUrl: result.thumbnail_url,
              cloudinaryPublicId: result.public_id,
              sortOrder: currentCount + i,
              fileSizeBytes: newFiles[i].size,
            },
          })
        )
      )
      return res.status(201).json({ images })
    } catch (err) {
      console.error('[designers/upload-images]', err)
      res.status(500).json({ message: 'Image upload failed' })
    }
  }
)

// ── DELETE /api/designers/projects/:id — delete project ────
router.delete('/projects/:id', authenticate, authorize('DESIGNER'), async (req, res) => {
  try {
    const designer = await prisma.designerProfile.findUnique({ where: { userId: req.user.id } })
    const project = await prisma.project.findFirst({
      where: { id: req.params.id, designerId: designer.id },
    })
    if (!project) return res.status(404).json({ message: 'Project not found' })

    await prisma.project.update({ where: { id: project.id }, data: { status: 'DELETED' } })
    return res.json({ message: 'Project deleted' })
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete project' })
  }
})

export default router
