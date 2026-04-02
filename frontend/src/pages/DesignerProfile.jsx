import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Star, MapPin, Briefcase, MessageSquare, Heart, Award, ChevronLeft, ChevronRight, X } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import api from '@/lib/api'
import toast from 'react-hot-toast'

// Placeholder data for dev
const PLACEHOLDER = {
  id: '1', name: 'Priya Mehta', firmName: 'Studio Aura', slug: 'priya-mehta',
  bio: 'With over 8 years of experience, I specialise in creating serene, functional spaces that honour both the architecture and the people who inhabit them. My work blends contemporary minimalism with warm, tactile materials.',
  avgRating: 4.9, totalReviews: 24, pricingTier: 'PREMIUM',
  areasServed: ['Mumbai', 'Pune', 'Goa'], experienceYears: 8,
  certifications: ['NCIDQ Certified', 'IGBC Green Interior Specialist'],
  profilePhotoUrl: null,
  user: { isPremium: true },
  projects: [
    { id: 'p1', title: 'Bandra Residence', description: 'A 3BHK transformation with a Japanese-Wabi Sabi approach.',
      budgetMin: 1500000, budgetMax: 2200000, area: 'Mumbai', styleTags: ['Minimalist', 'Wabi-Sabi'],
      images: [] },
    { id: 'p2', title: 'Koregaon Park Villa', description: 'Contemporary luxury villa with sustainable materials.',
      budgetMin: 4000000, budgetMax: 6000000, area: 'Pune', styleTags: ['Contemporary', 'Sustainable'],
      images: [] },
    { id: 'p3', title: 'Sea-facing Apartment', description: 'Open-plan coastal living space.',
      budgetMin: 2500000, budgetMax: 3500000, area: 'Goa', styleTags: ['Coastal', 'Modern'],
      images: [] },
  ],
  reviews: [
    { id: 'r1', rating: 5, comment: 'Priya transformed our apartment beyond what we imagined. Her attention to detail and commitment to our vision was exceptional.', customer: { name: 'Aarav Shah' }, createdAt: '2025-11-10' },
    { id: 'r2', rating: 5, comment: 'Working with Studio Aura was a seamless experience. Priya\'s aesthetic is sophisticated yet approachable.', customer: { name: 'Meera Nair' }, createdAt: '2025-09-22' },
  ],
}

function StarRating({ value, size = 14 }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1,2,3,4,5].map(i => (
        <Star key={i} size={size}
          className={i <= Math.round(value) ? 'star-filled' : 'star-empty'}
          fill={i <= Math.round(value) ? 'currentColor' : 'none'} />
      ))}
    </div>
  )
}

