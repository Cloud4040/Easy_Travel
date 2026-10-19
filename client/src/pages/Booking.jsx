import { useState } from 'react'
import { Link, Navigate, useLocation } from 'react-router-dom'
import Layout from '../components/Layout'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../supabaseClient'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

const formatTime = (dt) => new Date(dt).toLocaleString([], {
  weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
})

export default function Booking() {
  const location = useLocation()
  const { user } = useAuth()
  const flight = location.state?.flight

  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: user?.email || '',
    phone: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [confirmed, setConfirmed] = useState(null)

  if (!flight) return <Navigate to="/flights" replace />

  // Travelpayouts offers are cached prices from Aviasales — not bookable here.
  if (flight.source === 'travelpayouts') {
    return (
      <Layout>
        <section className="max-w-lg mx-auto px-6 py-16 w-full">
          <h2 className="text-3xl font-extrabold text-gray-800 mb-8">Your flight</h2>
          <div className="bg-white rounded-2xl shadow-lg border border-sky-100 p-6">
            <p className="font-bold text-gray-800 mb-4">{flight.airline}</p>
            <div className="flex justify-between items-center mb-6">
              <div>
                <p className="text-xl font-bold text-gray-800">{formatTime(flight.departure)}</p>
                <p className="text-gray-400 text-sm">{flight.origin}</p>
              </div>
              <div className="text-gray-300 text-sm">
                {flight.stops === 0 ? 'Direct' : `${flight.stops} stop${flight.stops > 1 ? 's' : ''}`}
              </div>
              <div className="text-right">
                <p className="text-xl font-bold text-gray-800">{formatTime(flight.arrival)}</p>
                <p className="text-gray-400 text-sm">{flight.destination}</p>
              </div>
            </div>
            <div className="border-t border-sky-100 pt-4 flex items-baseline justify-between mb-6">
              <span className="text-gray-400 text-sm">Cached price</span>
              <span className="text-3xl font-extrabold text-sky-500">{flight.price} {flight.currency}</span>
            </div>
            {flight.bookingUrl ? (
              <a
                href={flight.bookingUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="block text-center bg-sky-500 hover:bg-sky-400 text-white rounded-xl py-3 font-bold transition-colors shadow-sm"
              >
                View this deal on Aviasales ↗
              </a>
            ) : (
              <Link to="/flights" className="block text-center bg-sky-500 hover:bg-sky-400 text-white rounded-xl py-3 font-bold transition-colors">
                Back to search
              </Link>
            )}
            <p className="text-xs text-gray-400 text-center mt-4">
              This price was cached from an Aviasales search in the last 48 hours. Availability and the final price are confirmed on Aviasales.
            </p>
          </div>
        </section>
      </Layout>
    )
  }


  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const submit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const response = await fetch(`${API_URL}/api/flights/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          offerId: flight.id,
          passengerIds: flight.passengerIds,
          passengers: flight.passengerIds.map(() => ({
            given_name: form.firstName,
            family_name: form.lastName,
            email: form.email,
            phone: form.phone
          }))
        })
      })
      const data = await response.json()
      if (!data.success) {
        throw new Error(typeof data.error === 'string' ? data.error : 'Booking failed')
      }

      // Persist the booking for the logged-in user (best effort)
      if (user) {
        const { error: dbError } = await supabase.from('bookings').insert({
          user_id: user.id,
          order_id: data.order.id,
          order_reference: data.order.reference,
          offer_id: flight.id,
          airline: flight.airline,
          origin: flight.origin,
          destination: flight.destination,
          departure: flight.departure,
          arrival: flight.arrival,
          price: Number(flight.price),
          currency: flight.currency
        })
        if (dbError) console.error('Could not save booking:', dbError)
      }

      setConfirmed(data.order)
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (confirmed) {
    return (
      <Layout>
        <section className="max-w-lg mx-auto px-6 py-20 text-center">
          <div className="bg-white rounded-3xl shadow-lg border border-sky-100 p-10">
            <span className="text-5xl block mb-4">🎉</span>
            <h2 className="text-2xl font-extrabold text-gray-800 mb-2">You're booked!</h2>
            <p className="text-gray-400 mb-6">Your flight is confirmed. A confirmation email is on its way.</p>
            <div className="bg-sky-50 border border-sky-100 rounded-2xl p-5 mb-6 text-left">
              <div className="flex justify-between mb-2">
                <span className="text-gray-400 text-sm">Booking reference</span>
                <span className="font-bold text-gray-800">{confirmed.reference}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-gray-400 text-sm">Route</span>
                <span className="font-medium text-gray-700">{flight.origin} → {flight.destination}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400 text-sm">Total paid</span>
                <span className="font-medium text-gray-700">{confirmed.total} {confirmed.currency}</span>
              </div>
            </div>
            <div className="flex gap-3 justify-center">
              {user && (
                <Link to="/trips" className="bg-sky-500 hover:bg-sky-400 text-white px-6 py-3 rounded-full font-bold transition-colors">
                  View My Trips
                </Link>
              )}
              <Link to="/" className="border border-sky-200 hover:bg-sky-50 text-sky-500 px-6 py-3 rounded-full font-bold transition-colors">
                Back Home
              </Link>
            </div>
          </div>
        </section>
      </Layout>
    )
  }

  return (
    <Layout>
      <section className="max-w-3xl mx-auto px-6 py-12 w-full">
        <h2 className="text-3xl font-extrabold text-gray-800 mb-8">Complete your booking</h2>

        <div className="grid md:grid-cols-5 gap-6">
          {/* Flight summary */}
          <div className="md:col-span-2">
            <div className="bg-sky-50 border border-sky-100 rounded-2xl p-5 sticky top-24">
              <p className="font-bold text-gray-800 mb-4">{flight.airline}</p>
              <p className="text-lg font-bold text-gray-800">{formatTime(flight.departure)}</p>
              <p className="text-gray-400 text-sm mb-3">{flight.origin}</p>
              <p className="text-lg font-bold text-gray-800">{formatTime(flight.arrival)}</p>
              <p className="text-gray-400 text-sm mb-4">{flight.destination}</p>
              <div className="border-t border-sky-200 pt-4 flex justify-between items-baseline">
                <span className="text-gray-400 text-sm">Total</span>
                <span className="text-2xl font-extrabold text-sky-500">
                  {flight.price} {flight.currency}
                </span>
              </div>
            </div>
          </div>

          {/* Passenger form */}
          <div className="md:col-span-3">
            <form onSubmit={submit} className="bg-white rounded-2xl shadow-lg border border-sky-100 p-6 space-y-4">
              <h3 className="font-bold text-gray-800">Passenger details</h3>
              {error && (
                <div className="bg-red-50 border border-red-100 text-red-500 text-sm rounded-xl px-4 py-3">
                  {error}
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1 block">First Name</label>
                  <input
                    name="firstName"
                    value={form.firstName}
                    onChange={handle}
                    required
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-sky-300 transition"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1 block">Last Name</label>
                  <input
                    name="lastName"
                    value={form.lastName}
                    onChange={handle}
                    required
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-sky-300 transition"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1 block">Email</label>
                <input
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handle}
                  required
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-sky-300 transition"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1 block">Phone</label>
                <input
                  name="phone"
                  type="tel"
                  value={form.phone}
                  onChange={handle}
                  required
                  placeholder="+1 555 000 0000"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-800 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-sky-300 transition"
                />
              </div>
              {!user && (
                <p className="text-xs text-gray-400">
                  <Link to="/login" className="text-sky-500 hover:underline">Sign in</Link> to save this trip to your account.
                </p>
              )}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-sky-500 hover:bg-sky-400 disabled:bg-sky-200 text-white rounded-xl py-3 font-bold transition-colors shadow-sm"
              >
                {loading ? '✈️ Booking...' : `Confirm Booking · ${flight.price} ${flight.currency}`}
              </button>
              <p className="text-xs text-gray-300 text-center">Test mode — no real payment is taken.</p>
            </form>
          </div>
        </div>
      </section>
    </Layout>
  )
}
