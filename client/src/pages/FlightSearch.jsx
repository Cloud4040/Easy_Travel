import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import Layout from '../components/Layout'
import SearchForm from '../components/SearchForm'
import FlightResults from '../components/FlightResults'

export default function FlightSearch() {
  const [flights, setFlights] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [searched, setSearched] = useState(false)
  const [source, setSource] = useState(null)
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  // Pre-fill from URL, e.g. /flights?destination=HND&city=Tokyo
  const initial = {}
  if (searchParams.get('destination')) initial.destination = searchParams.get('destination')
  if (searchParams.get('origin')) initial.origin = searchParams.get('origin')

  const searchFlights = async (formData) => {
    setLoading(true)
    setError(null)
    setSearched(true)
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/flights/search`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
      const data = await response.json()
      if (data.success) {
        setFlights(data.offers)
        setSource(data.source)
      } else {
        setError('No flights found. Try different dates or airports.')
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
        <h2 className="text-3xl font-extrabold text-gray-800 mb-2">Search Flights</h2>
        {searchParams.get('city') && (
          <p className="text-sky-500 font-medium mb-6">✈️ Planning a trip to {searchParams.get('city')}</p>
        )}
        <div className="max-w-3xl mx-auto">
          <SearchForm onSearch={searchFlights} loading={loading} initial={initial} />
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-6 py-10 w-full">
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
        {!loading && !error && searched && (
          <FlightResults
            flights={flights}
            source={source}
            onSelect={(flight) => navigate('/book', { state: { flight } })}
          />
        )}
      </section>
    </Layout>
  )
}
