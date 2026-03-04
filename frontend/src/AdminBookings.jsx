import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Link, Navigate } from 'react-router-dom'

export default function AdminBookings({ session, cars }) {
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [cancelState, setCancelState] = useState({ id: null, reason: 'Vehicle under maintenance' })

  const isAdmin = session?.user?.email === 'rasaljaman15@gmail.com'

  useEffect(() => {
    if (!isAdmin) return
    const fetchBookings = async () => {
      try {
        const res = await fetch('https://sura-rentals-api.onrender.com/api/bookings/')
        const data = await res.json()
        
        // Sort to show 'Pending' bookings at the very top
        const sorted = data.sort((a, b) => {
          if (a.status === 'Pending' && b.status !== 'Pending') return -1
          if (a.status !== 'Pending' && b.status === 'Pending') return 1
          return new Date(b.start_date) - new Date(a.start_date)
        })
        setBookings(sorted)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchBookings()
  }, [isAdmin])

  if (!session || !isAdmin) return <Navigate to="/" />

  const updateStatus = async (id, newStatus, reason = null) => {
    try {
      const payload = { status: newStatus }
      if (reason) payload.cancellation_reason = reason

      const res = await fetch(`https://sura-rentals-api.onrender.com/api/bookings/${id}/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify(payload)
      })

      if (res.ok) {
        setBookings(bookings.map(b => b.id === id ? { ...b, status: newStatus, cancellation_reason: reason } : b))
        setCancelState({ id: null, reason: 'Vehicle under maintenance' }) // reset
      } else {
        alert("Failed to update booking status.")
      }
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <div className="min-h-screen bg-[#1c1c1e] text-white pt-32 px-6 md:px-12 pb-20">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-end mb-10 border-b border-white/10 pb-6">
          <div>
            <h1 className="text-4xl font-bold tracking-tight">Admin Gateway</h1>
            <p className="text-gray-400 mt-2">Manage all customer reservations.</p>
          </div>
          <Link to="/" className="text-[#0A84FF] hover:text-white transition-colors text-sm font-medium bg-[#0A84FF]/10 px-4 py-2 rounded-full">Back to Fleet</Link>
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0A84FF]"></div></div>
        ) : bookings.length === 0 ? (
          <div className="text-center py-20 text-gray-400">No bookings exist yet.</div>
        ) : (
          <div className="grid gap-6">
            {bookings.map(booking => {
              const car = cars.find(c => c.id === booking.car)
              return (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} key={booking.id} className="bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col lg:flex-row gap-6">
                  
                  {/* Car Image */}
                  <div className="w-full lg:w-48 h-32 rounded-xl overflow-hidden bg-black/40 flex-shrink-0">
                    {car && <img src={car.image_url} alt={car.model} className="w-full h-full object-cover" />}
                  </div>
                  
                  {/* Booking Info */}
                  <div className="flex-grow">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="text-xl font-bold">{car ? `${car.brand} ${car.model}` : 'Loading...'}</h3>
                        <p className="text-sm text-gray-400">Customer: <span className="text-white font-medium">{booking.user_email}</span></p>
                      </div>
                      
                      {/* Status Badge */}
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        booking.status === 'Confirmed' ? 'bg-green-500/20 text-green-400' : 
                        booking.status === 'Cancelled' ? 'bg-red-500/20 text-red-400' : 'bg-yellow-500/20 text-yellow-400'
                      }`}>
                        {booking.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 text-xs text-gray-400 border-t border-white/5 pt-4">
                      <div><span className="block uppercase mb-1">Pick-up</span><span className="text-white">{booking.start_date} <br/> {booking.pickup_time} <br/> {booking.pickup_location}</span></div>
                      <div><span className="block uppercase mb-1">Drop-off</span><span className="text-white">{booking.end_date} <br/> {booking.dropoff_time} <br/> {booking.dropoff_location}</span></div>
                      <div><span className="block uppercase mb-1">Total Price</span><span className="text-[#0A84FF] font-bold text-lg">${booking.total_price}</span></div>
                    </div>
                    
                    {/* Cancellation Reason Display */}
                    {booking.status === 'Cancelled' && booking.cancellation_reason && (
                      <div className="mt-4 bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-lg text-sm">
                        <span className="font-bold">Reason:</span> {booking.cancellation_reason}
                      </div>
                    )}
                  </div>

                  {/* Action Buttons (Only show if Pending) */}
                  {booking.status === 'Pending' && (
                    <div className="lg:border-l border-white/10 lg:pl-6 flex flex-col justify-center gap-2 min-w-[200px]">
                      {cancelState.id === booking.id ? (
                        <div className="flex flex-col gap-2">
                          <select 
                            value={cancelState.reason} 
                            onChange={(e) => setCancelState({ ...cancelState, reason: e.target.value })}
                            className="bg-black/40 border border-white/10 rounded-lg p-2 text-sm text-white focus:ring-[#0A84FF] outline-none"
                          >
                            <option value="Vehicle under maintenance">Maintenance</option>
                            <option value="Already booked for these dates">Already Booked</option>
                            <option value="Vehicle currently unavailable">Not Available</option>
                            <option value="Location out of service range">Location Unreachable</option>
                            <option value="Other">Other</option>
                          </select>
                          <div className="flex gap-2">
                            <button onClick={() => updateStatus(booking.id, 'Cancelled', cancelState.reason)} className="flex-1 bg-red-500 text-white py-2 rounded-lg text-xs font-bold">Confirm Cancel</button>
                            <button onClick={() => setCancelState({ id: null, reason: '' })} className="flex-1 bg-white/10 text-white py-2 rounded-lg text-xs font-bold">Back</button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <button onClick={() => updateStatus(booking.id, 'Confirmed')} className="bg-green-500 text-white py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-green-500/20 hover:bg-green-400 transition-colors">
                            Approve Booking
                          </button>
                          <button onClick={() => setCancelState({ id: booking.id, reason: 'Vehicle under maintenance' })} className="bg-red-500/10 text-red-500 border border-red-500/30 py-2.5 rounded-xl text-sm font-bold hover:bg-red-500 hover:text-white transition-colors">
                            Reject
                          </button>
                        </>
                      )}
                    </div>
                  )}

                </motion.div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
