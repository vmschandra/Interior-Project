import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database…')

  const password = await bcrypt.hash('Password123!', 12)

  // ─── 3 Customers ───────────────────────────────────────
  const customers = [
    { email: 'rahul.sharma@example.com', name: 'Rahul Sharma', city: 'Mumbai' },
    { email: 'ananya.iyer@example.com',  name: 'Ananya Iyer',  city: 'Bangalore' },
    { email: 'deepa.nair@example.com',   name: 'Deepa Nair',   city: 'Delhi' },
  ]

  for (const c of customers) {
    await prisma.user.upsert({
      where: { email: c.email },
      update: {},
      create: {
        email: c.email,
        passwordHash: password,
        role: 'CUSTOMER',
        isEmailVerified: true,
        isPremium: c.email === 'rahul.sharma@example.com', // one premium customer
        customerProfile: {
          create: { name: c.name, city: c.city, profileCompletionScore: 75 },
        },
      },
    })
  }

  // ─── 5 Designers ───────────────────────────────────────
  const designers = [
    {
      email: 'priya.mehta@example.com',
      name: 'Priya Mehta',
      firmName: 'Studio Aura',
      bio: 'Specialising in contemporary minimalism with warm, tactile materials. 8+ years transforming residential and commercial spaces across Mumbai and Pune.',
      experienceYears: 8,
      pricingTier: 'PREMIUM',
      areasServed: ['Mumbai', 'Pune', 'Goa'],
      certifications: ['NCIDQ Certified'],
      avgRating: 4.9,
      totalReviews: 24,
      isPremium: true,
      projects: [
        { title: 'Bandra Residence', description: 'A serene 3BHK transformation.', budgetMin: 1500000, budgetMax: 2200000, area: 'Mumbai', styleTags: ['Minimalist', 'Wabi-Sabi'] },
        { title: 'Koregaon Park Villa', description: 'Contemporary luxury with sustainable materials.', budgetMin: 4000000, budgetMax: 6000000, area: 'Pune', styleTags: ['Contemporary', 'Sustainable'] },
      ],
    },
    {
      email: 'arjun.sharma@example.com',
      name: 'Arjun Sharma',
      firmName: 'The Form Lab',
      bio: 'Architecture-influenced interior design. Every project starts with understanding how you live.',
      experienceYears: 5,
      pricingTier: 'MID',
      areasServed: ['Bangalore', 'Hyderabad'],
      certifications: [],
      avgRating: 4.7,
      totalReviews: 12,
      isPremium: true,
      projects: [
        { title: 'Indiranagar Home Office', description: 'A productive yet beautiful home office setup.', budgetMin: 800000, budgetMax: 1200000, area: 'Bangalore', styleTags: ['Modern', 'Industrial'] },
      ],
    },
    {
      email: 'neha.kapoor@example.com',
      name: 'Neha Kapoor',
      firmName: 'Kapoor Interiors',
      bio: 'Luxury residential design with a focus on craftsmanship and heritage-inspired aesthetics.',
      experienceYears: 12,
      pricingTier: 'PREMIUM',
      areasServed: ['Delhi', 'Noida', 'Gurugram'],
      certifications: ['NCIDQ Certified', 'IGBC Green Interior Specialist'],
      avgRating: 4.8,
      totalReviews: 36,
      isPremium: true,
      projects: [
        { title: 'Lutyens Delhi Bungalow', description: 'Heritage restoration with contemporary comfort.', budgetMin: 10000000, budgetMax: 15000000, area: 'Delhi', styleTags: ['Heritage', 'Luxury'] },
        { title: 'Gurugram Penthouse', description: 'Sky-high living with panoramic views.', budgetMin: 6000000, budgetMax: 9000000, area: 'Gurugram', styleTags: ['Contemporary', 'Luxury'] },
      ],
    },
    {
      email: 'vikram.nair@example.com',
      name: 'Vikram Nair',
      firmName: 'NairDesign',
      bio: 'Making great design accessible. Functional, beautiful interiors on every budget.',
      experienceYears: 3,
      pricingTier: 'BUDGET',
      areasServed: ['Hyderabad', 'Chennai'],
      certifications: [],
      avgRating: 4.5,
      totalReviews: 8,
      isPremium: false,
      projects: [
        { title: 'Jubilee Hills Apartment', description: '2BHK makeover under ₹10L.', budgetMin: 600000, budgetMax: 1000000, area: 'Hyderabad', styleTags: ['Modern', 'Budget-Friendly'] },
      ],
    },
    {
      email: 'sunita.rao@example.com',
      name: 'Sunita Rao',
      firmName: 'Spaces by Sunita',
      bio: 'Holistic interior design that combines Vastu principles with modern aesthetics.',
      experienceYears: 7,
      pricingTier: 'MID',
      areasServed: ['Chennai', 'Bangalore', 'Coimbatore'],
      certifications: ['Vastu Shastra Expert'],
      avgRating: 4.6,
      totalReviews: 19,
      isPremium: true,
      projects: [
        { title: 'RA Puram Villa', description: 'A Vastu-compliant family home with a modern touch.', budgetMin: 2000000, budgetMax: 3000000, area: 'Chennai', styleTags: ['Traditional', 'Vastu', 'Modern'] },
        { title: 'Whitefield Residence', description: 'Open-plan living for a young family.', budgetMin: 1500000, budgetMax: 2500000, area: 'Bangalore', styleTags: ['Contemporary', 'Family-Friendly'] },
      ],
    },
  ]

  for (const d of designers) {
    const slug = d.name.toLowerCase().replace(/\s+/g, '-') + '-' + Math.random().toString(36).slice(-4)
    const user = await prisma.user.upsert({
      where: { email: d.email },
      update: {},
      create: {
        email: d.email,
        passwordHash: password,
        role: 'DESIGNER',
        isEmailVerified: true,
        isPremium: d.isPremium,
        designerProfile: {
          create: {
            name: d.name,
            firmName: d.firmName,
            bio: d.bio,
            experienceYears: d.experienceYears,
            pricingTier: d.pricingTier,
            areasServed: d.areasServed,
            certifications: d.certifications,
            avgRating: d.avgRating,
            totalReviews: d.totalReviews,
            slug,
            status: 'APPROVED',
            profileCompletionScore: 90,
          },
        },
      },
      include: { designerProfile: true },
    })

    // Create projects
    if (user.designerProfile && d.projects) {
      for (const p of d.projects) {
        await prisma.project.upsert({
          where: { id: `seed-${slug}-${p.title.slice(0,10).replace(/\s/g, '')}` },
          update: {},
          create: {
            id: `seed-${slug}-${p.title.slice(0,10).replace(/\s/g, '')}`,
            designerId: user.designerProfile.id,
            ...p,
            status: 'PUBLISHED',
          },
        })
      }
    }
  }

  // ─── Admin user ─────────────────────────────────────────
  await prisma.user.upsert({
    where: { email: 'admin@designnest.in' },
    update: {},
    create: {
      email: 'admin@designnest.in',
      passwordHash: password,
      role: 'ADMIN',
      isEmailVerified: true,
    },
  })

  console.log('✓ Seed complete!')
  console.log('  Credentials (all): Password123!')
  console.log('  Admin: admin@designnest.in')
  console.log('  Sample customer (premium): rahul.sharma@example.com')
  console.log('  Sample designer: priya.mehta@example.com')
}

main().catch(e => { console.error(e); process.exit(1) }).finally(() => prisma.$disconnect())
