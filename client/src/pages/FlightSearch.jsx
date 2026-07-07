import { useState } from 'react'
import { Link } from 'react-router-dom'
import SearchForm from '../components/SearchForm'
import FlightResults from '../components/FlightResults'

export default function FlightSearch() {
  const [flights, setFlights] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [searched, setSearched] = useState(false)

  const searchFlights = async (formData) => {
    setLoading(true)
    setError(null)
    setSearched(true)
    try {
      const response = await fetch('http://localhost:3001/api/flights/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
      const data = await response.json()
      if (data.success) {
        setFlights(data.offers)
      } else {
        setError('No flights found. Try different dates or airports.')
      }
    } catch (err) {
      setError('Could not connect to server.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white text-gray-800 font-sans">
      <header className="bg-white border-b border-sky-100 px-6 py-4 flex items-center justify-between sticky top-0 z-50 shadow-sm">
        <Link to="/" className="flex items-center gap-2">
          <span className="text-2xl">✈️</span>
          <h1 className="text-2xl font-extrabold text-sky-500 tracking-tight">Easy Travel</h1>
        </Link>
        <Link to="/" className="text-gray-500 hover:text-sky-500 font-medium text-sm transition-colors">← Back Home</Link>
      </header>

      <section className="bg-gradient-to-br from-sky-50 to-white px-6 py-12 text-center">
        <h2 className="text-3xl font-extrabold text-gray-800 mb-8">Search Flights</h2>
        <div className="max-w-3xl mx-auto">
          <SearchForm onSearch={searchFlights} loading={loading} />
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-6 py-10">
        {error && (
          <div className="bg-red-50 border border-red-100 text-red-500 rounded-xl px-4 py-3 mb-6">
            {error}
          </div>
        )}
        {loading && (
          <div className="text-center py-20">
            <div className="text-4xl mb-4">✈️</div>
            <p className="text-gray-400 font-medium">Searching flights...</p>
          </div>
        )}
        {!loading && !error && searched && <FlightResults flights={flights} />}
      </section>
    </div>
  )
}