import { useState } from 'react'
import { Link } from 'react-router-dom'
import Layout from '../components/Layout'
import destinations from '../data/destinations'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

const BUDGETS = [
  { value: 'budget', label: '🎒 Budget' },
  { value: 'moderate', label: '🧳 Moderate' },
  { value: 'luxury', label: '💎 Luxury' },
]

export default function Plan() {
  const [form, setForm] = useState({
    destination: '',
    days: 3,
    budget: 'moderate',
    origin: '',
    interests: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [plan, setPlan] = useState(null)

  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const submit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setPlan(null)
    try {
      const response = await fetch(`${API_URL}/api/trips/plan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      })
      const data = await response.json()
      if (data.success) {
        setPlan(data.plan)
      } else {
        setError(data.error || 'Could not generate a trip plan.')
      }
    } catch {
      setError('Could not connect to server.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Layout>
      <section className="bg-gradient-to-br from-sky-50 to-white px-6 py-12 text-center">
        <span className="text-4xl block mb-3">🤖</span>
        <h2 className="text-3xl font-extrabold text-gray-800 mb-2">AI Trip Planner</h2>
        <p className="text-gray-400 max-w-lg mx-auto">Tell us where you're headed, your budget, and what you love — we'll build the perfect day-by-day itinerary.</p>
      </section>

      <section className="max-w-3xl mx-auto px-6 py-10 w-full">
        <form onSubmit={submit} className="bg-white rounded-2xl shadow-lg border border-sky-100 p-6 mb-10">
          {error && (
            <div className="bg-red-50 border border-red-100 text-red-500 text-sm rounded-xl px-4 py-3 mb-4">
              {error}
            </div>
          )}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1 block">Destination</label>
              <input
                name="destination"
                value={form.destination}
                onChange={handle}
                required
                placeholder="e.g. Tokyo"
                list="destination-options"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-800 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-sky-300 transition"
              />
              <datalist id="destination-options">
                {destinations.map(d => (
                  <option key={d.id} value={d.city} />
                ))}
              </datalist>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1 block">Flying From (optional)</label>
              <input
                name="origin"
                value={form.origin}
                onChange={handle}
                placeholder="e.g. LHR"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-800 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-sky-300 transition"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1 block">Days</label>
              <input
                name="days"
                type="number"
                min="1"
                max="14"
                value={form.days}
                onChange={handle}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-sky-300 transition"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1 block">Budget</label>
              <div className="flex gap-2">
                {BUDGETS.map(b => (
                  <button
                    key={b.value}
                    type="button"
                    onClick={() => setForm({ ...form, budget: b.value })}
                    className={`flex-1 rounded-xl py-3 text-sm font-semibold border transition-colors ${
                      form.budget === b.value
                        ? 'bg-sky-500 border-sky-500 text-white'
                        : 'bg-white border-gray-200 text-gray-500 hover:border-sky-300'
                    }`}
                  >
                    {b.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="mb-6">
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1 block">Interests</label>
            <input
              name="interests"
              value={form.interests}
              onChange={handle}
              placeholder="e.g. food, temples, hiking, nightlife"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-800 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-sky-300 transition"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-sky-500 hover:bg-sky-400 disabled:bg-sky-200 text-white rounded-xl py-3 font-bold transition-colors shadow-sm"
          >
            {loading ? '🤖 Planning your trip...' : 'Generate Itinerary'}
          </button>
        </form>

        {loading && (
          <div className="text-center py-10">
            <p className="text-4xl mb-3 animate-bounce">🗺️</p>
            <p className="text-gray-400 font-medium">Picking the best spots for you...</p>
          </div>
        )}

        {plan && (
          <div className="space-y-6">
            <div className="bg-sky-50 border border-sky-100 rounded-2xl p-6">
              <p className="text-gray-600 leading-relaxed">{plan.summary}</p>
              {plan.estimatedCost && (
                <p className="text-sky-500 font-bold mt-3">💰 Estimated cost: {plan.estimatedCost}</p>
              )}
            </div>

            {plan.days?.map(day => (
              <div key={day.day} className="bg-white border border-sky-100 rounded-2xl p-6 hover:shadow-md transition-all">
                <div className="flex items-center gap-3 mb-3">
                  <span className="bg-sky-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm shrink-0">
                    {day.day}
                  </span>
                  <h3 className="font-bold text-gray-800">{day.title}</h3>
                </div>
                <ul className="space-y-2 ml-11">
                  {day.activities?.map((activity, i) => (
                    <li key={i} className="text-gray-600 text-sm flex gap-2">
                      <span className="text-sky-400">•</span>
                      {activity}
                    </li>
                  ))}
                </ul>
              </div>
            ))}

            {plan.tips?.length > 0 && (
              <div className="bg-amber-50 border border-amber-100 rounded-2xl p-6">
                <h3 className="font-bold text-gray-800 mb-3">💡 Local Tips</h3>
                <ul className="space-y-2">
                  {plan.tips.map((tip, i) => (
                    <li key={i} className="text-gray-600 text-sm flex gap-2">
                      <span className="text-amber-400">•</span>
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="text-center pt-2">
              <Link
                to={`/flights?city=${encodeURIComponent(form.destination)}`}
                className="inline-block bg-sky-500 hover:bg-sky-400 text-white px-8 py-4 rounded-full font-bold text-lg transition-colors shadow-sm"
              >
                ✈️ Find flights to {form.destination} →
              </Link>
            </div>
          </div>
        )}
      </section>
    </Layout>
  )
}
