// frontend/src/BookingModal.jsx
import { useState, useEffect } from 'react'
import { supabase } from './supabaseClient'

// --- KERALA DISTRICTS & CITIES DATA ---
const keralaLocations = {
  "Alappuzha": ["Alappuzha", "Cherthala", "Kayamkulam", "Chengannur"],
  "Ernakulam": ["Kochi", "Aluva", "Perumbavoor", "Muvattupuzha"],
  "Idukki": ["Thodupuzha", "Munnar", "Kumily", "Kattappana"],
  "Kannur": ["Kannur", "Thalassery", "Payyanur", "Iritty"],
  "Kasaragod": ["Kasaragod", "Kanhangad", "Nileshwar", "Uppala"],
  "Kollam": ["Kollam", "Punalur", "Karunagappally", "Kottarakkara"],
  "Kottayam": ["Kottayam", "Changanassery", "Pala", "Ettumanoor"],
  "Kozhikode": ["Kozhikode", "Vadakara", "Koyilandy", "Ramanattukara"],
  "Malappuram": ["Malappuram", "Manjeri", "Tirur", "Perinthalmanna"],
  "Palakkad": ["Palakkad", "Shoranur", "Ottapalam", "Pattambi"],
  "Pathanamthitta": ["Pathanamthitta", "Thiruvalla", "Adoor", "Konni"],
  "Thiruvananthapuram": ["Trivandrum", "Neyyattinkara", "Attingal", "Varkala"],
  "Thrissur": ["Thrissur", "Chalakudy", "Guruvayur", "Kodungallur"],
  "Wayanad": ["Kalpetta", "Mananthavady", "Sulthan Bathery", "Vythiri"]
}

export default function BookingModal({ isOpen, onClose, car }) {
  const [startDate, setStartDate] = useState('')
  const [pickupTime, setPickupTime] = useState('')
  const [pickupDistrict, setPickupDistrict] = useState('')
  const [pickupCity, setPickupCity] = useState('')

  const [endDate, setEndDate] = useState('')
  const [dropoffTime, setDropoffTime] = useState('')
  const [dropoffDistrict, setDropoffDistrict] = useState('')
  const [dropoffCity, setDropoffCity] = useState('')

  const [totalPrice, setTotalPrice] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)

  // Calculate Price
  useEffect(() => {
    if (startDate && endDate) {
      const start = new Date(startDate)
      const end = new Date(endDate)
      const diffTime = end - start
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

      if (diffDays > 0) setTotalPrice(diffDays * car.daily_rate)
      else setTotalPrice(0)
    }
  }, [startDate, endDate, car])

  // Reset cities when district changes
  useEffect(() => { setPickupCity('') }, [pickupDistrict])
  useEffect(() => { setDropoffCity('') }, [dropoffDistrict])

  if (!isOpen || !car) return null

  const handleBooking = async (e) => {
    e.preventDefault()
    
    if (totalPrice <= 0) {
      setError("Drop-off date must be after pick-up date.")
      return
    }

    setLoading(true)
    setError(null)

    try {
      const { data: { session }, error: authError } = await supabase.auth.getSession()
      if (authError || !session) throw new Error("Authentication error.")

      const payload = {
        car: car.id,
        user_email: session.user.email,
        start_date: startDate,
        end_date: endDate,
        pickup_time: pickupTime,
        dropoff_time: dropoffTime,
        pickup_location: `${pickupCity}, ${pickupDistrict}`,
        dropoff_location: `${dropoffCity}, ${dropoffDistrict}`,
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
        onClose()
      }, 2000)

    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const inputClass = "w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white focus:ring-2 focus:ring-[#0A84FF] outline-none text-sm [color-scheme:dark]"
  const labelClass = "text-gray-400 text-xs uppercase tracking-wider font-semibold ml-1 mb-1 block"

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-[#1c1c1e] border border-white/10 w-full max-w-lg rounded-3xl p-6 md:p-8 shadow-2xl relative my-8">
        
        <h2 className="text-2xl font-bold text-white mb-1">Book {car.brand} {car.model}</h2>
        <p className="text-[#0A84FF] font-medium mb-6">${car.daily_rate} / day</p>
        
        {error && <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-3 rounded-lg mb-4 text-sm">{error}</div>}
        {success && <div className="bg-green-500/10 border border-green-500/50 text-green-400 p-3 rounded-lg mb-4 text-sm font-medium flex items-center gap-2">✓ Booking Confirmed!</div>}

        <form onSubmit={handleBooking} className="space-y-6">
          
          {/* --- PICK-UP SECTION --- */}
          <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
            <h3 className="text-white font-bold mb-3 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500"></span> Pick-Up Details
            </h3>
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <label className={labelClass}>District</label>
                <select required value={pickupDistrict} onChange={e => setPickupDistrict(e.target.value)} className={inputClass}>
                  <option value="">Select District</option>
                  {Object.keys(keralaLocations).map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div>
                <label className={labelClass}>City</label>
                <select required value={pickupCity} onChange={e => setPickupCity(e.target.value)} disabled={!pickupDistrict} className={`${inputClass} disabled:opacity-50`}>
                  <option value="">Select City</option>
                  {pickupDistrict && keralaLocations[pickupDistrict].map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>Date</label>
                <input required type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Time</label>
                <input required type="time" value={pickupTime} onChange={e => setPickupTime(e.target.value)} className={inputClass} />
              </div>
            </div>
          </div>

          {/* --- DROP-OFF SECTION --- */}
          <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
            <h3 className="text-white font-bold mb-3 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-500"></span> Drop-Off Details
            </h3>
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <label className={labelClass}>District</label>
                <select required value={dropoffDistrict} onChange={e => setDropoffDistrict(e.target.value)} className={inputClass}>
                  <option value="">Select District</option>
                  {Object.keys(keralaLocations).map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div>
                <label className={labelClass}>City</label>
                <select required value={dropoffCity} onChange={e => setDropoffCity(e.target.value)} disabled={!dropoffDistrict} className={`${inputClass} disabled:opacity-50`}>
                  <option value="">Select City</option>
                  {dropoffDistrict && keralaLocations[dropoffDistrict].map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>Date</label>
                <input required type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Time</label>
                <input required type="time" value={dropoffTime} onChange={e => setDropoffTime(e.target.value)} className={inputClass} />
              </div>
            </div>
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
