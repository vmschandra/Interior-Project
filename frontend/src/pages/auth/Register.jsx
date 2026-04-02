import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Eye, EyeOff, ArrowRight, User, Briefcase } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import toast from 'react-hot-toast'

const CITIES = ['Hyderabad', 'Mumbai', 'Bangalore', 'Delhi', 'Chennai', 'Pune', 'Kolkata', 'Ahmedabad', 'Jaipur', 'Surat']
const PRICING_TIERS = [
  { value: 'BUDGET', label: 'Budget', desc: 'Up to ₹5L per project' },
  { value: 'MID', label: 'Mid-range', desc: '₹5L – ₹20L per project' },
  { value: 'PREMIUM', label: 'Premium', desc: '₹20L+ per project' },
]

export default function Register() {
  const [searchParams] = useSearchParams()
  const defaultRole = searchParams.get('role') === 'designer' ? 'DESIGNER' : 'CUSTOMER'

  const [role, setRole] = useState(defaultRole)
  const [step, setStep] = useState(1)
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)

  const [form, setForm] = useState({
    // Common
    email: '', phone: '', password: '',
    // Customer
    name: '', city: '',
    // Designer
    firmName: '', experienceYears: '', pricingTier: 'BUDGET',
    bio: '', areasServed: [],
  })

  const { register } = useAuthStore()
  const navigate = useNavigate()

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }))

  const toggleCity = (city) => {
    setForm(f => ({
      ...f,
      areasServed: f.areasServed.includes(city)
        ? f.areasServed.filter(c => c !== city)
        : [...f.areasServed, city],
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (role === 'DESIGNER' && step < 3) { setStep(s => s + 1); return }
    setLoading(true)
    try {
      const payload = role === 'CUSTOMER'
        ? { role, email: form.email, phone: form.phone, password: form.password, name: form.name, city: form.city }
        : { role, email: form.email, phone: form.phone, password: form.password, name: form.name,
            firmName: form.firmName, experienceYears: parseInt(form.experienceYears) || 0,
            pricingTier: form.pricingTier, bio: form.bio, areasServed: form.areasServed }
      const { user } = await register(payload)
      toast.success(role === 'DESIGNER'
        ? 'Profile submitted for review. We'll notify you within 24–48 hours.'
        : 'Account created! Welcome to DesignNest.')
      navigate(role === 'DESIGNER' ? '/dashboard/designer' : '/dashboard/customer')
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  const totalSteps = role === 'DESIGNER' ? 3 : 1

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-16"
      style={{ background: 'var(--color-bg)' }}
    >
      <div className="w-full max-w-lg">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2.5 mb-5">
            <div
              className="w-9 h-9 rounded flex items-center justify-center text-sm font-bold"
              style={{ background: 'var(--color-gold)', color: '#1A1612' }}
            >
              DN
            </div>
            <span
              className="text-2xl font-semibold"
              style={{ fontFamily: 'Cormorant Garamond, serif', color: 'var(--color-gold-lt)' }}
            >
              DesignNest
            </span>
          </Link>
          <h1 className="text-3xl font-light mb-1" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
            Create your account
          </h1>
          {role === 'DESIGNER' && (
            <p className="text-xs" style={{ color: 'var(--color-muted)' }}>
              Step {step} of {totalSteps}
            </p>
          )}
        </div>

        {/* Role toggle */}
        <div
          className="flex gap-1 p-1 rounded mb-6"
          style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
        >
          {[
            { value: 'CUSTOMER', icon: User, label: 'I need a designer' },
            { value: 'DESIGNER', icon: Briefcase, label: 'I am a designer' },
          ].map(({ value, icon: Icon, label }) => (
            <button
              key={value}
              type="button"
              onClick={() => { setRole(value); setStep(1) }}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium rounded transition-all"
              style={{
                background: role === value ? 'var(--color-gold)' : 'transparent',
                color: role === value ? '#1A1612' : 'var(--color-muted)',
              }}
            >
              <Icon size={15} /> {label}
            </button>
          ))}
        </div>

        <div className="card p-8">
          <form onSubmit={handleSubmit} className="space-y-5">

            {/* ─── Step 1: Common fields ── */}
            {step === 1 && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="label">Full name</label>
                    <input className="input" placeholder="Priya Mehta" value={form.name}
                      onChange={e => set('name', e.target.value)} required />
                  </div>
                  <div className="col-span-2">
                    <label className="label">Email address</label>
                    <input type="email" className="input" placeholder="you@example.com" value={form.email}
                      onChange={e => set('email', e.target.value)} required />
                  </div>
                  <div>
                    <label className="label">Phone</label>
                    <input type="tel" className="input" placeholder="+91 9876543210" value={form.phone}
                      onChange={e => set('phone', e.target.value)} />
                  </div>
                  <div>
                    {role === 'CUSTOMER' && (
                      <>
                        <label className="label">City</label>
                        <select className="input" value={form.city} onChange={e => set('city', e.target.value)}>
                          <option value="">Select city</option>
                          {CITIES.map(c => <option key={c}>{c}</option>)}
                        </select>
                      </>
                    )}
                    {role === 'DESIGNER' && (
                      <>
                        <label className="label">Firm name (optional)</label>
                        <input className="input" placeholder="Studio Aura" value={form.firmName}
                          onChange={e => set('firmName', e.target.value)} />
                      </>
                    )}
                  </div>
                  <div className="col-span-2">
                    <label className="label">Password</label>
                    <div className="relative">
                      <input type={showPw ? 'text' : 'password'} className="input pr-11"
                        placeholder="Min. 8 characters" value={form.password}
                        onChange={e => set('password', e.target.value)}
                        required minLength={8} />
                      <button type="button" onClick={() => setShowPw(v => !v)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 opacity-50 hover:opacity-100"
                        style={{ color: 'var(--color-text)' }}>
                        {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* ─── Step 2 (Designer): Professional info ── */}
            {role === 'DESIGNER' && step === 2 && (
              <>
                <div>
                  <label className="label">Years of experience</label>
                  <input type="number" className="input" placeholder="e.g. 5" min={0} max={50}
                    value={form.experienceYears} onChange={e => set('experienceYears', e.target.value)} />
                </div>
                <div>
                  <label className="label">Pricing tier</label>
                  <div className="grid grid-cols-3 gap-3">
                    {PRICING_TIERS.map(tier => (
                      <button
                        key={tier.value}
                        type="button"
                        onClick={() => set('pricingTier', tier.value)}
                        className="p-3 text-left rounded border transition-all"
                        style={{
                          border: `1px solid ${form.pricingTier === tier.value ? 'var(--color-gold)' : 'var(--color-border)'}`,
                          background: form.pricingTier === tier.value ? 'rgba(168,131,98,0.08)' : 'transparent',
                        }}
                      >
                        <div className="text-xs font-medium mb-0.5" style={{ color: form.pricingTier === tier.value ? 'var(--color-gold-lt)' : 'var(--color-text)' }}>
                          {tier.label}
                        </div>
                        <div className="text-xs" style={{ color: 'var(--color-muted)' }}>{tier.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="label">Bio</label>
                  <textarea
                    className="input resize-none"
                    rows={3}
                    placeholder="Tell clients about your design philosophy and approach…"
                    value={form.bio}
                    onChange={e => set('bio', e.target.value)}
                    maxLength={500}
                  />
                </div>
              </>
            )}

            {/* ─── Step 3 (Designer): Areas served ── */}
            {role === 'DESIGNER' && step === 3 && (
              <>
                <div>
                  <label className="label">Areas / cities served</label>
                  <p className="text-xs mb-3" style={{ color: 'var(--color-muted)' }}>
                    Select all cities you serve
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {CITIES.map(city => (
                      <button
                        key={city}
                        type="button"
                        onClick={() => toggleCity(city)}
                        className="px-3 py-1.5 text-xs rounded border transition-all"
                        style={{
                          border: `1px solid ${form.areasServed.includes(city) ? 'var(--color-gold)' : 'var(--color-border)'}`,
                          background: form.areasServed.includes(city) ? 'rgba(168,131,98,0.12)' : 'transparent',
                          color: form.areasServed.includes(city) ? 'var(--color-gold-lt)' : 'var(--color-muted)',
                        }}
                      >
                        {city}
                      </button>
                    ))}
                  </div>
                  {form.areasServed.length === 0 && (
                    <p className="text-xs mt-2" style={{ color: 'rgba(168,131,98,0.6)' }}>
                      Select at least one city to continue
                    </p>
                  )}
                </div>
              </>
            )}

            {/* Actions */}
            <div className="flex items-center gap-3 pt-1">
              {step > 1 && (
                <button type="button" onClick={() => setStep(s => s - 1)} className="btn-outline flex-1 justify-center">
                  Back
                </button>
              )}
              <button
                type="submit"
                disabled={loading || (role === 'DESIGNER' && step === 3 && form.areasServed.length === 0)}
                className="btn-primary flex-1 justify-center"
              >
                {loading ? 'Creating account…' :
                  role === 'DESIGNER' && step < totalSteps ? 'Continue' : 'Create Account'}
                <ArrowRight size={15} />
              </button>
            </div>
          </form>
        </div>

        <p className="text-center text-sm mt-6" style={{ color: 'var(--color-muted)' }}>
          Already have an account?{' '}
          <Link to="/login" className="font-medium" style={{ color: 'var(--color-gold-lt)' }}>
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
