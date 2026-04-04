import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { Star, SlidersHorizontal, Search, X, ChevronDown } from 'lucide-react'
import api from '@/lib/api'

const CITIES = ['Hyderabad', 'Mumbai', 'Bangalore', 'Delhi', 'Chennai', 'Pune', 'Kolkata', 'Ahmedabad', 'Jaipur', 'Surat']
const TIERS = [
  { value: 'BUDGET', label: 'Budget' },
  { value: 'MID', label: 'Mid-range' },
  { value: 'PREMIUM', label: 'Premium' },
]
const SORT_OPTIONS = [
  { value: 'rating_desc', label: 'Highest Rated' },
  { value: 'rating_asc', label: 'Lowest Rated' },
  { value: 'experience_desc', label: 'Most Experienced' },
  { value: 'newest', label: 'Newest' },
]

function StarRating({ value, size = 12 }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1,2,3,4,5].map(i => (
        <Star key={i} size={size}
          className={i <= Math.round(value) ? 'star-filled' : 'star-empty'}
          fill={i <= Math.round(value) ? 'currentColor' : 'none'} />
      ))}
      <span className="ml-1 text-xs" style={{ color: 'var(--color-muted)' }}>{value.toFixed(1)}</span>
    </div>
  )
}

function DesignerCard({ designer }) {
  const initials = designer.name?.split(' ').map(n => n[0]).join('') || 'D'
  return (
    <Link to={`/designers/${designer.slug}`} className="card card-hover overflow-hidden group block">
      <div className="h-52 flex items-center justify-center relative overflow-hidden"
        style={{ background: 'rgba(57,255,20,0.06)' }}>
        {designer.profilePhotoUrl ? (
          <img src={designer.profilePhotoUrl} alt={designer.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        ) : (
          <div className="w-16 h-16 rounded-full flex items-center justify-center text-xl font-semibold"
            style={{ background: 'rgba(57,255,20,0.15)', color: 'var(--color-gold-lt)',
              fontFamily: 'Cormorant Garamond, serif' }}>
            {initials}
          </div>
        )}
        <div className="absolute top-3 right-3 flex flex-col gap-1.5">
          {designer.user?.isPremium && (
            <span className="badge badge-gold"><Star size={10} fill="currentColor" /> Premium</span>
          )}
          <span className={`badge ${
            designer.pricingTier === 'PREMIUM' ? 'badge-gold' :
            designer.pricingTier === 'MID' ? 'badge-gray' : 'badge-gray'
          }`}>
            {designer.pricingTier === 'MID' ? 'Mid-range' : designer.pricingTier}
          </span>
        </div>
      </div>
      <div className="p-5">
        <h3 className="text-base font-medium mb-0.5" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
          {designer.name}
        </h3>
        {designer.firmName && (
          <p className="text-xs mb-2" style={{ color: 'var(--color-muted)' }}>{designer.firmName}</p>
        )}
        <StarRating value={designer.avgRating || 0} />
        <div className="flex items-center justify-between mt-3 pt-3 border-t"
          style={{ borderColor: 'var(--color-border)' }}>
          <span className="text-xs" style={{ color: 'var(--color-muted)' }}>
            {designer.areasServed?.slice(0, 2).join(', ')}
            {designer.areasServed?.length > 2 && ` +${designer.areasServed.length - 2}`}
          </span>
          <span className="text-xs" style={{ color: 'var(--color-muted)' }}>
            {designer.experienceYears}y exp
          </span>
        </div>
      </div>
    </Link>
  )
}

function DesignerCardSkeleton() {
  return (
    <div className="card overflow-hidden">
      <div className="h-52 skeleton" />
      <div className="p-5 space-y-3">
        <div className="skeleton h-5 w-3/4 rounded" />
        <div className="skeleton h-3 w-1/2 rounded" />
        <div className="skeleton h-3 w-2/3 rounded" />
      </div>
    </div>
  )
}

export default function Designers() {
  const [designers, setDesigners] = useState([])
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [filtersOpen, setFiltersOpen] = useState(false)

  const [filters, setFilters] = useState({
    search: '', sort: 'rating_desc',
    areas: [], tiers: [], minRating: 0, premiumOnly: false,
  })

  const [searchInput, setSearchInput] = useState('')

  const fetchDesigners = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page, limit: 12, sort: filters.sort,
        ...(filters.search && { search: filters.search }),
        ...(filters.areas.length && { area: filters.areas.join(',') }),
        ...(filters.tiers.length && { tier: filters.tiers.join(',') }),
        ...(filters.minRating > 0 && { min_rating: filters.minRating }),
        ...(filters.premiumOnly && { premium: 'true' }),
      })
      const { data } = await api.get(`/designers?${params}`)
      setDesigners(data.designers)
      setTotal(data.total)
    } catch {
      // Use placeholder data while API isn't ready
      setDesigners([
        { id: '1', name: 'Priya Mehta', firmName: 'Studio Aura', slug: 'priya-mehta',
          avgRating: 4.9, pricingTier: 'PREMIUM', areasServed: ['Mumbai', 'Pune'], experienceYears: 8,
          user: { isPremium: true } },
        { id: '2', name: 'Arjun Sharma', firmName: 'The Form Lab', slug: 'arjun-sharma',
          avgRating: 4.7, pricingTier: 'MID', areasServed: ['Bangalore'], experienceYears: 5,
          user: { isPremium: false } },
        { id: '3', name: 'Neha Kapoor', firmName: 'Kapoor Interiors', slug: 'neha-kapoor',
          avgRating: 4.8, pricingTier: 'PREMIUM', areasServed: ['Delhi', 'Noida'], experienceYears: 12,
          user: { isPremium: true } },
        { id: '4', name: 'Vikram Nair', firmName: 'NairDesign', slug: 'vikram-nair',
          avgRating: 4.5, pricingTier: 'BUDGET', areasServed: ['Hyderabad'], experienceYears: 3,
          user: { isPremium: false } },
        { id: '5', name: 'Sunita Rao', firmName: 'Spaces by Sunita', slug: 'sunita-rao',
          avgRating: 4.6, pricingTier: 'MID', areasServed: ['Chennai', 'Bangalore'], experienceYears: 7,
          user: { isPremium: true } },
      ])
      setTotal(5)
    } finally {
      setLoading(false)
    }
  }, [filters, page])

  useEffect(() => { fetchDesigners() }, [fetchDesigners])

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => setFilters(f => ({ ...f, search: searchInput })), 300)
    return () => clearTimeout(t)
  }, [searchInput])

  const toggleFilter = (key, value) => {
    setFilters(f => ({
      ...f,
      [key]: f[key].includes(value) ? f[key].filter(v => v !== value) : [...f[key], value],
    }))
    setPage(1)
  }

  const activeFilterCount = filters.areas.length + filters.tiers.length +
    (filters.minRating > 0 ? 1 : 0) + (filters.premiumOnly ? 1 : 0)

  return (
    <div className="pt-24 pb-20">
      <div className="container-page">
        {/* Header */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-3">
            <span className="accent-line" />
            <span className="text-xs uppercase tracking-widest" style={{ color: 'var(--color-gold)' }}>
              Browse
            </span>
          </div>
          <h1 className="text-4xl md:text-5xl font-light" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
            Interior Designers
          </h1>
          {!loading && (
            <p className="text-sm mt-2" style={{ color: 'var(--color-muted)' }}>
              {total} designers found
            </p>
          )}
        </div>

        {/* Search + Sort + Filter bar */}
        <div className="flex flex-wrap gap-3 mb-8">
          {/* Search */}
          <div className="relative flex-1 min-w-52">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2"
              style={{ color: 'var(--color-muted)' }} />
            <input
              className="input pl-10 pr-4"
              placeholder="Search designers, firms, styles…"
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
            />
            {searchInput && (
              <button onClick={() => setSearchInput('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 opacity-50 hover:opacity-100"
                style={{ color: 'var(--color-text)' }}>
                <X size={14} />
              </button>
            )}
          </div>

          {/* Sort */}
          <div className="relative">
            <select
              className="input pr-8 appearance-none cursor-pointer"
              style={{ paddingRight: '2rem' }}
              value={filters.sort}
              onChange={e => { setFilters(f => ({ ...f, sort: e.target.value })); setPage(1) }}
            >
              {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
              style={{ color: 'var(--color-muted)' }} />
          </div>

          {/* Filters toggle */}
          <button
            onClick={() => setFiltersOpen(o => !o)}
            className={`btn-outline gap-2 ${filtersOpen ? 'border-gold-DEFAULT' : ''}`}
            style={filtersOpen ? { borderColor: 'var(--color-gold)', color: 'var(--color-gold-lt)' } : {}}
          >
            <SlidersHorizontal size={15} />
            Filters
            {activeFilterCount > 0 && (
              <span className="badge badge-gold px-1.5 py-0">{activeFilterCount}</span>
            )}
          </button>
        </div>

        {/* Filter panel */}
        {filtersOpen && (
          <div className="card p-6 mb-8 animate-slide-down">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {/* Cities */}
              <div>
                <label className="label">City</label>
                <div className="flex flex-wrap gap-2">
                  {CITIES.map(city => (
                    <button key={city} type="button"
                      onClick={() => toggleFilter('areas', city)}
                      className="px-2.5 py-1 text-xs rounded border transition-all"
                      style={{
                        border: `1px solid ${filters.areas.includes(city) ? 'var(--color-gold)' : 'var(--color-border)'}`,
                        background: filters.areas.includes(city) ? 'rgba(57,255,20,0.12)' : 'transparent',
                        color: filters.areas.includes(city) ? 'var(--color-gold-lt)' : 'var(--color-muted)',
                      }}>
                      {city}
                    </button>
                  ))}
                </div>
              </div>

              {/* Pricing tier */}
              <div>
                <label className="label">Pricing tier</label>
                <div className="space-y-2">
                  {TIERS.map(tier => (
                    <label key={tier.value} className="flex items-center gap-2.5 cursor-pointer group">
                      <input type="checkbox" checked={filters.tiers.includes(tier.value)}
                        onChange={() => toggleFilter('tiers', tier.value)}
                        className="accent-[#39FF14]" />
                      <span className="text-sm group-hover:opacity-100 opacity-80">{tier.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Other */}
              <div>
                <label className="label">Min. rating</label>
                <input type="range" min={0} max={5} step={0.5}
                  value={filters.minRating}
                  onChange={e => { setFilters(f => ({ ...f, minRating: parseFloat(e.target.value) })); setPage(1) }}
                  className="w-full accent-[#39FF14]" />
                <div className="text-xs mt-1" style={{ color: 'var(--color-muted)' }}>
                  {filters.minRating > 0 ? `${filters.minRating}+ stars` : 'Any rating'}
                </div>
                <label className="flex items-center gap-2.5 cursor-pointer mt-4 group">
                  <input type="checkbox" checked={filters.premiumOnly}
                    onChange={e => { setFilters(f => ({ ...f, premiumOnly: e.target.checked })); setPage(1) }}
                    className="accent-[#39FF14]" />
                  <span className="text-sm group-hover:opacity-100 opacity-80">Premium designers only</span>
                </label>
              </div>
            </div>

            {activeFilterCount > 0 && (
              <button
                onClick={() => { setFilters(f => ({ ...f, areas: [], tiers: [], minRating: 0, premiumOnly: false })); setPage(1) }}
                className="btn-ghost text-xs mt-4 gap-1.5"
                style={{ color: 'var(--color-gold)' }}
              >
                <X size={13} /> Clear all filters
              </button>
            )}
          </div>
        )}

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {loading
            ? Array.from({ length: 12 }).map((_, i) => <DesignerCardSkeleton key={i} />)
            : designers.map(d => <DesignerCard key={d.id} designer={d} />)
          }
        </div>

        {/* Pagination */}
        {!loading && total > 12 && (
          <div className="flex justify-center gap-2 mt-12">
            {Array.from({ length: Math.ceil(total / 12) }).map((_, i) => (
              <button
                key={i}
                onClick={() => setPage(i + 1)}
                className="w-9 h-9 text-sm rounded transition-all"
                style={{
                  background: page === i + 1 ? 'var(--color-gold)' : 'var(--color-surface)',
                  color: page === i + 1 ? '#0B1929' : 'var(--color-muted)',
                  border: `1px solid ${page === i + 1 ? 'var(--color-gold)' : 'var(--color-border)'}`,
                }}
              >
                {i + 1}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
