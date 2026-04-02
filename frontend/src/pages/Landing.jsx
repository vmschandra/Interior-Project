import { Link } from 'react-router-dom'
import { ArrowRight, Star, Users, Award, Shield } from 'lucide-react'

const featuredDesigners = [
  { name: 'Priya Mehta', firm: 'Studio Aura', city: 'Mumbai', tier: 'PREMIUM', rating: 4.9, projects: 18, photo: null },
  { name: 'Arjun Sharma', firm: 'The Form Lab', city: 'Bangalore', tier: 'MID', rating: 4.7, projects: 12, photo: null },
  { name: 'Neha Kapoor', firm: 'Kapoor Interiors', city: 'Delhi', tier: 'PREMIUM', rating: 4.8, projects: 22, photo: null },
]

const stats = [
  { icon: Users, value: '500+', label: 'Verified Designers' },
  { icon: Award, value: '4,200+', label: 'Projects Completed' },
  { icon: Star, value: '4.8', label: 'Average Rating' },
  { icon: Shield, value: '100%', label: 'Vetted Profiles' },
]

const steps = [
  { num: '01', title: 'Discover', body: 'Browse our curated network of interior designers filtered by city, style, and budget.' },
  { num: '02', title: 'Connect', body: 'Upgrade to Premium and chat directly with designers whose work speaks to you.' },
  { num: '03', title: 'Transform', body: 'Collaborate on your vision and watch your space come to life.' },
]

function StarRating({ value }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1,2,3,4,5].map(i => (
        <Star
          key={i}
          size={12}
          className={i <= Math.round(value) ? 'star-filled' : 'star-empty'}
          fill={i <= Math.round(value) ? 'currentColor' : 'none'}
        />
      ))}
      <span className="ml-1.5 text-xs" style={{ color: 'var(--color-muted)' }}>{value}</span>
    </div>
  )
}

