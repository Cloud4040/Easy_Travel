export default function FlightResults({ flights }) {
  if (flights.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-4xl mb-3">🔍</p>
        <p className="text-gray-400 font-medium">No flights found for this route.</p>
      </div>
    )
  }

  const formatDuration = (iso) => {
    const match = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?/)
    const h = match[1] || '0'
    const m = match[2] || '0'
    return `${h}h ${m}m`
  }

  const formatTime = (dt) => new Date(dt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

  return (
    <div className="space-y-4">
      <p className="text-gray-400 text-sm font-medium">{flights.length} flights found</p>
      {flights.map(flight => (
        <div key={flight.id} className="bg-white border border-sky-100 rounded-2xl p-5 flex items-center justify-between hover:shadow-md hover:border-sky-300 transition-all cursor-pointer">
          <div className="space-y-1 w-32">
            <p className="font-bold text-gray-800">{flight.airline}</p>
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${flight.stops === 0 ? 'bg-green-100 text-green-600' : 'bg-amber-100 text-amber-600'}`}>
              {flight.stops === 0 ? 'Direct' : `${flight.stops} stop${flight.stops > 1 ? 's' : ''}`}
            </span>
          </div>
          <div className="text-center">
            <p className="text-xl font-bold text-gray-800">{formatTime(flight.departure)}</p>
            <p className="text-gray-400 text-xs font-medium">{flight.origin}</p>
          </div>
          <div className="flex flex-col items-center text-gray-300">
            <span className="text-xs text-gray-400 mb-1">{formatDuration(flight.duration)}</span>
            <div className="flex items-center gap-1">
              <div className="w-16 h-px bg-gray-200"></div>
              <span>✈️</span>
              <div className="w-16 h-px bg-gray-200"></div>
            </div>
          </div>
          <div className="text-center">
            <p className="text-xl font-bold text-gray-800">{formatTime(flight.arrival)}</p>
            <p className="text-gray-400 text-xs font-medium">{flight.destination}</p>
          </div>
          <div className="text-right w-28">
            <p className="text-2xl font-extrabold text-sky-500">${flight.price}</p>
            <p className="text-gray-400 text-xs">per person</p>
          </div>
        </div>
      ))}
    </div>
  )
}