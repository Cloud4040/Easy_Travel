const express = require('express')
const router = express.Router()
const axios = require('axios')

const DUFFEL_BASE = 'https://api.duffel.com'

const duffelHeaders = {
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
  // Needed later to create an order for this offer
  passengerIds: (offer.passengers || []).map(p => p.id)
})

router.post('/search', async (req, res) => {
  const {
    origin,
    destination,
    departureDate,
    returnDate,
    adults = 1,
    cabinClass = 'economy'
  } = req.body

  try {
    const response = await axios.post(
      `${DUFFEL_BASE}/air/offer_requests`,
      {
        data: {
          slices: [
            {
              origin,
              destination,
              departure_date: departureDate
            },
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
      { headers: duffelHeaders }
    )

    const offers = response.data.data.offers || []
    res.json({ success: true, offers: offers.slice(0, 10).map(simplifyOffer) })

  } catch (error) {
    console.error('Duffel error:', error.response?.data || error.message)
    res.status(500).json({ success: false, error: error.response?.data || error.message })
  }
})

// Create an order for a previously returned offer (test-mode payments)
router.post('/orders', async (req, res) => {
  const { offerId, passengerIds = [], passengers = [] } = req.body

  if (!offerId) {
    return res.status(400).json({ success: false, error: 'offerId is required' })
  }

  try {
    const response = await axios.post(
      `${DUFFEL_BASE}/air/orders`,
      {
        data: {
          offer_id: offerId,
          passengers: passengerIds.map((id, i) => ({
            id,
            ...(passengers[i] || {})
          })),
          payments: [{ type: 'test' }]
        }
      },
      { headers: duffelHeaders }
    )

    const order = response.data.data
    res.json({
      success: true,
      order: {
        id: order.id,
        reference: order.reference,
        status: order.status,
        total: order.total_amount,
        currency: order.total_currency
      }
    })
  } catch (error) {
    console.error('Duffel order error:', error.response?.data || error.message)
    res.status(500).json({ success: false, error: error.response?.data?.errors || error.message })
  }
})

module.exports = router
module.exports.duffelHeaders = duffelHeaders
