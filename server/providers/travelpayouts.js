const axios = require('axios')

const API = 'https://api.travelpayouts.com/aviasales/v3/prices_for_dates'

// Travelpayouts returns airline IATA codes, so map the common ones to names.
// Unknown codes fall back to the raw code.
const AIRLINES = {
  A3: 'Aegean Airlines', AA: 'American Airlines', AC: 'Air Canada', AF: 'Air France',
  AI: 'Air India', AM: 'Aeromexico', AR: 'Aerolineas Argentinas', AS: 'Alaska Airlines',
  AT: 'Royal Air Maroc', AV: 'Avianca', AY: 'Finnair', AZ: 'ITA Airways', B6: 'JetBlue',
  BA: 'British Airways', CA: 'Air China', CM: 'Copa Airlines', CX: 'Cathay Pacific',
  CZ: 'China Southern', DL: 'Delta Air Lines', DP: 'Pobeda', DY: 'Norwegian',
  EI: 'Aer Lingus', EK: 'Emirates', ET: 'Ethiopian Airlines', EY: 'Etihad Airways',
  FR: 'Ryanair', G3: 'Gol', GA: 'Garuda Indonesia', HU: 'Hainan Airlines',
  IB: 'Iberia', JL: 'Japan Airlines', KE: 'Korean Air', KL: 'KLM', LA: 'LATAM',
  LH: 'Lufthansa', LX: 'SWISS', MH: 'Malaysia Airlines', MS: 'EgyptAir',
  MU: 'China Eastern', N4: 'Nordwind Airlines', NH: 'ANA', NZ: 'Air New Zealand',
  OS: 'Austrian Airlines', OZ: 'Asiana Airlines', QF: 'Qantas', QR: 'Qatar Airways',
  S7: 'S7 Airlines', SA: 'South African Airways', SK: 'SAS', SQ: 'Singapore Airlines',
  SU: 'Aeroflot', TG: 'Thai Airways', TK: 'Turkish Airlines', TP: 'TAP Air Portugal',
  U2: 'easyJet', U6: 'Ural Airlines', UA: 'United Airlines', UT: 'Utair',
  VN: 'Vietnam Airlines', W6: 'Wizz Air', WN: 'Southwest Airlines',
  '6E': 'IndiGo'
}

const CABIN_TO_TRIP_CLASS = { economy: 0, business: 1, first: 2 }

const toIsoDuration = (minutes) => {
  if (!minutes) return 'PT0M'
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return `PT${h ? `${h}H` : ''}${m ? `${m}M` : ''}`
}

const addMinutes = (isoDate, minutes) => new Date(new Date(isoDate).getTime() + minutes * 60000).toISOString()

/**
 * Normalize Travelpayouts items into the shape the client already renders.
 * Filters to the exact requested dates (the API query is month-wide to hit the cache).
 */
function normalize(items = [], { departureDate, returnDate, currency = 'USD', limit = 10 } = {}) {
  return items
    .filter(item => item.departure_at?.slice(0, 10) === departureDate)
    .filter(item => !returnDate || item.return_at?.slice(0, 10) === returnDate)
    .slice(0, limit)
    .map((item, i) => {
      const minutes = item.duration_to || item.duration || 0
      const airlineCode = item.airline || '—'
      return {
        id: `tp-${item.flight_number || i}-${item.departure_at}-${i}`,
        price: String(item.price),
        currency,
        stops: item.transfers ?? 0,
        duration: toIsoDuration(minutes),
        departure: item.departure_at,
        arrival: minutes ? addMinutes(item.departure_at, minutes) : null,
        airline: AIRLINES[airlineCode] || airlineCode,
        origin: item.origin_airport || item.origin,
        destination: item.destination_airport || item.destination,
        source: 'travelpayouts',
        bookingUrl: item.link ? `https://www.aviasales.com${item.link}` : null,
        passengerIds: []
      }
    })
}

/**
 * Fetch cached real prices from Aviasales' search history (last 48h).
 * Returns [] when there is no cached data for the route/date.
 */
async function search({ origin, destination, departureDate, returnDate, cabinClass = 'economy' }) {
  const token = process.env.TRAVELPAYOUTS_TOKEN
  if (!token) return []

  const params = {
    origin,
    destination,
    // Ask for the whole month, then filter to the exact date below.
    // This hits the cache far more often than querying a single day.
    departure_at: departureDate.slice(0, 7),
    one_way: returnDate ? 'false' : 'true',
    currency: 'usd',
    sorting: 'price',
    limit: 100,
    page: 1,
    show_to_affiliates: 'true',
    trip_class: CABIN_TO_TRIP_CLASS[cabinClass] ?? 0,
    market: 'us'
  }
  if (returnDate) params.return_at = returnDate.slice(0, 7)

  const response = await axios.get(API, {
    params,
    headers: { 'X-Access-Token': token },
    timeout: 20000
  })

  if (!response.data?.success) {
    throw new Error(response.data?.error || 'Travelpayouts request failed')
  }

  const currency = (response.data.currency || 'usd').toUpperCase()
  return normalize(response.data.data, { departureDate, returnDate, currency })
}

module.exports = { search, normalize }
