import { useState } from 'react'
import { supabase } from './supabaseClient'

export default function EditCarModal({ isOpen, onClose, car, onCarUpdated }) {
  const [formData, setFormData] = useState({ 
    brand: car.brand, model: car.model, daily_rate: car.daily_rate, 
    image_url: car.image_url, description: car.description, category: car.category || 'Premium' 
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  if (!isOpen) return null

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const { data: { session }, error: authError } = await supabase.auth.getSession()
      if (authError || !session) throw new Error("Authentication error.")

      const res = await fetch(`https://sura-rentals-api.onrender.com/api/cars/${car.id}/`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify(formData)
      })

      if (!res.ok) throw new Error("Failed to update vehicle.")

      onCarUpdated()
      onClose()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-[#1c1c1e] border border-white/10 w-full max-w-md rounded-3xl p-8 shadow-2xl relative">
        <h2 className="text-2xl font-bold text-white mb-6">Edit {car.brand}</h2>
        {error && <div className="bg-red-500/10 text-red-400 p-3 rounded-lg mb-4 text-sm">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex gap-4">
            <input required type="text" value={formData.brand} onChange={e => setFormData({...formData, brand: e.target.value})} className="w-1/2 bg-black/40 border border-white/10 rounded-xl p-3 text-white focus:ring-2 focus:ring-[#0A84FF] outline-none" />
            <input required type="text" value={formData.model} onChange={e => setFormData({...formData, model: e.target.value})} className="w-1/2 bg-black/40 border border-white/10 rounded-xl p-3 text-white focus:ring-2 focus:ring-[#0A84FF] outline-none" />
          </div>
          
          <div className="flex gap-4">
            <input required type="number" value={formData.daily_rate} onChange={e => setFormData({...formData, daily_rate: e.target.value})} className="w-1/2 bg-black/40 border border-white/10 rounded-xl p-3 text-white focus:ring-2 focus:ring-[#0A84FF] outline-none" />
            <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="w-1/2 bg-black/40 border border-white/10 rounded-xl p-3 text-white focus:ring-2 focus:ring-[#0A84FF] outline-none">
              <option value="Premium">Premium</option>
              <option value="Vintage">Vintage</option>
              <option value="EV">Electric (EV)</option>
              <option value="SUV">SUV</option>
              <option value="Sports">Sports</option>
            </select>
          </div>

          <input required type="url" value={formData.image_url} onChange={e => setFormData({...formData, image_url: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white focus:ring-2 focus:ring-[#0A84FF] outline-none" />
          <textarea required value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white h-24 focus:ring-2 focus:ring-[#0A84FF] outline-none" />
          
          <div className="flex gap-4 pt-4">
            <button type="button" onClick={onClose} className="flex-1 bg-white/5 text-white py-3 rounded-xl hover:bg-white/10">Cancel</button>
            <button type="submit" disabled={loading} className="flex-1 bg-[#0A84FF] text-white py-3 rounded-xl font-bold">{loading ? 'Saving...' : 'Save Changes'}</button>
          </div>
        </form>
      </div>
    </div>
  )
}
