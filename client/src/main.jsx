import { StrictMode, lazy, Suspense } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import './index.css'
import Home from './pages/Home.jsx'
import FlightSearch from './pages/FlightSearch.jsx'
import Destination from './pages/Destination.jsx'
import Booking from './pages/Booking.jsx'
import Trips from './pages/Trips.jsx'
import Plan from './pages/Plan.jsx'
import Login from './pages/Login.jsx'
import Signup from './pages/Signup.jsx'

// mapbox-gl + world-countries are heavy; only load the Map page when needed
const Map = lazy(() => import('./pages/map.jsx'))

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-gray-400">Loading map…</div>}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/flights" element={<FlightSearch />} />
            <Route path="/destination/:id" element={<Destination />} />
            <Route path="/book" element={<Booking />} />
            <Route path="/trips" element={<Trips />} />
            <Route path="/plan" element={<Plan />} />
            <Route path="/map" element={<Map />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
          </Routes>
        </Suspense>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>
)
