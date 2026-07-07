const express = require('express')
const cors = require('cors')
require('dotenv').config()

const flightsRouter = require('./routes/flights')

const app = express()
const PORT = process.env.PORT || 3001

app.use(cors())
app.use(express.json())

app.get('/api/health', (req, res) => {
  res.json({ status: 'Server is running' })
})

app.use('/api/flights', flightsRouter)

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})