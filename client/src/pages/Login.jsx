import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate, Link } from 'react-router-dom'

export default function Login() {
  const { signIn } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const { error } = await signIn(email, password)
    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      navigate('/')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 to-white flex items-center justify-center px-4">
      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2">
            <span className="text-3xl">✈️</span>
            <span className="text-2xl font-extrabold text-sky-500">Easy Travel</span>
          </Link>
          <h2 className="text-gray-800 font-bold text-xl mt-4">Welcome back!</h2>
          <p className="text-gray-400 text-sm mt-1">Sign in to continue planning your adventures</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl shadow-lg border border-sky-100 p-8">
          {error && (
            <div className="bg-red-50 border border-red-100 text-red-500 text-sm rounded-xl px-4 py-3 mb-6">
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1.5 block">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                placeholder="you@example.com"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-800 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-sky-300 focus:border-transparent transition"
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
                  Password
                </label>
                <span className="text-xs text-sky-500 hover:underline cursor-pointer">Forgot password?</span>
              </div>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-800 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-sky-300 focus:border-transparent transition"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-sky-500 hover:bg-sky-400 disabled:bg-sky-200 text-white rounded-xl py-3 font-bold text-base transition-colors shadow-sm mt-2"
            >
              {loading ? '✈️ Signing in...' : 'Sign In'}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-gray-100"></div>
            <span className="text-gray-300 text-xs">or</span>
            <div className="flex-1 h-px bg-gray-100"></div>
          </div>

          <p className="text-center text-gray-400 text-sm">
            Don't have an account?{' '}
            <Link to="/signup" className="text-sky-500 font-semibold hover:underline">
              Sign up free
            </Link>
          </p>
        </div>

        {/* Footer note */}
        <p className="text-center text-gray-300 text-xs mt-6">
          By signing in you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  )
}