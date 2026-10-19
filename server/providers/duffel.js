const axios = require('axios')

const DUFFEL_BASE = 'https://api.duffel.com'

const headers = {
  Authorization: `Bearer ${process.env.DUFFEL_TOKEN}`,
  'Duffel-Version': 'v2',
  'Content-Type': 'application/json'
}

const simplifyOffer = (offer) => ({
  id: offer.id,
  price: offer.total_amount,
  currency: offer.total_currency,
  stops: offer.slices[0].segments.length - 1,
  duration: offer.slices[0].duration,
  departure: offer.slices[0].segments[0].departing_at,
  arrival: offer.slices[0].segments[offer.slices[0].segments.length - 1].arriving_at,
  airline: offer.slices[0].segments[0].marketing_carrier.name,
  origin: offer.slices[0].origin.iata_code,
  destination: offer.slices[0].destination.iata_code,
  source: 'duffel',
  passengerIds: (offer.passengers || []).map(p => p.id)
})

async function search({ origin, destination, departureDate, returnDate, adults = 1, cabinClass = 'economy' }) {
  const response = await axios.post(
    `${DUFFEL_BASE}/air/offer_requests`,
    {
      data: {
        slices: [
          { origin, destination, departure_date: departureDate },
          ...(returnDate ? [{
            origin: destination,
            destination: origin,
            departure_date: returnDate
          }] : [])
        ],
        passengers: Array(Number(adults)).fill({ type: 'adult' }),
        cabin_class: cabinClass
      }
    },
    { headers }
  )

  const offers = response.data.data.offers || []
  return offers.slice(0, 10).map(simplifyOffer)
}

async function createOrder({ offerId, passengerIds = [], passengers = [] }) {
  const response = await axios.post(
    `${DUFFEL_BASE}/air/orders`,
    {
      data: {
        offer_id: offerId,
        passengers: passengerIds.map((id, i) => ({
          id,
          ...(passengers[i] || {})
        })),
        // Test-mode payment; replace with a real payment flow before going live
        payments: [{ type: 'test' }]
      }
    },
    { headers }
  )

  const order = response.data.data
  return {
    id: order.id,
    reference: order.reference,
    status: order.status,
    total: order.total_amount,
    currency: order.total_currency
  }
}

module.exports = { search, createOrder }
