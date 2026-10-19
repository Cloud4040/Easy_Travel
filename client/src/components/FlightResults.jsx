import { useMemo, useState } from 'react'

const formatDuration = (iso) => {
  const match = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?/)
  const h = match?.[1] || '0'
  const m = match?.[2] || '0'
  return `${h}h ${m}m`
}

const durationToMinutes = (iso) => {
  const match = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?/)
  return Number(match?.[1] || 0) * 60 + Number(match?.[2] || 0)
}

const formatTime = (dt) => dt ? new Date(dt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'
const formatDate = (dt) => dt ? new Date(dt).toLocaleDateString([], { month: 'short', day: 'numeric' }) : ''

const formatPrice = (amount, currency) => {
  try {
    return new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency,
      maximumFractionDigits: 0
    }).format(amount)
  } catch {
    return `${currency} ${amount}`
  }
}

export default function FlightResults({ flights, onSelect, source }) {
  const [sortBy, setSortBy] = useState('price')
  const [directOnly, setDirectOnly] = useState(false)

  const visible = useMemo(() => {
    let list = [...flights]
    if (directOnly) list = list.filter(f => f.stops === 0)
    if (sortBy === 'price') list.sort((a, b) => Number(a.price) - Number(b.price))
    if (sortBy === 'duration') list.sort((a, b) => durationToMinutes(a.duration) - durationToMinutes(b.duration))
    if (sortBy === 'departure') list.sort((a, b) => new Date(a.departure) - new Date(b.departure))
    return list
  }, [flights, sortBy, directOnly])

  if (flights.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-4xl mb-3">🔍</p>
        <p className="text-gray-400 font-medium">No flights found for this route.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-400 text-sm font-medium">{visible.length} flights found</p>
          {source === 'travelpayouts' && (
            <p className="text-xs text-gray-400 mt-0.5">
              Cached prices from Aviasales (last 48h) — availability is confirmed on the partner site.
            </p>
          )}
        </div>
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-1.5 text-sm text-gray-500 cursor-pointer">
            <input
              type="checkbox"
              checked={directOnly}
              onChange={e => setDirectOnly(e.target.checked)}
              className="rounded border-gray-300 text-sky-500 focus:ring-sky-300"
            />
            Direct only
          </label>
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-sky-300"
          >
            <option value="price">Cheapest</option>
            <option value="duration">Fastest</option>
            <option value="departure">Earliest</option>
          </select>
        </div>
      </div>

      {visible.length === 0 && (
        <div className="text-center py-12 bg-sky-50 rounded-2xl">
          <p className="text-gray-400 font-medium">No direct flights — try unchecking "Direct only".</p>
        </div>
      )}

      {visible.map(flight => (
        <button
          key={flight.id}
          onClick={() => onSelect?.(flight)}
          className="w-full text-left bg-white border border-sky-100 rounded-2xl p-5 flex items-center justify-between gap-4 hover:shadow-md hover:border-sky-300 transition-all"
        >
          <div className="space-y-1 w-32 shrink-0">
            <p className="font-bold text-gray-800 truncate">{flight.airline}</p>
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${flight.stops === 0 ? 'bg-green-100 text-green-600' : 'bg-amber-100 text-amber-600'}`}>
              {flight.stops === 0 ? 'Direct' : `${flight.stops} stop${flight.stops > 1 ? 's' : ''}`}
            </span>
          </div>
          <div className="text-center">
            <p className="text-xl font-bold text-gray-800">{formatTime(flight.departure)}</p>
            <p className="text-gray-400 text-xs font-medium">{flight.origin} · {formatDate(flight.departure)}</p>
          </div>
          <div className="flex flex-col items-center text-gray-300 flex-1 min-w-24">
            <span className="text-xs text-gray-400 mb-1">{formatDuration(flight.duration)}</span>
            <div className="flex items-center gap-1 w-full max-w-32">
              <div className="flex-1 h-px bg-gray-200"></div>
              <span>✈️</span>
              <div className="flex-1 h-px bg-gray-200"></div>
            </div>
          </div>
          <div className="text-center">
            <p className="text-xl font-bold text-gray-800">{formatTime(flight.arrival)}</p>
            <p className="text-gray-400 text-xs font-medium">{flight.destination} · {formatDate(flight.arrival)}</p>
          </div>
          <div className="text-right w-32 shrink-0">
            <p className="text-2xl font-extrabold text-sky-500">{formatPrice(flight.price, flight.currency)}</p>
            <p className="text-gray-400 text-xs">per person</p>
          </div>
        </button>
      ))}
    </div>
  )
}
