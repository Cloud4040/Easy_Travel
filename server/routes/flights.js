const express = require('express')
const router = express.Router()
const duffel = require('../providers/duffel')
const travelpayouts = require('../providers/travelpayouts')

router.post('/search', async (req, res) => {
  const { origin, destination, departureDate, adults = 1, cabinClass = 'economy' } = req.body

  if (!origin || !destination || !departureDate) {
    return res.status(400).json({
      success: false,
      error: 'origin, destination and departureDate are required'
    })
  }

  const trip = { ...req.body, adults, cabinClass }

  // 1. Try Travelpayouts' cached real prices first (free)
  let travelpayoutsError = null
  if (process.env.TRAVELPAYOUTS_TOKEN) {
    try {
      const offers = await travelpayouts.search(trip)
      if (offers.length > 0) {
        console.log(`Travelpayouts: ${offers.length} cached offers for ${origin}-${destination}`)
        return res.json({ success: true, offers, source: 'travelpayouts' })
      }
      console.log(`Travelpayouts: no cached offers for ${origin}-${destination} on ${departureDate}, falling back to Duffel`)
    } catch (error) {
      travelpayoutsError = error.message
      console.warn(`Travelpayouts failed (${error.message}), falling back to Duffel`)
    }
  }

  // 2. Fall back to Duffel (always has inventory, test mode by default)
  try {
    const offers = await duffel.search(trip)
    return res.json({
      success: true,
      offers,
      source: 'duffel',
      // Let the client know why cached results were skipped
      fallbackReason: travelpayoutsError ? 'travelpayouts-error' : 'no-cached-results'
    })
  } catch (error) {
    console.error('Duffel error:', error.response?.data || error.message)
    return res.status(500).json({
      success: false,
      error: error.response?.data || error.message
    })
  }
})

// Book a Duffel offer (Travelpayouts offers are not bookable — they deep-link to Aviasales)
router.post('/orders', async (req, res) => {
  const { offerId, passengerIds = [], passengers = [] } = req.body

  if (!offerId) {
    return res.status(400).json({ success: false, error: 'offerId is required' })
  }

  try {
    const order = await duffel.createOrder({ offerId, passengerIds, passengers })
    res.json({ success: true, order })
  } catch (error) {
    console.error('Duffel order error:', error.response?.data || error.message)
    res.status(500).json({ success: false, error: error.response?.data?.errors || error.message })
  }
})

module.exports = router