function ReviewCard({ review }) {
  return (
    <div className="card p-5">
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="text-sm font-medium">{review.customer?.name ?? 'Anonymous'}</p>
          <p className="text-xs" style={{ color: 'var(--color-muted)' }}>
            {new Date(review.createdAt).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
          </p>
        </div>
        <StarRating value={review.rating} size={13} />
      </div>
      {review.comment && (
        <p className="text-sm leading-relaxed" style={{ color: 'var(--color-muted)' }}>
          "{review.comment}"
        </p>
      )}
    </div>
  )
}

function ProjectCard({ project, onClick }) {
  const hasImages = project.images?.length > 0
  return (
    <button onClick={() => onClick(project)}
      className="card card-hover overflow-hidden group text-left w-full">
      <div className="h-44 flex items-center justify-center overflow-hidden"
        style={{ background: 'rgba(168,131,98,0.06)' }}>
        {hasImages ? (
          <img src={project.images[0].thumbnailUrl || project.images[0].imageUrl}
            alt={project.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        ) : (
          <div className="text-4xl" style={{ fontFamily: 'Cormorant Garamond, serif', color: 'rgba(168,131,98,0.2)' }}>
            {project.title[0]}
          </div>
        )}
      </div>
      <div className="p-4">
        <h4 className="font-medium text-sm mb-1" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
          {project.title}
        </h4>
        <div className="flex flex-wrap gap-1.5 mb-2">
          {project.styleTags?.map(tag => (
            <span key={tag} className="badge badge-gray text-xs">{tag}</span>
          ))}
        </div>
        {project.budgetMin && (
          <p className="text-xs" style={{ color: 'var(--color-muted)' }}>
            ₹{(project.budgetMin / 100000).toFixed(1)}L – ₹{(project.budgetMax / 100000).toFixed(1)}L
          </p>
        )}
      </div>
    </button>
  )
}

export default function DesignerProfile() {
  const { slug } = useParams()
  const [designer, setDesigner] = useState(null)
  const [loading, setLoading] = useState(true)
  const [selectedProject, setSelectedProject] = useState(null)
  const { user, isAuthenticated } = useAuthStore()

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await api.get(`/designers/${slug}`)
        setDesigner(data.designer)
      } catch {
        setDesigner(PLACEHOLDER)
      } finally {
        setLoading(false)
      }
    }
    fetch()
  }, [slug])

  const canChat = isAuthenticated &&
    user?.role === 'CUSTOMER' &&
    user?.isPremium &&
    designer?.user?.isPremium

  const handleChat = () => {
    if (!isAuthenticated) { toast.error('Please sign in first'); return }
    if (!user?.isPremium) { toast.error('Upgrade to Premium to chat with designers'); return }
    if (!designer?.user?.isPremium) { toast.error('This designer does not have Premium enabled'); return }
    // navigate to messages / open chat
    toast.success('Opening conversation…')
  }

  if (loading) {
    return (
      <div className="pt-24 pb-20">
        <div className="container-page">
          <div className="skeleton h-72 rounded mb-8" />
          <div className="grid grid-cols-3 gap-4">
            {[1,2,3].map(i => <div key={i} className="skeleton h-44 rounded" />)}
          </div>
        </div>
      </div>
    )
  }

  if (!designer) return null

  const initials = designer.name?.split(' ').map(n => n[0]).join('')

  return (
    <div className="pt-20 pb-20">
      {/* ── Hero header ── */}
      <div
        className="border-b py-14"
        style={{ borderColor: 'var(--color-border)', background: 'var(--color-bg-alt)' }}
      >
        <div className="container-page">
          <Link to="/designers" className="inline-flex items-center gap-1.5 text-xs mb-8 opacity-60 hover:opacity-100 transition-opacity"
            style={{ color: 'var(--color-gold)' }}>
            <ChevronLeft size={14} /> All Designers
          </Link>

          <div className="flex flex-col sm:flex-row gap-8 items-start">
            {/* Photo */}
            <div className="flex-shrink-0">
              <div className="w-28 h-28 rounded-full overflow-hidden flex items-center justify-center"
                style={{ background: 'rgba(168,131,98,0.12)', border: '2px solid var(--color-border)' }}>
                {designer.profilePhotoUrl ? (
                  <img src={designer.profilePhotoUrl} alt={designer.name} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-3xl font-semibold"
                    style={{ fontFamily: 'Cormorant Garamond, serif', color: 'var(--color-gold-lt)' }}>
                    {initials}
                  </span>
                )}
              </div>
            </div>

            {/* Info */}
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <h1 className="text-4xl font-light" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
                  {designer.name}
                </h1>
                {designer.user?.isPremium && (
                  <span className="badge badge-gold"><Star size={11} fill="currentColor" /> Premium</span>
                )}
              </div>

              {designer.firmName && (
                <p className="text-base mb-3" style={{ color: 'var(--color-muted)' }}>{designer.firmName}</p>
              )}

              <div className="flex flex-wrap items-center gap-4 mb-4">
                <div className="flex items-center gap-1.5">
                  <StarRating value={designer.avgRating} />
                  <span className="text-sm font-medium" style={{ color: 'var(--color-gold-lt)' }}>
                    {designer.avgRating.toFixed(1)}
                  </span>
                  <span className="text-sm" style={{ color: 'var(--color-muted)' }}>
                    ({designer.totalReviews} reviews)
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-sm" style={{ color: 'var(--color-muted)' }}>
                  <MapPin size={14} style={{ color: 'var(--color-gold)' }} />
                  {designer.areasServed?.join(', ')}
                </div>
                <div className="flex items-center gap-1.5 text-sm" style={{ color: 'var(--color-muted)' }}>
                  <Briefcase size={14} style={{ color: 'var(--color-gold)' }} />
                  {designer.experienceYears} years experience
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mb-5">
                <span className={`badge ${
                  designer.pricingTier === 'PREMIUM' ? 'badge-gold' : 'badge-gray'
                }`}>
                  {designer.pricingTier === 'MID' ? 'Mid-range' : designer.pricingTier}
                </span>
                {designer.certifications?.map(c => (
                  <span key={c} className="badge badge-gray"><Award size={10} /> {c}</span>
                ))}
              </div>

              {/* Actions */}
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={handleChat}
                  disabled={!canChat && isAuthenticated && user?.role !== 'CUSTOMER'}
                  className={canChat ? 'btn-primary gap-2' : 'btn-outline gap-2'}
                >
                  <MessageSquare size={15} />
                  {canChat ? 'Chat with Designer' :
                    !isAuthenticated ? 'Sign in to Chat' :
                    !user?.isPremium ? 'Premium Required to Chat' :
                    'Chat Unavailable'}
                </button>
                {isAuthenticated && user?.role === 'CUSTOMER' && (
                  <button className="btn-outline gap-2">
                    <Heart size={15} /> Save
                  </button>
                )}
              </div>

              {!isAuthenticated && (
                <p className="text-xs mt-3" style={{ color: 'var(--color-muted)' }}>
                  <Link to="/pricing" style={{ color: 'var(--color-gold)' }}>Upgrade to Premium</Link> to unlock direct chat with designers.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="container-page py-14">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-14">
            {/* Bio */}
            {designer.bio && (
              <section>
                <div className="flex items-center gap-3 mb-5">
                  <span className="accent-line" />
                  <h2 className="text-2xl font-light" style={{ fontFamily: 'Cormorant Garamond, serif' }}>About</h2>
                </div>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--color-muted)' }}>{designer.bio}</p>
              </section>
            )}

            {/* Portfolio */}
            {designer.projects?.length > 0 && (
              <section>
                <div className="flex items-center gap-3 mb-5">
                  <span className="accent-line" />
                  <h2 className="text-2xl font-light" style={{ fontFamily: 'Cormorant Garamond, serif' }}>Portfolio</h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {designer.projects.filter(p => p.status !== 'DELETED').map(project => (
                    <ProjectCard key={project.id} project={project} onClick={setSelectedProject} />
                  ))}
                </div>
              </section>
            )}

            {/* Reviews */}
            {designer.reviews?.length > 0 && (
              <section>
                <div className="flex items-center gap-3 mb-5">
                  <span className="accent-line" />
                  <h2 className="text-2xl font-light" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
                    Reviews <span className="text-lg" style={{ color: 'var(--color-muted)' }}>({designer.reviews.length})</span>
                  </h2>
                </div>
                <div className="space-y-4">
                  {designer.reviews.map(r => <ReviewCard key={r.id} review={r} />)}
                </div>
              </section>
            )}
          </div>

          {/* Sidebar */}
          <aside className="space-y-6">
            <div className="card p-6">
              <h3 className="text-sm font-medium mb-4 uppercase tracking-wider" style={{ color: 'var(--color-gold)' }}>
                Details
              </h3>
              <dl className="space-y-3">
                {[
                  { label: 'Experience', value: `${designer.experienceYears} years` },
                  { label: 'Pricing', value: designer.pricingTier === 'MID' ? 'Mid-range' : designer.pricingTier },
                  { label: 'Projects', value: designer.projects?.length ?? 0 },
                  { label: 'Reviews', value: designer.totalReviews },
                ].map(({ label, value }) => (
                  <div key={label} className="flex justify-between text-sm">
                    <dt style={{ color: 'var(--color-muted)' }}>{label}</dt>
                    <dd className="font-medium">{value}</dd>
                  </div>
                ))}
              </dl>
            </div>

            <div className="card p-6">
              <h3 className="text-sm font-medium mb-4 uppercase tracking-wider" style={{ color: 'var(--color-gold)' }}>
                Areas Served
              </h3>
              <div className="flex flex-wrap gap-2">
                {designer.areasServed?.map(area => (
                  <span key={area} className="badge badge-gray">{area}</span>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </div>

      {/* Project lightbox */}
      {selectedProject && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 glass"
          onClick={() => setSelectedProject(null)}
        >
          <div
            className="card max-w-2xl w-full p-6 relative"
            onClick={e => e.stopPropagation()}
          >
            <button onClick={() => setSelectedProject(null)}
              className="absolute top-4 right-4 btn-ghost p-2">
              <X size={18} />
            </button>
            <h3 className="text-2xl font-light mb-2" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
              {selectedProject.title}
            </h3>
            <div className="flex flex-wrap gap-2 mb-4">
              {selectedProject.styleTags?.map(tag => (
                <span key={tag} className="badge badge-gold">{tag}</span>
              ))}
            </div>
            {selectedProject.description && (
              <p className="text-sm leading-relaxed mb-4" style={{ color: 'var(--color-muted)' }}>
                {selectedProject.description}
              </p>
            )}
            {selectedProject.budgetMin && (
              <p className="text-sm">
                <span style={{ color: 'var(--color-muted)' }}>Budget range: </span>
                <strong style={{ color: 'var(--color-gold-lt)' }}>
                  ₹{(selectedProject.budgetMin / 100000).toFixed(1)}L – ₹{(selectedProject.budgetMax / 100000).toFixed(1)}L
                </strong>
              </p>
            )}
            {selectedProject.images?.length === 0 && (
              <div className="mt-6 h-48 rounded flex items-center justify-center"
                style={{ background: 'rgba(168,131,98,0.06)', border: '1px dashed var(--color-border)' }}>
                <span className="text-sm" style={{ color: 'var(--color-muted)' }}>No photos uploaded yet</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
