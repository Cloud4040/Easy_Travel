import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { Link } from 'react-router-dom'

export default function Signup() {
  const { signUp } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const { error } = await signUp(email, password)
    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      setSuccess(true)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sky-50 to-white flex items-center justify-center px-4">
        <div className="bg-white rounded-3xl shadow-lg border border-sky-100 p-10 w-full max-w-md text-center">
          <span className="text-5xl">✉️</span>
          <h2 className="text-2xl font-bold text-gray-800 mt-4 mb-2">Check your email</h2>
          <p className="text-gray-400">We sent a confirmation link to <span className="text-gray-700 font-medium">{email}</span>. Click it to activate your account.</p>
          <Link to="/login" className="block mt-8 bg-sky-500 hover:bg-sky-400 text-white rounded-xl py-3 font-bold transition-colors">Go to Sign In</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 to-white flex items-center justify-center px-4">
      <div className="bg-white rounded-3xl shadow-lg border border-sky-100 p-10 w-full max-w-md">
        <div className="text-center mb-8">
          <span className="text-4xl">✈️</span>
          <h1 className="text-2xl font-extrabold text-sky-500 mt-2">Easy Travel</h1>
          <p className="text-gray-400 text-sm mt-1">Start your journey today</p>
        </div>
        {error && (
          <div className="bg-red-50 border border-red-100 text-red-500 text-sm rounded-xl px-4 py-3 mb-6">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1 block">Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-sky-300 transition"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1 block">Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-sky-300 transition"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-sky-500 hover:bg-sky-400 disabled:bg-sky-200 text-white rounded-xl py-3 font-bold transition-colors mt-2"
          >
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>
        <p className="text-gray-400 text-sm mt-6 text-center">
          Already have an account?{' '}
          <Link to="/login" className="text-sky-500 font-semibold hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  )
}