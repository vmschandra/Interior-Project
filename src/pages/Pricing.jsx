import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Check, Star, ArrowRight } from 'lucide-react'

const plans = {
  customer: {
    monthly: { price: 1000, period: 'month', display: '₹1,000' },
    yearly:  { price: 9000, period: 'year',  display: '₹9,000', savings: '₹3,000 saved' },
    features: [
      'Direct chat with any premium designer',
      'Unlimited designer conversations',
      'Priority support',
      'Chat history preserved',
    ],
  },
  designer: {
    monthly: { price: 200,  period: 'month', display: '₹200' },
    yearly:  { price: 1800, period: 'year',  display: '₹1,800', savings: '₹600 saved' },
    features: [
      'Receive chat messages from customers',
      '"Premium" badge on your profile',
      'Priority placement in search results',
      'Unlimited portfolio projects',
      'Profile analytics dashboard',
    ],
  },
}

export default function Pricing() {
  const [billing, setBilling] = useState('yearly')

  return (
    <div className="pt-24 pb-20">
      <div className="container-narrow">
        {/* Header */}
        <div className="text-center mb-14">
          <div className="flex items-center justify-center gap-3 mb-4">
            <span className="accent-line" />
            <span className="text-xs uppercase tracking-widest" style={{ color: 'var(--color-gold)' }}>Pricing</span>
            <span className="accent-line" />
          </div>
          <h1 className="text-5xl font-light mb-4" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
            Simple, transparent pricing
          </h1>
          <p className="text-base" style={{ color: 'var(--color-muted)' }}>
            Upgrade to Premium to unlock direct communication between clients and designers.
          </p>

          {/* Billing toggle */}
          <div className="inline-flex items-center gap-1 mt-8 p-1 rounded"
            style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
            {['monthly', 'yearly'].map(b => (
              <button
                key={b}
                onClick={() => setBilling(b)}
                className="px-5 py-2 text-sm font-medium rounded transition-all capitalize"
                style={{
                  background: billing === b ? 'var(--color-gold)' : 'transparent',
                  color: billing === b ? '#0B1929' : 'var(--color-muted)',
                }}
              >
                {b} {b === 'yearly' && <span className="text-xs ml-1 opacity-80">(save 25%)</span>}
              </button>
            ))}
          </div>
        </div>

        {/* Plan cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[
            { role: 'customer', title: 'Customer Premium', subtitle: 'For homeowners & clients', icon: '🏠', highlight: false },
            { role: 'designer', title: 'Designer Premium', subtitle: 'For interior designers', icon: '✦', highlight: true },
          ].map(({ role, title, subtitle, icon, highlight }) => {
            const plan = plans[role][billing]
            return (
              <div
                key={role}
                className="card p-8 relative overflow-hidden"
                style={highlight ? { border: '1px solid var(--color-gold)', background: 'rgba(57,255,20,0.04)' } : {}}
              >
                {highlight && (
                  <div className="absolute top-0 left-0 right-0 h-0.5"
                    style={{ background: 'linear-gradient(90deg, transparent, var(--color-gold), transparent)' }} />
                )}

                <div className="text-2xl mb-4">{icon}</div>
                <h2 className="text-2xl font-light mb-1" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
                  {title}
                </h2>
                <p className="text-sm mb-6" style={{ color: 'var(--color-muted)' }}>{subtitle}</p>

                <div className="flex items-end gap-2 mb-2">
                  <span className="text-5xl font-light" style={{ fontFamily: 'Cormorant Garamond, serif', color: 'var(--color-gold-lt)' }}>
                    {plan.display}
                  </span>
                  <span className="text-sm mb-2" style={{ color: 'var(--color-muted)' }}>/ {plan.period}</span>
                </div>

                {billing === 'yearly' && (
                  <div className="badge badge-gold mb-6">{plan.savings}</div>
                )}
                {billing === 'monthly' && <div className="mb-6" />}

                <ul className="space-y-3 mb-8">
                  {plans[role].features.map(f => (
                    <li key={f} className="flex items-start gap-2.5 text-sm">
                      <Check size={15} className="flex-shrink-0 mt-0.5" style={{ color: 'var(--color-gold)' }} />
                      <span style={{ color: 'var(--color-muted)' }}>{f}</span>
                    </li>
                  ))}
                </ul>

                <Link
                  to={`/register?role=${role}`}
                  className={highlight ? 'btn-primary w-full justify-center' : 'btn-outline w-full justify-center'}
                >
                  Get Started <ArrowRight size={15} />
                </Link>
              </div>
            )
          })}
        </div>

        {/* FAQ note */}
        <div className="mt-14 text-center">
          <p className="text-sm" style={{ color: 'var(--color-muted)' }}>
            All plans include a 3-day grace period after expiry.
            Cancel anytime — features remain active until your billing cycle ends.
          </p>
        </div>
      </div>
    </div>
  )
}
