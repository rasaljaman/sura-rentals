// frontend/src/AdminLogin.jsx
import { useState } from 'react'
import { supabase } from './supabaseClient'
import { useNavigate } from 'react-router-dom'

export default function AdminLogin({ setSession }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError(error.message)
    } else {
      setSession(data.session)
      navigate('/') // Send the admin back to the homepage after logging in
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-black flex flex-col justify-center items-center p-6 font-sans">
      <div className="w-full max-w-md bg-[#1c1c1e] border border-red-500/20 p-8 rounded-3xl shadow-[0_0_40px_rgba(255,0,0,0.1)]">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-red-500/10 mb-4 text-red-500">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Admin Gateway</h1>
          <p className="text-gray-500 mt-2 text-xs uppercase tracking-wider">Restricted Access</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <input type="email" placeholder="Admin Email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-red-500/50 transition-colors" required />
          <input type="password" placeholder="Passkey" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-red-500/50 transition-colors" required />
          
          {error && <p className="text-red-400 text-sm text-center bg-red-500/10 p-2 rounded-lg">{error}</p>}

          <button type="submit" disabled={loading} className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-xl transition-colors mt-4">
            {loading ? 'Authenticating...' : 'Authorize'}
          </button>
        </form>
      </div>
    </div>
  )
}
