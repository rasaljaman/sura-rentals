// frontend/src/CarDetails.jsx
import { useState, useEffect, useRef } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import BookingModal from './BookingModal'

export default function CarDetails({ cars, session }) {
  const { id } = useParams()
  const car = cars.find(c => c.id.toString() === id)
  
  const [isLiked, setIsLiked] = useState(false)
  const [wishlistId, setWishlistId] = useState(null)
  const [isBookingOpen, setIsBookingOpen] = useState(false)
  
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')
  const [reviews, setReviews] = useState([])

  // LONG PRESS LOGIC STATE
  const [activeDeleteId, setActiveDeleteId] = useState(null)
  const pressTimer = useRef(null)

  useEffect(() => { window.scrollTo(0, 0) }, [id])

  useEffect(() => {
    fetch('http://localhost:8000/api/reviews/')
      .then(res => res.json())
      .then(data => { if(Array.isArray(data)) setReviews(data.filter(r => r.car.toString() === id)) })
      .catch(err => console.error(err))

    if (session) {
      fetch('http://localhost:8000/api/wishlists/')
        .then(res => res.json())
        .then(data => {
          if(Array.isArray(data)) {
            const item = data.find(w => w.car.toString() === id && w.user_email === session.user.email)
            if (item) { setIsLiked(true); setWishlistId(item.id); }
          }
        })
        .catch(err => console.error(err))
    }
  }, [id, session])

  if (!car) return <div className="min-h-screen bg-[#1c1c1e] text-white flex items-center justify-center">Loading vehicle data...</div>

  const toggleLike = async () => {
    if (!session) return alert("Please sign in to add to wishlist.")
    setIsLiked(!isLiked)
    try {
      if (!isLiked) {
        const res = await fetch('http://localhost:8000/api/wishlists/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ car: car.id, user_email: session.user.email })
        })
        if (res.ok) { const data = await res.json(); setWishlistId(data.id); }
      } else {
        await fetch(`http://localhost:8000/api/wishlists/${wishlistId}/`, { method: 'DELETE' })
        setWishlistId(null)
      }
    } catch (err) { setIsLiked(!isLiked) }
  }

  const handleReviewSubmit = async (e) => {
    e.preventDefault()
    if (!comment || !session) return
    const payload = { car: car.id, user_email: session.user.email.split('@')[0], rating, text: comment }
    const res = await fetch('http://localhost:8000/api/reviews/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
    if (res.ok) {
      const savedReview = await res.json()
      setReviews([savedReview, ...reviews])
      setComment(''); setRating(5)
    }
  }

  // --- LONG PRESS GESTURE HANDLERS ---
  const handlePressStart = (reviewId, reviewEmail) => {
    // Only allow them to hold/delete if they wrote it OR if they are the admin
    const isOwner = session && (reviewEmail === session.user.email.split('@')[0])
    const isAdmin = session && (session.user.email === 'rasaljaman15@gmail.com')
    if (!isOwner && !isAdmin) return

    pressTimer.current = setTimeout(() => {
      setActiveDeleteId(reviewId) // Pop open the delete button after 500ms
    }, 500)
  }

  const handlePressEnd = () => {
    if (pressTimer.current) clearTimeout(pressTimer.current)
  }

  const handleDeleteReview = async (reviewId) => {
    try {
      const res = await fetch(`http://localhost:8000/api/reviews/${reviewId}/`, { method: 'DELETE' })
      if (res.ok) {
        setReviews(reviews.filter(r => r.id !== reviewId))
        setActiveDeleteId(null)
      }
    } catch (err) {
      console.error("Failed to delete review", err)
    }
  }

  return (
    <div className="min-h-screen bg-[#1c1c1e] text-white pt-24 pb-20 px-6 md:px-12" onClick={() => setActiveDeleteId(null)}>
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <Link to="/" className="bg-white/10 hover:bg-white/20 px-5 py-2.5 rounded-full text-sm font-medium transition-colors">← Back to Fleet</Link>
          <motion.button onClick={toggleLike} whileTap={{ scale: 0.8 }} className="p-3 bg-white/5 rounded-full border border-white/10">
            <motion.svg animate={isLiked ? { scale: [1, 1.3, 1] } : {}} transition={{ duration: 0.3 }} viewBox="0 0 24 24" width="28" height="28" stroke={isLiked ? "#ff2d55" : "white"} fill={isLiked ? "#ff2d55" : "transparent"} strokeWidth="2" className="drop-shadow-[0_0_10px_rgba(255,45,85,0.5)]">
              <path strokeLinecap="round" strokeLinejoin="round" d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </motion.svg>
          </motion.button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16">
          <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} className="h-[400px] md:h-[500px] rounded-3xl overflow-hidden bg-black/40 border border-white/10">
            <img src={car.image_url} alt={car.model} className="w-full h-full object-cover" />
          </motion.div>
          <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} className="flex flex-col justify-center">
            <h1 className="text-5xl md:text-6xl font-black tracking-tighter mb-2">{car.brand}</h1>
            <h2 className="text-3xl text-gray-400 font-light mb-6">{car.model}</h2>
            <p className="text-gray-300 text-lg leading-relaxed mb-8">{car.description}</p>
            <div className="flex items-center gap-6 pb-8 border-b border-white/10 mb-8">
              <div>
                <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">Daily Rate</p>
                <p className="text-4xl font-bold text-[#0A84FF]">${car.daily_rate}</p>
              </div>
            </div>
            <button onClick={() => setIsBookingOpen(true)} className="w-full bg-[#0A84FF] hover:bg-blue-600 text-white py-4 rounded-2xl text-lg font-bold shadow-[0_0_20px_rgba(10,132,255,0.4)] transition-all">Reserve this Vehicle</button>
          </motion.div>
        </div>

        {/* --- REVIEWS --- */}
        <div className="max-w-2xl border-t border-white/10 pt-12">
          <h3 className="text-xl font-bold mb-8">{reviews.length} Comments</h3>
          
          <div className="flex gap-4 mb-12 items-start">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#0A84FF] to-purple-600 flex items-center justify-center font-bold text-white shrink-0 shadow-lg">
              {session ? session.user.email[0].toUpperCase() : '?'}
            </div>
            <div className="flex-grow">
              {!session ? (
                <p className="text-sm text-gray-500 mt-2">Sign in to join the conversation...</p>
              ) : (
                <form onSubmit={handleReviewSubmit} className="flex flex-col">
                  <div className="flex gap-1 mb-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button key={star} type="button" onClick={() => setRating(star)} className="focus:outline-none transition-transform hover:scale-110">
                        <svg viewBox="0 0 24 24" width="18" height="18" fill={star <= rating ? "#FFD700" : "transparent"} stroke={star <= rating ? "#FFD700" : "#4B5563"} strokeWidth="2">
                          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                        </svg>
                      </button>
                    ))}
                  </div>
                  <div className="flex items-end gap-2">
                    <input type="text" value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Add a comment... (Long press your comment to delete)" className="w-full bg-transparent border-b border-gray-600 focus:border-[#0A84FF] text-white text-sm py-2 outline-none transition-colors" />
                    <button disabled={!comment} type="submit" className="text-sm font-bold text-[#0A84FF] disabled:text-gray-600 transition-colors pb-2">Post</button>
                  </div>
                </form>
              )}
            </div>
          </div>

          <div className="space-y-8">
            {reviews.map((rev) => (
              <motion.div 
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} key={rev.id} 
                className="flex gap-4 relative select-none touch-manipulation"
                // Long Press Listeners
                onPointerDown={() => handlePressStart(rev.id, rev.user_email)}
                onPointerUp={handlePressEnd}
                onPointerLeave={handlePressEnd}
                onContextMenu={(e) => e.preventDefault()} // Prevent normal right-click/long press menu on mobile
              >
                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center font-bold text-gray-400 shrink-0">
                  {rev.user_email[0].toUpperCase()}
                </div>
                
                <div className="flex flex-col flex-grow">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-sm text-gray-200">@{rev.user_email}</span>
                    <span className="text-xs text-gray-500">•</span>
                    <div className="flex gap-0.5">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <svg key={star} viewBox="0 0 24 24" width="10" height="10" fill={star <= rev.rating ? "#FFD700" : "transparent"} stroke={star <= rev.rating ? "#FFD700" : "transparent"}>
                          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                        </svg>
                      ))}
                    </div>
                  </div>
                  <p className="text-gray-300 text-sm leading-relaxed">{rev.text}</p>
                </div>

                {/* THE POP-UP DELETE BUTTON */}
                {activeDeleteId === rev.id && (
                  <motion.div 
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="absolute right-0 top-0 bg-red-600 text-white text-xs font-bold px-4 py-2 rounded-lg shadow-xl flex items-center gap-2 z-10 cursor-pointer"
                    onClick={(e) => { e.stopPropagation(); handleDeleteReview(rev.id); }}
                  >
                    <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"></path><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                    Delete
                  </motion.div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </div>
      <BookingModal isOpen={isBookingOpen} onClose={() => setIsBookingOpen(false)} car={car} />
    </div>
  )
}
