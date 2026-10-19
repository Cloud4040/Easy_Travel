import { useEffect, useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import Layout from '../components/Layout'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../supabaseClient'

const formatTime = (dt) => dt && new Date(dt).toLocaleString([], {
  weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
})

export default function Trips() {
  const { user } = useAuth()
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    supabase
      .from('bookings')
      .select('*')
      .order('departure', { ascending: true })
      .then(({ data, error }) => {
        if (error) console.error('Fetch bookings error:', error)
        if (data) setBookings(data)
        setLoading(false)
      })
  }, [user])

  if (!user) return <Navigate to="/login" replace />

  return (
    <Layout>
      <section className="max-w-3xl mx-auto px-6 py-12 w-full">
        <h2 className="text-3xl font-extrabold text-gray-800 mb-2">My Trips</h2>
        <p className="text-gray-400 mb-8">Every flight you've booked with Easy Travel.</p>

        {loading && <p className="text-gray-400">Loading your trips...</p>}

        {!loading && bookings.length === 0 && (
          <div className="text-center py-20 bg-sky-50 rounded-3xl">
            <p className="text-4xl mb-3">🧳</p>
            <p className="text-gray-400 font-medium mb-6">No trips yet — your next adventure awaits!</p>
            <Link to="/flights" className="inline-block bg-sky-500 hover:bg-sky-400 text-white px-6 py-3 rounded-full font-bold transition-colors">
              Search Flights
            </Link>
          </div>
        )}

        <div className="space-y-4">
          {bookings.map(b => (
            <div key={b.id} className="bg-white border border-sky-100 rounded-2xl p-5 hover:shadow-md transition-all">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="font-bold text-gray-800">{b.airline}</p>
                  <p className="text-gray-400 text-sm">{b.origin} → {b.destination}</p>
                </div>
                <div className="text-center">
                  <p className="font-bold text-gray-800">{formatTime(b.departure)}</p>
                  <p className="text-gray-400 text-xs">Departs</p>
                </div>
                <div className="text-right">
                  <p className="font-extrabold text-sky-500">{b.price} {b.currency}</p>
                  <p className="text-gray-400 text-xs">Ref: {b.order_reference || '—'}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </Layout>
  )
}
