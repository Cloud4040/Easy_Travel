import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export function Header() {
  const { user, signOut } = useAuth()

  return (
    <header className="bg-white border-b border-sky-100 px-6 py-4 flex items-center justify-between sticky top-0 z-50 shadow-sm">
      <Link to="/" className="flex items-center gap-2">
        <span className="text-2xl">✈️</span>
        <h1 className="text-2xl font-extrabold text-sky-500 tracking-tight">Easy Travel</h1>
      </Link>
      <nav className="flex items-center gap-6">
        <Link to="/flights" className="text-gray-500 hover:text-sky-500 font-medium text-sm transition-colors">Search Flights</Link>
        <Link to="/plan" className="text-gray-500 hover:text-sky-500 font-medium text-sm transition-colors">AI Planner</Link>
        {user ? (
          <>
            <Link to="/trips" className="text-gray-500 hover:text-sky-500 font-medium text-sm transition-colors">My Trips</Link>
            <Link to="/map" className="text-gray-500 hover:text-sky-500 font-medium text-sm transition-colors">My Map</Link>
            <span className="text-gray-400 text-xs hidden sm:inline">{user.email}</span>
            <button onClick={signOut} className="text-gray-400 hover:text-gray-600 text-sm">Sign Out</button>
          </>
        ) : (
          <>
            <Link to="/login" className="text-gray-500 hover:text-sky-500 font-medium text-sm transition-colors">Sign In</Link>
            <Link to="/signup" className="bg-sky-500 hover:bg-sky-400 text-white px-5 py-2 rounded-full text-sm font-semibold transition-colors shadow-sm">Get Started</Link>
          </>
        )}
      </nav>
    </header>
  )
}

export function Footer() {
  return (
    <footer className="border-t border-sky-100 px-6 py-8 text-center text-gray-400 text-sm">
      <span className="font-bold text-sky-500">Easy Travel</span> · Built for explorers ✈️
    </footer>
  )
}

export default function Layout({ children }) {
  return (
    <div className="min-h-screen bg-white text-gray-800 font-sans flex flex-col">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  )
}
