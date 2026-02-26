// frontend/src/UserAuthModal.jsx
import { useState } from 'react'
import { supabase } from './supabaseClient'

export default function UserAuthModal({ isOpen, onClose }) {
  const [mode, setMode] = useState('signIn') // 'signIn', 'signUp', 'forgot'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState(null)
  const [error, setError] = useState(null)

  if (!isOpen) return null

  const handleAuth = async (e) => {
    e.preventDefault()
    setLoading(true); setError(null); setMessage(null)

    try {
      if (mode === 'forgot') {
        const { error } = await supabase.auth.resetPasswordForEmail(email)
        if (error) throw error
        setMessage("Password reset link sent to your email!")
      } else if (mode === 'signUp') {
        const { error } = await supabase.auth.signUp({ email, password })
        if (error) throw error
        setMessage("Success! Check your email to verify your account.")
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
        onClose()
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-[#1c1c1e] border border-white/10 w-full max-w-md rounded-3xl p-8 shadow-2xl relative">
        <button onClick={onClose} className="absolute top-6 right-6 text-gray-400 hover:text-white">✕</button>
        <h2 className="text-3xl font-bold text-white mb-2">{mode === 'forgot' ? 'Reset Password' : mode === 'signUp' ? 'Join the Club.' : 'Welcome Back.'}</h2>
        <p className="text-gray-400 mb-6">{mode === 'forgot' ? 'Enter your email to receive a reset link.' : 'Sign in to manage your bookings.'}</p>

        {error && <div className="bg-red-500/10 text-red-400 p-3 rounded-xl mb-4 text-sm">{error}</div>}
        {message && <div className="bg-green-500/10 text-green-400 p-3 rounded-xl mb-4 text-sm">{message}</div>}

        <form onSubmit={handleAuth} className="space-y-4">
          <input required type="email" placeholder="Email address" className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white focus:ring-2 focus:ring-[#0A84FF] outline-none" value={email} onChange={e => setEmail(e.target.value)} />
          
          {mode !== 'forgot' && (
            <input required type="password" placeholder="Password" className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white focus:ring-2 focus:ring-[#0A84FF] outline-none" value={password} onChange={e => setPassword(e.target.value)} />
          )}

          <button type="submit" disabled={loading} className="w-full bg-white text-black py-3 rounded-xl font-bold hover:bg-gray-200 transition-colors mt-2">
            {loading ? 'Processing...' : mode === 'forgot' ? 'Send Reset Link' : mode === 'signUp' ? 'Create Account' : 'Sign In'}
          </button>
        </form>

        <div className="mt-6 flex flex-col gap-3 text-center text-sm text-[#0A84FF]">
          {mode === 'signIn' && <button onClick={() => setMode('forgot')} className="hover:text-white transition-colors">Forgot Password?</button>}
          <button onClick={() => { setMode(mode === 'signIn' ? 'signUp' : 'signIn'); setError(null); setMessage(null) }} className="hover:text-white transition-colors">
            {mode === 'signIn' ? "Don't have an account? Create one" : "Back to Sign In"}
          </button>
        </div>
      </div>
    </div>
  )
}
