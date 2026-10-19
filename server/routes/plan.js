const express = require('express')
const router = express.Router()
const axios = require('axios')

// Guard against prompt injection in the free-text interests field
const cleanText = (text) => String(text).slice(0, 300).replace(/[{}<>]/g, '')

// Plan a trip with Gemini: budget, dates, and interests in → day-by-day itinerary out
router.post('/plan', async (req, res) => {
  const { destination, days, budget, interests = '', origin = '' } = req.body

  if (!destination || !days) {
    return res.status(400).json({ success: false, error: 'destination and days are required' })
  }

  if (!process.env.GEMINI_API_KEY) {
    return res.status(500).json({ success: false, error: 'GEMINI_API_KEY is not configured on the server' })
  }

  const prompt = `You are a travel planner. Create a ${Number(days)}-day itinerary for ${cleanText(destination)}${origin ? ` (flights from ${cleanText(origin)})` : ''}.
Budget: ${budget || 'moderate'}. Interests: ${cleanText(interests)}.

Respond ONLY with valid JSON in this exact shape:
{
  "summary": "one sentence overview of the trip",
  "estimatedCost": "rough total cost estimate per person",
  "days": [
    { "day": 1, "title": "short theme for the day", "activities": ["morning activity", "afternoon activity", "evening activity"] }
  ],
  "tips": ["2-3 practical travel tips"]
}`;

  try {
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          responseMimeType: 'application/json',
          temperature: 0.7
        }
      },
      { headers: { 'Content-Type': 'application/json' } }
    )

    const text = response.data.candidates[0].content.parts[0].text
    const plan = JSON.parse(text)
    res.json({ success: true, plan })
  } catch (error) {
    console.error('Gemini error:', error.response?.data || error.message)
    res.status(500).json({ success: false, error: 'Could not generate a trip plan. Please try again.' })
  }
})

module.exports = router
