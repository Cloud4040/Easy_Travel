import { useEffect, useRef, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../supabaseClient'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import { Link } from 'react-router-dom'
import worldCountries from 'world-countries'

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN

// Build { code, name } list from world-countries, sorted alphabetically
const ALL_COUNTRIES = worldCountries
  .map(c => ({ code: c.cca2, name: c.name.common }))
  .sort((a, b) => a.name.localeCompare(b.name))

export default function Map() {
  const { user } = useAuth()
  const mapContainer = useRef(null)
  const map = useRef(null)
  const [visited, setVisited] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    if (map.current) return
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/dark-v11',
      zoom: 1.5,
      center: [0, 20]
    })

    map.current.on('load', () => {
      map.current.addSource('countries', {
        type: 'vector',
        url: 'mapbox://mapbox.country-boundaries-v1'
      })

      map.current.addLayer({
        id: 'visited-countries',
        type: 'fill',
        source: 'countries',
        'source-layer': 'country_boundaries',
        paint: {
          'fill-color': '#3b82f6',
          'fill-opacity': 0.5
        },
        filter: ['in', 'iso_3166_1', '']
      })

      map.current.addLayer({
        id: 'visited-countries-border',
        type: 'line',
        source: 'countries',
        'source-layer': 'country_boundaries',
        paint: {
          'line-color': '#60a5fa',
          'line-width': 1
        },
        filter: ['in', 'iso_3166_1', '']
      })

      if (user) fetchVisited()
    })
  }, [])

  useEffect(() => {
    if (!user) return
    if (map.current && map.current.isStyleLoaded()) {
      fetchVisited()
    }
  }, [user])

  const fetchVisited = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('visited')
      .select('*')
      .eq('user_id', user.id)
    if (error) console.error('Fetch error:', error)
    if (data) {
      setVisited(data)
      updateMapHighlights(data)
    }
    setLoading(false)
  }

  const updateMapHighlights = (places) => {
    if (!map.current || !map.current.isStyleLoaded()) return
    const codes = places.map(p => p.country_code)
    map.current.setFilter('visited-countries', ['in', 'iso_3166_1', ...codes])
    map.current.setFilter('visited-countries-border', ['in', 'iso_3166_1', ...codes])
  }

  useEffect(() => {
    if (!map.current) return
    if (map.current.isStyleLoaded()) {
      updateMapHighlights(visited)
    }
  }, [visited])

  const addCountry = async (code, name) => {
    if (!user) {
      console.error('No user in context')
      return
    }
    const already = visited.find(v => v.country_code === code)
    if (already) return

    const { data, error } = await supabase
      .from('visited')
      .insert({
        user_id: user.id,
        country_code: code,
        country_name: name
      })
      .select()

    if (error) {
      console.error('Insert error:', error)
      return
    }
    if (data) {
      setVisited(prev => [...prev, ...data])
      setSearch('')
    }
  }

  const removeCountry = async (id) => {
    const { error } = await supabase.from('visited').delete().eq('id', id)
    if (error) console.error('Delete error:', error)
    setVisited(prev => prev.filter(v => v.id !== id))
  }

  const filteredCountries = ALL_COUNTRIES.filter(c =>
    !visited.find(v => v.country_code === c.code) &&
    c.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <header className="bg-gray-900 border-b border-gray-800 px-6 py-4 flex items-center justify-between">
        <Link to="/" className="text-2xl font-bold text-blue-400">Easy Travel ✈</Link>
        <span className="text-gray-400 text-sm">{user?.email}</span>
      </header>
      <div className="flex h-[calc(100vh-64px)]">
        <div className="w-80 bg-gray-900 border-r border-gray-800 flex flex-col">
          <div className="p-4 border-b border-gray-800">
            <h2 className="font-bold text-lg">My Visited Countries</h2>
            <p className="text-gray-400 text-sm mt-1">{visited.length} countries visited</p>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {visited.length === 0 && (
              <p className="text-gray-500 text-sm">No countries added yet. Search below!</p>
            )}
            {visited
              .slice()
              .sort((a, b) => a.country_name.localeCompare(b.country_name))
              .map(v => (
                <div key={v.id} className="flex items-center justify-between bg-gray-800 rounded-lg px-3 py-2">
                  <span className="text-sm">{v.country_name}</span>
                  <button
                    onClick={() => removeCountry(v.id)}
                    className="text-red-400 hover:text-red-300 text-xs"
                  >
                    Remove
                  </button>
                </div>
              ))}
          </div>

          <div className="p-4 border-t border-gray-800">
            <p className="text-sm text-gray-400 mb-2">Add a country:</p>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search countries..."
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm mb-2 focus:outline-none focus:border-blue-400"
            />
            <div className="max-h-48 overflow-y-auto space-y-1">
              {filteredCountries.length === 0 && (
                <p className="text-gray-600 text-xs px-3 py-1.5">No matches</p>
              )}
              {filteredCountries.map(c => (
                <button
                  key={c.code}
                  onClick={() => addCountry(c.code, c.name)}
                  className="w-full text-left text-sm px-3 py-1.5 rounded-lg hover:bg-gray-700 transition-colors"
                >
                  {c.name}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="flex-1" ref={mapContainer} />
      </div>
    </div>
  )
}