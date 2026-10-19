const express = require('express')
const router = express.Router()
const axios = require('axios')

// Guard against prompt injection in the free-text interests field
const cleanText = (text) => String(text).slice(0, 300).replace(/[{}<>]/g, '')

// Gemini occasionally returns transient 503s ("high demand") — retry with backoff
const callGemini = async (url, body, attempts = 3) => {
  let lastError
  for (let i = 0; i < attempts; i++) {
    try {
      return await axios.post(url, body, {
        headers: { 'Content-Type': 'application/json' },
        timeout: 60000
      })
    } catch (error) {
      lastError = error
      const status = error.response?.status
      const retriable = status === 503 || status === 429 || status === 500 || !error.response
      if (!retriable || i === attempts - 1) throw error
      await new Promise(r => setTimeout(r, 1500 * (i + 1)))
    }
  }
  throw lastError
}

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
    const response = await callGemini(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          responseMimeType: 'application/json',
          temperature: 0.7
        }
      }
    )

    const text = response.data.candidates[0].content.parts[0].text
    const plan = JSON.parse(text)
    res.json({ success: true, plan })
  } catch (error) {
    const upstream = error.response?.data?.error
    console.error('Gemini error:', upstream ? `${error.response.status} ${upstream.message}` : error.message)
    res.status(500).json({
      success: false,
      error: upstream?.message?.slice(0, 200) || 'Could not generate a trip plan. Please try again.'
    })
  }
})

module.exports = router
