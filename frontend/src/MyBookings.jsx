// frontend/src/MyBookings.jsx
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Link, Navigate } from 'react-router-dom'

export default function MyBookings({ session, cars }) {
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!session) return

    const fetchMyBookings = async () => {
      try {
        const res = await fetch('http://sura-rentals-api.onrender.com/api/bookings/')
        const data = await res.json()
        const myData = data.filter(b => b.user_email === session.user.email)
        const sortedData = myData.sort((a, b) => new Date(b.start_date) - new Date(a.start_date))
        setBookings(sortedData)
      } catch (err) {
        console.error("Failed to fetch bookings:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchMyBookings()
  }, [session])

  if (!session) return <Navigate to="/" />

  // THE CANCEL BOOKING LOGIC
  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm("Are you sure you want to cancel this reservation?")) return

    try {
      const res = await fetch(`http://sura-rentals-api.onrender.com/api/bookings/${bookingId}/`, {
        method: 'DELETE'
      })
      
      if (res.ok) {
        // Remove it instantly from the UI
        setBookings(bookings.filter(b => b.id !== bookingId))
      } else {
        alert("Failed to cancel booking. Please try again.")
      }
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <div className="min-h-screen bg-[#1c1c1e] text-white pt-32 px-6 md:px-12">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-end mb-12 border-b border-white/10 pb-6">
          <div>
            <h1 className="text-4xl font-bold tracking-tight">My Garage</h1>
            <p className="text-gray-400 mt-2">Your booking history and upcoming reservations.</p>
          </div>
          <Link to="/" className="text-[#0A84FF] hover:text-white transition-colors text-sm font-medium bg-[#0A84FF]/10 px-4 py-2 rounded-full">
            Back to Fleet
          </Link>
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0A84FF]"></div></div>
        ) : bookings.length === 0 ? (
          <div className="text-center py-20 bg-white/5 rounded-3xl border border-white/10">
            <p className="text-gray-400 mb-4">You have no upcoming reservations.</p>
            <Link to="/" className="bg-[#0A84FF] text-white px-6 py-2.5 rounded-full font-bold">Browse Vehicles</Link>
          </div>
        ) : (
          <div className="space-y-6 pb-20">
            {bookings.map(booking => {
              const car = cars.find(c => c.id === booking.car)
              return (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} key={booking.id} className="bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col md:flex-row gap-6 items-center">
                  <div className="w-full md:w-48 h-32 rounded-xl overflow-hidden bg-black/40 flex-shrink-0">
                    {car && <img src={car.image_url} alt={car.model} className="w-full h-full object-cover" />}
                  </div>
                  <div className="flex-grow w-full">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-xl font-bold">{car ? `${car.brand} ${car.model}` : 'Vehicle Loading...'}</h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${booking.status === 'Confirmed' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                        {booking.status}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-4 mt-4 text-sm text-gray-400">
                      <div><span className="block text-gray-500 text-xs uppercase mb-1">Pick-up</span> {booking.start_date}</div>
                      <div><span className="block text-gray-500 text-xs uppercase mb-1">Drop-off</span> {booking.end_date}</div>
                    </div>
                  </div>
                  
                  {/* Total Paid & Cancel Action */}
                  <div className="w-full md:w-auto text-right md:border-l border-white/10 md:pl-6 flex flex-row md:flex-col justify-between md:justify-center items-center md:items-end">
                    <div>
                      <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">Total Paid</p>
                      <p className="text-2xl font-bold text-white mb-3">${booking.total_price}</p>
                    </div>
                    <button 
                      onClick={() => handleCancelBooking(booking.id)}
                      className="bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white px-4 py-2 rounded-full text-xs font-bold transition-colors border border-red-500/30"
                    >
                      Cancel
                    </button>
                  </div>
                </motion.div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
