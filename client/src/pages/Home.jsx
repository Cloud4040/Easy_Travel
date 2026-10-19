import { Link } from 'react-router-dom'
import Layout from '../components/Layout'
import destinations from '../data/destinations'

export default function Home() {
  return (
    <Layout>
      {/* Hero */}
      <section className="bg-gradient-to-br from-sky-50 to-white px-6 py-16 text-center">
        <p className="text-sky-500 font-semibold text-sm uppercase tracking-widest mb-3">Your next adventure starts here</p>
        <h2 className="text-5xl font-extrabold text-gray-800 mb-4 leading-tight">
          Where do you want<br />to go next?
        </h2>
        <p className="text-gray-400 text-lg mb-10 max-w-lg mx-auto">Search flights, discover destinations, and plan your perfect trip — all in one place.</p>
        <div className="flex items-center justify-center gap-4">
          <Link
            to="/flights"
            className="inline-block bg-sky-500 hover:bg-sky-400 text-white px-8 py-4 rounded-full font-bold text-lg transition-colors shadow-sm"
          >
            Search Flights →
          </Link>
          <Link
            to="/plan"
            className="inline-block bg-white hover:bg-sky-50 text-sky-500 border border-sky-200 px-8 py-4 rounded-full font-bold text-lg transition-colors shadow-sm"
          >
            🤖 AI Trip Planner
          </Link>
        </div>
      </section>

      {/* Trending Destinations Slideshow */}
      <section className="px-6 py-12 max-w-6xl mx-auto w-full">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold text-gray-800">Trending Destinations</h3>
        </div>
        <div className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory">
          {destinations.map((dest) => (
            <Link
              key={dest.id}
              to={`/destination/${dest.id}`}
              className="group relative bg-gradient-to-br from-sky-100 to-sky-50 rounded-2xl p-6 hover:shadow-md transition-all cursor-pointer border border-sky-100 hover:border-sky-200 flex-shrink-0 w-64 snap-start"
            >
              <span className="text-4xl mb-3 block">{dest.emoji}</span>
              <span className="text-xs font-semibold text-sky-500 bg-sky-100 px-2 py-0.5 rounded-full">{dest.tag}</span>
              <h4 className="text-lg font-bold text-gray-800 mt-2">{dest.city}</h4>
              <p className="text-gray-400 text-sm">{dest.country}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Why Easy Travel section */}
      <section className="bg-sky-50 py-14 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h3 className="text-2xl font-bold text-gray-800 mb-10">Why Easy Travel?</h3>
          <div className="grid grid-cols-3 gap-8">
            {[
              { icon: '🔍', title: 'Smart Search', desc: 'Find the best flights across hundreds of airlines instantly' },
              { icon: '🤖', title: 'AI Planning', desc: 'Tell us your budget and we\'ll plan the perfect trip for you' },
              { icon: '🗺️', title: 'Track Travels', desc: 'Keep a beautiful map of every country you\'ve visited' },
            ].map(f => (
              <div key={f.title} className="bg-white rounded-2xl p-6 shadow-sm border border-sky-100">
                <span className="text-3xl mb-3 block">{f.icon}</span>
                <h4 className="font-bold text-gray-800 mb-1">{f.title}</h4>
                <p className="text-gray-400 text-sm">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </Layout>
  )
}
