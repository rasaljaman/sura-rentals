import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { supabase } from './supabaseClient'

export default function UpdatePassword() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)
  
  const navigate = useNavigate()

  // Optional: Check if the user actually arrived here via a recovery link
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        setError("Your reset link has expired or is invalid. Please request a new one.")
      }
    })
  }, [])

  const handleUpdatePassword = async (e) => {
    e.preventDefault()
    setError(null)

    // 1. Professional Validation
    if (password.length < 6) {
      return setError("Password must be at least 6 characters long.")
    }
    if (password !== confirmPassword) {
      return setError("Passwords do not match.")
    }

    setLoading(true)

    try {
      // 2. Secure Supabase Update Method
      const { error: updateError } = await supabase.auth.updateUser({
        password: password
      })

      if (updateError) throw updateError

      // 3. Success Feedback & Redirect
      setSuccess(true)
      setTimeout(() => {
        navigate('/') // Send them back to the homepage after 3 seconds
      }, 3000)

    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#1c1c1e] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-black/40 border border-white/10 w-full max-w-md rounded-3xl p-8 shadow-2xl relative overflow-hidden backdrop-blur-xl"
      >
        {/* Decorative Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-32 bg-[#0A84FF] rounded-full blur-[80px] opacity-20 pointer-events-none"></div>

        <h2 className="text-3xl font-bold text-white mb-2 relative z-10">Reset Password</h2>
        <p className="text-gray-400 text-sm mb-8 relative z-10">Please enter your new secure password below.</p>

        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-3 rounded-xl mb-6 text-sm relative z-10">
            {error}
          </div>
        )}

        {success ? (
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }} 
            animate={{ scale: 1, opacity: 1 }} 
            className="bg-green-500/10 border border-green-500/50 text-green-400 p-6 rounded-xl text-center relative z-10"
          >
            <div className="text-3xl mb-2">✓</div>
            <p className="font-bold">Password Updated!</p>
            <p className="text-xs mt-2 opacity-80">Redirecting you to the homepage...</p>
          </motion.div>
        ) : (
          <form onSubmit={handleUpdatePassword} className="space-y-5 relative z-10">
            <div>
              <label className="text-gray-400 text-xs uppercase tracking-wider font-semibold ml-1 mb-1 block">New Password</label>
              <input 
                required 
                type="password" 
                placeholder="••••••••" 
                className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:ring-2 focus:ring-[#0A84FF] outline-none transition-all"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            
            <div>
              <label className="text-gray-400 text-xs uppercase tracking-wider font-semibold ml-1 mb-1 block">Confirm Password</label>
              <input 
                required 
                type="password" 
                placeholder="••••••••" 
                className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:ring-2 focus:ring-[#0A84FF] outline-none transition-all"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>

            <button 
              type="submit" 
              disabled={loading} 
              className="w-full bg-[#0A84FF] hover:bg-blue-600 text-white py-3.5 rounded-xl font-bold shadow-lg shadow-blue-500/30 transition-all disabled:opacity-50 mt-4"
            >
              {loading ? 'Updating securely...' : 'Save New Password'}
            </button>
          </form>
        )}
      </motion.div>
    </div>
  )
}
