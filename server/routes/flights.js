const express = require('express')
const router = express.Router()
const axios = require('axios')

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
      'https://api.duffel.com/air/offer_requests',
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
          passengers: Array(adults).fill({ type: 'adult' }),
          cabin_class: cabinClass
        }
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.DUFFEL_TOKEN}`,
          'Duffel-Version': 'v2',
          'Content-Type': 'application/json'
        }
      }
    )

    const offers = response.data.data.offers || []

    const simplified = offers.slice(0, 10).map(offer => ({
      id: offer.id,
      price: offer.total_amount,
      currency: offer.total_currency,
      stops: offer.slices[0].segments.length - 1,
      duration: offer.slices[0].duration,
      departure: offer.slices[0].segments[0].departing_at,
      arrival: offer.slices[0].segments[offer.slices[0].segments.length - 1].arriving_at,
      airline: offer.slices[0].segments[0].marketing_carrier.name,
      origin: offer.slices[0].origin.iata_code,
      destination: offer.slices[0].destination.iata_code
    }))

    res.json({ success: true, offers: simplified })

  } catch (error) {
    console.error('Duffel error:', error.response?.data || error.message)
    res.status(500).json({ success: false, error: error.response?.data || error.message })
  }
})

module.exports = router