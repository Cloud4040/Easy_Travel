import { useEffect, useRef, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../supabaseClient'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import { Link } from 'react-router-dom'

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN

export default function Map() {
  const { user } = useAuth()
  console.log('Map page user:', user)
  const mapContainer = useRef(null)
  const map = useRef(null)
  const [visited, setVisited] = useState([])
  const [loading, setLoading] = useState(true)

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
    console.log('Adding country with user:', user.id)
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
    if (data) setVisited(prev => [...prev, ...data])
  }

  const removeCountry = async (id) => {
    const { error } = await supabase.from('visited').delete().eq('id', id)
    if (error) console.error('Delete error:', error)
    setVisited(prev => prev.filter(v => v.id !== id))
  }

  const countries = [
    { code: 'US', name: 'United States' }, { code: 'GB', name: 'United Kingdom' },
    { code: 'FR', name: 'France' }, { code: 'DE', name: 'Germany' },
    { code: 'IT', name: 'Italy' }, { code: 'ES', name: 'Spain' },
    { code: 'JP', name: 'Japan' }, { code: 'AU', name: 'Australia' },
    { code: 'CA', name: 'Canada' }, { code: 'MX', name: 'Mexico' },
    { code: 'BR', name: 'Brazil' }, { code: 'IN', name: 'India' },
    { code: 'CN', name: 'China' }, { code: 'ZA', name: 'South Africa' },
    { code: 'NG', name: 'Nigeria' }, { code: 'EG', name: 'Egypt' },
    { code: 'TH', name: 'Thailand' }, { code: 'VN', name: 'Vietnam' },
    { code: 'GR', name: 'Greece' }, { code: 'PT', name: 'Portugal' },
    { code: 'NL', name: 'Netherlands' }, { code: 'SE', name: 'Sweden' },
    { code: 'NO', name: 'Norway' }, { code: 'NZ', name: 'New Zealand' },
    { code: 'AR', name: 'Argentina' }, { code: 'CL', name: 'Chile' },
    { code: 'CO', name: 'Colombia' }, { code: 'PE', name: 'Peru' },
    { code: 'TR', name: 'Turkey' }, { code: 'MA', name: 'Morocco' },
    { code: 'KE', name: 'Kenya' }, { code: 'TZ', name: 'Tanzania' },
    { code: 'ID', name: 'Indonesia' }, { code: 'PH', name: 'Philippines' },
    { code: 'SG', name: 'Singapore' }, { code: 'MY', name: 'Malaysia' },
    { code: 'AE', name: 'UAE' }, { code: 'SA', name: 'Saudi Arabia' },
    { code: 'IL', name: 'Israel' }, { code: 'JO', name: 'Jordan' },
    { code: 'IS', name: 'Iceland' }, { code: 'IE', name: 'Ireland' },
    { code: 'PL', name: 'Poland' }, { code: 'CZ', name: 'Czech Republic' },
    { code: 'HU', name: 'Hungary' }, { code: 'AT', name: 'Austria' },
    { code: 'CH', name: 'Switzerland' }, { code: 'BE', name: 'Belgium' },
    { code: 'DK', name: 'Denmark' }, { code: 'FI', name: 'Finland' },
  ]

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
              <p className="text-gray-500 text-sm">No countries added yet. Add some below!</p>
            )}
            {visited.map(v => (
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
            <div className="max-h-48 overflow-y-auto space-y-1">
              {countries
                .filter(c => !visited.find(v => v.country_code === c.code))
                .map(c => (
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