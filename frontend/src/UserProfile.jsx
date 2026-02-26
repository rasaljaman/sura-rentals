// frontend/src/UserProfile.jsx
import { useState, useEffect } from 'react'
import { supabase } from './supabaseClient'
import { Link, Navigate } from 'react-router-dom'
import { motion } from 'framer-motion'

export default function UserProfile({ session, cars }) {
  const [location, setLocation] = useState(session?.user?.user_metadata?.location || '')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })
  
  // Wishlist state
  const [wishlist, setWishlist] = useState([])
  useEffect(() => {
    if (session) {
      // Clean fetch without headers
      fetch('http://localhost:8000/api/wishlists/')
        .then(res => res.json())
        .then(data => {
          if(Array.isArray(data)) {
            const myLikes = data.filter(w => w.user_email === session.user.email)
            setWishlist(myLikes)
          }
        })
        .catch(err => console.error("Error fetching wishlist:", err))
    }
  }, [session])

  

  if (!session) return <Navigate to="/" />

  const handleUpdateProfile = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage({ type: '', text: '' })

    try {
      const updates = { data: { location } }
      if (password.length > 0) {
        if (password.length < 6) throw new Error("Password must be at least 6 characters.")
        updates.password = password
      }

      const { error } = await supabase.auth.updateUser(updates)
      if (error) throw error

      setMessage({ type: 'success', text: 'Profile updated successfully!' })
      setPassword('')
    } catch (err) {
      setMessage({ type: 'error', text: err.message })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#1c1c1e] text-white pt-32 px-6 pb-20 flex flex-col items-center">
      <div className="w-full max-w-4xl">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Account Dashboard</h1>
          <Link to="/" className="text-gray-400 hover:text-white bg-white/5 px-4 py-2 rounded-full text-sm">Back to Home</Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Settings Column */}
          <div className="lg:col-span-1">
            <div className="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-md">
              <div className="flex items-center gap-4 mb-8 pb-8 border-b border-white/10">
                <div className="w-16 h-16 bg-[#0A84FF] rounded-full flex items-center justify-center text-2xl font-bold">
                  {session.user.email[0].toUpperCase()}
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Account Email</p>
                  <p className="font-medium text-sm break-all">{session.user.email}</p>
                </div>
              </div>

              {message.text && (
                <div className={`p-4 rounded-xl mb-6 text-sm font-medium ${message.type === 'success' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                  {message.text}
                </div>
              )}

              <form onSubmit={handleUpdateProfile} className="space-y-5">
                <div>
                  <label className="block text-gray-400 text-xs uppercase tracking-wider mb-2 ml-1">Location</label>
                  <input type="text" placeholder="e.g., Malappuram, Kerala" value={location} onChange={e => setLocation(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white focus:ring-2 focus:ring-[#0A84FF] outline-none" />
                </div>
                <div>
                  <label className="block text-gray-400 text-xs uppercase tracking-wider mb-2 ml-1">New Password</label>
                  <input type="password" placeholder="Leave blank to keep current" value={password} onChange={e => setPassword(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white focus:ring-2 focus:ring-[#0A84FF] outline-none" />
                </div>
                <button type="submit" disabled={loading} className="w-full bg-[#0A84FF] hover:bg-blue-600 text-white py-3 rounded-xl font-bold transition-all disabled:opacity-50">
                  {loading ? 'Saving...' : 'Save Settings'}
                </button>
              </form>
            </div>
          </div>

          {/* Wishlist Column */}
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <svg viewBox="0 0 24 24" width="24" height="24" stroke="#ff2d55" fill="#ff2d55" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" /></svg>
              Saved Vehicles
            </h2>
            
            {wishlist.length === 0 ? (
              <div className="bg-white/5 border border-white/10 rounded-3xl p-12 text-center">
                <p className="text-gray-400 mb-4">You haven't saved any vehicles yet.</p>
                <Link to="/" className="text-[#0A84FF] font-medium hover:text-white transition-colors">Browse the Fleet</Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {wishlist.map(item => {
                  const car = cars?.find(c => c.id === item.car)
                  if (!car) return null
                  return (
                    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} key={item.id} className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden group">
                      <Link to={`/car/${car.id}`} className="block relative h-40 bg-black/40">
                        <img src={car.image_url} alt={car.model} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#1c1c1e] to-transparent opacity-80"></div>
                        <div className="absolute bottom-4 left-4">
                          <h3 className="text-lg font-bold text-white">{car.brand}</h3>
                          <p className="text-gray-400 text-sm">{car.model}</p>
                        </div>
                      </Link>
                    </motion.div>
                  )
                })}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  )
}