function DesignerCard({ designer }) {
  const initials = designer.name.split(' ').map(n => n[0]).join('')
  return (
    <div className="card card-hover overflow-hidden group">
      {/* Photo placeholder */}
      <div
        className="h-56 flex items-center justify-center relative overflow-hidden"
        style={{ background: 'rgba(168,131,98,0.08)' }}
      >
        <div
          className="w-20 h-20 rounded-full flex items-center justify-center text-2xl font-semibold"
          style={{
            background: 'rgba(168,131,98,0.15)',
            color: 'var(--color-gold-lt)',
            fontFamily: 'Cormorant Garamond, serif',
          }}
        >
          {initials}
        </div>
        {designer.tier === 'PREMIUM' && (
          <div className="absolute top-3 right-3 badge badge-gold">
            <Star size={10} fill="currentColor" /> Premium
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-5">
        <div className="flex items-start justify-between gap-2 mb-1">
          <div>
            <h3 className="text-base font-medium" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
              {designer.name}
            </h3>
            <p className="text-xs" style={{ color: 'var(--color-muted)' }}>{designer.firm}</p>
          </div>
        </div>
        <StarRating value={designer.rating} />
        <div className="flex items-center justify-between mt-3 pt-3 border-t" style={{ borderColor: 'var(--color-border)' }}>
          <span className="text-xs" style={{ color: 'var(--color-muted)' }}>{designer.city}</span>
          <span className="text-xs" style={{ color: 'var(--color-muted)' }}>{designer.projects} projects</span>
        </div>
      </div>
    </div>
  )
}

export default function Landing() {
  return (
    <div>
      {/* ── Hero ─────────────────────────────────────────────────── */}
      <section className="relative min-h-screen flex items-center pt-16 overflow-hidden">
        {/* Background texture */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse 80% 60% at 60% 40%, rgba(168,131,98,0.07) 0%, transparent 70%)',
          }}
        />
        {/* Horizontal rule accent */}
        <div
          className="absolute left-0 right-0 top-1/2 -translate-y-1/2 pointer-events-none"
          style={{ height: '1px', background: 'linear-gradient(90deg, transparent, rgba(168,131,98,0.12), transparent)' }}
        />

        <div className="container-page relative z-10 py-24 lg:py-32">
          <div className="max-w-3xl">
            <div className="flex items-center gap-3 mb-8">
              <span className="accent-line" />
              <span className="text-xs uppercase tracking-widest" style={{ color: 'var(--color-gold)' }}>
                Interior Design Marketplace
              </span>
            </div>

            <h1
              className="text-5xl md:text-6xl lg:text-7xl font-light mb-6"
              style={{ fontFamily: 'Cormorant Garamond, serif', lineHeight: '1.05' }}
            >
              Where spaces find
              <br />
              <span className="text-gradient font-medium">their story.</span>
            </h1>

            <p className="text-lg md:text-xl leading-relaxed mb-10 max-w-xl" style={{ color: 'var(--color-muted)' }}>
              Discover exceptional interior designers across India. Browse curated portfolios,
              find your perfect match, and transform your space with confidence.
            </p>

            <div className="flex flex-wrap items-center gap-4">
              <Link to="/designers" className="btn-primary gap-2">
                Browse Designers <ArrowRight size={16} />
              </Link>
              <Link to="/register?role=designer" className="btn-outline">
                Join as Designer
              </Link>
            </div>

            <div className="flex items-center gap-6 mt-12">
              <div className="flex -space-x-2">
                {['P','A','N','R','S'].map((initial, i) => (
                  <div
                    key={i}
                    className="w-8 h-8 rounded-full border-2 flex items-center justify-center text-xs font-medium"
                    style={{
                      borderColor: 'var(--color-bg)',
                      background: `hsl(${30 + i * 12}, 35%, ${25 + i * 4}%)`,
                      color: 'var(--color-gold-lt)',
                    }}
                  >
                    {initial}
                  </div>
                ))}
              </div>
              <p className="text-sm" style={{ color: 'var(--color-muted)' }}>
                <span style={{ color: 'var(--color-gold-lt)' }}>500+</span> designers ready to collaborate
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats ────────────────────────────────────────────────── */}
      <section
        className="border-y py-14"
        style={{ borderColor: 'var(--color-border)', background: 'var(--color-bg-alt)' }}
      >
        <div className="container-page grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map(({ icon: Icon, value, label }) => (
            <div key={label} className="text-center">
              <Icon size={20} className="mx-auto mb-3" style={{ color: 'var(--color-gold)' }} />
              <div
                className="text-3xl font-light mb-1"
                style={{ fontFamily: 'Cormorant Garamond, serif', color: 'var(--color-gold-lt)' }}
              >
                {value}
              </div>
              <div className="text-xs uppercase tracking-widest" style={{ color: 'var(--color-muted)' }}>{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Featured Designers ───────────────────────────────────── */}
      <section className="py-24">
        <div className="container-page">
          <div className="flex items-end justify-between mb-12">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <span className="accent-line" />
                <span className="text-xs uppercase tracking-widest" style={{ color: 'var(--color-gold)' }}>
                  Featured
                </span>
              </div>
              <h2 className="text-4xl md:text-5xl font-light" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
                Exceptional talent,<br />curated for you.
              </h2>
            </div>
            <Link to="/designers" className="hidden sm:flex btn-outline text-xs">
              View All <ArrowRight size={14} />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredDesigners.map(d => (
              <DesignerCard key={d.name} designer={d} />
            ))}
          </div>

          <div className="mt-8 text-center sm:hidden">
            <Link to="/designers" className="btn-outline">View All Designers</Link>
          </div>
        </div>
      </section>

      {/* ── How It Works ─────────────────────────────────────────── */}
      <section
        className="py-24 border-t"
        style={{ borderColor: 'var(--color-border)', background: 'var(--color-bg-alt)' }}
      >
        <div className="container-page">
          <div className="text-center mb-16">
            <div className="flex items-center justify-center gap-3 mb-3">
              <span className="accent-line" />
              <span className="text-xs uppercase tracking-widest" style={{ color: 'var(--color-gold)' }}>
                The Process
              </span>
              <span className="accent-line" />
            </div>
            <h2 className="text-4xl md:text-5xl font-light" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
              Simple. Refined. Effective.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-16">
            {steps.map((step, i) => (
              <div key={step.num} className="relative">
                {i < steps.length - 1 && (
                  <div
                    className="hidden md:block absolute top-6 left-full w-full h-px -translate-x-8"
                    style={{ background: 'linear-gradient(90deg, var(--color-gold), transparent)' }}
                  />
                )}
                <div
                  className="text-5xl font-light mb-6"
                  style={{ fontFamily: 'Cormorant Garamond, serif', color: 'rgba(168,131,98,0.2)' }}
                >
                  {step.num}
                </div>
                <h3 className="text-2xl font-medium mb-3" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
                  {step.title}
                </h3>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--color-muted)' }}>
                  {step.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Banner ───────────────────────────────────────────── */}
      <section className="py-24 relative overflow-hidden">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse 60% 80% at 50% 50%, rgba(168,131,98,0.08) 0%, transparent 70%)',
          }}
        />
        <div className="container-narrow text-center relative z-10">
          <div className="flex items-center justify-center gap-3 mb-4">
            <span className="accent-line" />
            <span className="text-xs uppercase tracking-widest" style={{ color: 'var(--color-gold)' }}>
              For Designers
            </span>
            <span className="accent-line" />
          </div>
          <h2 className="text-4xl md:text-5xl font-light mb-5" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
            Showcase your craft.<br />Grow your clientele.
          </h2>
          <p className="text-base mb-10" style={{ color: 'var(--color-muted)' }}>
            Join India's premier interior design platform. Build your portfolio, connect with
            premium clients, and take your practice to the next level.
          </p>
          <Link to="/register?role=designer" className="btn-primary">
            Apply as a Designer <ArrowRight size={16} />
          </Link>
        </div>
      </section>
    </div>
  )
}
