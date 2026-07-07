import { useState } from 'react'

export default function SearchForm({ onSearch, loading }) {
  const [form, setForm] = useState({
    origin: '',
    destination: '',
    departureDate: '',
    returnDate: '',
    adults: 1,
    cabinClass: 'economy'
  })

  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const submit = (e) => {
    e.preventDefault()
    onSearch(form)
  }

  return (
    <form onSubmit={submit} className="bg-white rounded-2xl shadow-lg border border-sky-100 p-6">
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1 block">From</label>
          <input
            name="origin"
            value={form.origin}
            onChange={handle}
            placeholder="e.g. LHR"
            required
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-800 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-sky-300 focus:border-transparent transition"
          />
        </div>
        <div>
          <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1 block">To</label>
          <input
            name="destination"
            value={form.destination}
            onChange={handle}
            placeholder="e.g. JFK"
            required
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-800 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-sky-300 focus:border-transparent transition"
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1 block">Departure</label>
          <input
            name="departureDate"
            type="date"
            value={form.departureDate}
            onChange={handle}
            required
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-sky-300 focus:border-transparent transition"
          />
        </div>
        <div>
          <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1 block">Return (optional)</label>
          <input
            name="returnDate"
            type="date"
            value={form.returnDate}
            onChange={handle}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-sky-300 focus:border-transparent transition"
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div>
          <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1 block">Passengers</label>
          <input
            name="adults"
            type="number"
            min="1"
            max="9"
            value={form.adults}
            onChange={handle}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-sky-300 focus:border-transparent transition"
          />
        </div>
        <div>
          <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1 block">Cabin Class</label>
          <select
            name="cabinClass"
            value={form.cabinClass}
            onChange={handle}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-sky-300 focus:border-transparent transition"
          >
            <option value="economy">Economy</option>
            <option value="premium_economy">Premium Economy</option>
            <option value="business">Business</option>
            <option value="first">First Class</option>
          </select>
        </div>
      </div>
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-sky-500 hover:bg-sky-400 disabled:bg-sky-200 text-white rounded-xl py-3 font-bold text-base transition-colors shadow-sm"
      >
        {loading ? '✈️ Searching...' : 'Search Flights'}
      </button>
    </form>
  )
}