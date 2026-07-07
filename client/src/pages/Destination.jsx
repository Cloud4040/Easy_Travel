import { useParams, Link } from 'react-router-dom'
import destinations from '../data/destinations'

export default function Destination() {
  const { id } = useParams()
  const dest = destinations.find(d => d.id === id)

  if (!dest) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white text-gray-800">
        <p className="text-xl font-bold mb-4">Destination not found</p>
        <Link to="/" className="text-sky-500 hover:underline">← Back home</Link>
      </div>
    )
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

      <section className="bg-gradient-to-br from-sky-50 to-white px-6 py-16 text-center">
        <span className="text-6xl block mb-4">{dest.emoji}</span>
        <span className="text-xs font-semibold text-sky-500 bg-sky-100 px-3 py-1 rounded-full">{dest.tag}</span>
        <h2 className="text-4xl font-extrabold text-gray-800 mt-4">{dest.city}</h2>
        <p className="text-gray-400 text-lg">{dest.country}</p>
      </section>

      <section className="max-w-3xl mx-auto px-6 py-12">
        <p className="text-gray-600 text-lg leading-relaxed mb-10">{dest.description}</p>

        <h3 className="text-xl font-bold text-gray-800 mb-4">Top Highlights</h3>
        <ul className="grid grid-cols-2 gap-3 mb-10">
          {dest.highlights.map(h => (
            <li key={h} className="bg-sky-50 border border-sky-100 rounded-xl px-4 py-3 text-gray-700 text-sm">
              {h}
            </li>
          ))}
        </ul>

        <h3 className="text-xl font-bold text-gray-800 mb-2">Best Time to Visit</h3>
        <p className="text-gray-600 mb-10">{dest.bestTime}</p>

        <Link
          to="/flights"
          className="inline-block bg-sky-500 hover:bg-sky-400 text-white px-8 py-4 rounded-full font-bold text-lg transition-colors shadow-sm"
        >
          Search Flights to {dest.city} →
        </Link>
      </section>
    </div>
  )
}