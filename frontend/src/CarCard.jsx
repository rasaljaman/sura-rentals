// frontend/src/CarCard.jsx
import { useState } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom' // <-- Import Link
import BookingModal from './BookingModal'

export default function CarCard({ car, session, fetchCars }) {
  const [isBookingOpen, setIsBookingOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const isAdmin = session?.user?.email === 'rasaljaman15@gmail.com'

  const handleDelete = async () => {
    if (!window.confirm(`Are you sure you want to delete the ${car.brand} ${car.model}?`)) return
    setIsDeleting(true)
    try {
      const res = await fetch(`http://localhost:8000/api/cars/${car.id}/`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${session.access_token}` }
      })
      if (res.ok) fetchCars()
    } catch (err) {
      console.error(err)
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <>
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        whileHover={{ y: -10 }}
        className="bg-white/5 border border-white/10 rounded-3xl overflow-hidden backdrop-blur-md transition-all group flex flex-col"
      >
        {/* Wrap image and title in a Link so the whole top section is clickable */}
        <Link to={`/car/${car.id}`} className="block relative">
          <div className="h-56 overflow-hidden bg-black/20">
            <img src={car.image_url} alt={car.model} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-in-out" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#1c1c1e] to-transparent opacity-80"></div>
          </div>
          
          <div className="px-6 pt-2 flex flex-col flex-grow -mt-10 relative z-10">
  <div className="flex justify-between items-start">
    <h3 className="text-2xl font-bold text-white tracking-tight">{car.brand} <span className="text-gray-400 font-light">{car.model}</span></h3>
    <div className="flex items-center gap-1 bg-black/40 px-2 py-1 rounded-lg backdrop-blur-md border border-white/5">
      <span className="text-yellow-400 text-sm">★</span>
      <span className="text-white text-xs font-bold">{car.average_rating}</span>
    </div>
  </div>
  <p className="text-gray-400 text-sm mt-3 flex-grow line-clamp-3 leading-relaxed">{car.description}</p>
</div>
        </Link>
        
        <div className="p-6 mt-auto">
          <div className="flex justify-between items-center pt-5 border-t border-white/10">
            <div className="flex flex-col">
              <span className="text-gray-500 text-xs uppercase tracking-wider font-semibold">Daily Rate</span>
              <span className="text-[#0A84FF] font-bold text-xl">${car.daily_rate}</span>
            </div>
            
            {isAdmin ? (
              <button onClick={handleDelete} disabled={isDeleting} className="bg-red-500/10 text-red-500 border border-red-500/30 px-5 py-2.5 rounded-full text-sm font-bold hover:bg-red-500 hover:text-white transition-colors">
                {isDeleting ? 'Deleting...' : 'Delete'}
              </button>
            ) : (
              <button onClick={() => setIsBookingOpen(true)} className="bg-white text-black px-6 py-2.5 rounded-full text-sm font-bold hover:bg-[#0A84FF] hover:text-white transition-all shadow-[0_0_20px_rgba(10,132,255,0.3)]">
                Book Now
              </button>
            )}
          </div>
        </div>
      </motion.div>

      {!isAdmin && <BookingModal isOpen={isBookingOpen} onClose={() => setIsBookingOpen(false)} car={car} />}
    </>
  )
}
