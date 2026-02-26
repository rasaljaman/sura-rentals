// frontend/src/BookingModal.jsx
import { useState, useEffect } from 'react'
import { supabase } from './supabaseClient'

export default function BookingModal({ isOpen, onClose, car }) {
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [totalPrice, setTotalPrice] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)

  // Instantly calculate price when dates change
  useEffect(() => {
    if (startDate && endDate) {
      const start = new Date(startDate)
      const end = new Date(endDate)
      const diffTime = end - start
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

      if (diffDays > 0) {
        setTotalPrice(diffDays * car.daily_rate)
      } else {
        setTotalPrice(0)
      }
    }
  }, [startDate, endDate, car])

  if (!isOpen || !car) return null

  const handleBooking = async (e) => {
    e.preventDefault()
    
    if (totalPrice <= 0) {
      setError("End date must be after start date.")
      return
    }

    setLoading(true)
    setError(null)

    try {
      const { data: { session }, error: authError } = await supabase.auth.getSession()
      if (authError || !session) throw new Error("Authentication error.")

      // The payload matches the Django Booking model we wrote earlier
      const payload = {
        car: car.id,
        user_email: session.user.email,
        start_date: startDate,
        end_date: endDate,
        total_price: totalPrice,
        status: 'Pending'
      }

      const res = await fetch('https://sura-rentals-api.onrender.com/api/bookings/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify(payload)
      })

      if (!res.ok) throw new Error("Failed to secure booking.")

      setSuccess(true)
      setTimeout(() => {
        setSuccess(false)
        setStartDate('')
        setEndDate('')
        onClose()
      }, 2000)

    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-[#1c1c1e] border border-white/10 w-full max-w-md rounded-3xl p-8 shadow-2xl relative overflow-hidden">
        
        {/* Dynamic header pulling the specific car data */}
        <h2 className="text-2xl font-bold text-white mb-2 relative z-10">Book {car.brand} {car.model}</h2>
        <p className="text-[#0A84FF] font-medium mb-6">${car.daily_rate} / day</p>
        
        {error && <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-3 rounded-lg mb-4 text-sm">{error}</div>}
        {success && <div className="bg-green-500/10 border border-green-500/50 text-green-400 p-3 rounded-lg mb-4 text-sm font-medium flex items-center gap-2">✓ Booking Confirmed!</div>}

        <form onSubmit={handleBooking} className="space-y-5 relative z-10">
          <div className="flex flex-col gap-1">
            <label className="text-gray-400 text-xs uppercase tracking-wider font-semibold ml-1">Pick-up Date</label>
            <input required type="date" className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white focus:ring-2 focus:ring-[#0A84FF] outline-none [color-scheme:dark]" value={startDate} onChange={e => setStartDate(e.target.value)} />
          </div>
          
          <div className="flex flex-col gap-1">
            <label className="text-gray-400 text-xs uppercase tracking-wider font-semibold ml-1">Drop-off Date</label>
            <input required type="date" className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white focus:ring-2 focus:ring-[#0A84FF] outline-none [color-scheme:dark]" value={endDate} onChange={e => setEndDate(e.target.value)} />
          </div>
          
          <div className="bg-white/5 rounded-xl p-4 border border-white/5 flex justify-between items-center mt-2">
            <span className="text-gray-300 font-medium">Total Estimate</span>
            <span className="text-2xl font-bold text-white">${totalPrice.toFixed(2)}</span>
          </div>
          
          <div className="flex gap-4 pt-2">
            <button type="button" onClick={onClose} disabled={loading || success} className="flex-1 bg-white/5 text-white py-3 rounded-xl hover:bg-white/10 transition-colors">Cancel</button>
            <button type="submit" disabled={loading || success || totalPrice <= 0} className="flex-1 bg-[#0A84FF] hover:bg-blue-600 text-white py-3 rounded-xl font-bold shadow-lg shadow-blue-500/30 transition-all disabled:opacity-50">
              {loading ? 'Processing...' : 'Confirm Booking'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
