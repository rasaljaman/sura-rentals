// frontend/src/App.jsx
import {
  useState,
  useEffect
} from 'react'
import {
  Routes,
  Route,
  Link
} from 'react-router-dom' // <-- Link is safely imported here
import {
  motion
} from 'framer-motion'
import {
  supabase
} from './supabaseClient'
import AdminLogin from './AdminLogin'
import UserAuthModal from './UserAuthModal'
import CarCard from './CarCard'
import AddCarModal from './AddCarModal'
import MyBookings from './MyBookings'
import UserProfile from './UserProfile'
import CarDetails from './CarDetails'


// --- THE MAIN PUBLIC HOMEPAGE COMPONENT ---
function Home( {
  session, fetchCars, cars, loading
}) {
  const [searchTerm,
    setSearchTerm] = useState('')
  const [selectedCategory,
    setSelectedCategory] = useState('All')
  const categories = ['All',
    'Premium',
    'Vintage',
    'EV',
    'SUV',
    'Sports']
  const filteredCars = cars.filter(car => {
    const matchesSearch = car.brand.toLowerCase().includes(searchTerm.toLowerCase()) || car.model.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === 'All' || car.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const [isAddCarModalOpen,
    setIsAddCarModalOpen] = useState(false)
  const [isAuthModalOpen,
    setIsAuthModalOpen] = useState(false)

  const isAdmin = session?.user?.email === 'rasaljaman15@gmail.com'

  return (
    <div className="min-h-screen bg-[#1c1c1e] text-white selection:bg-[#0A84FF] selection:text-white font-sans overflow-x-hidden">
      {/* 1. Navbar */}
      <nav className="fixed w-full top-0 z-40 bg-[#1c1c1e]/80 backdrop-blur-xl border-b border-white/5 px-6 py-4 flex justify-between items-center">
        <Link to="/" className="text-2xl font-black tracking-tighter">SURA<span className="text-[#0A84FF]">.</span></Link>
        <div className="flex gap-4 items-center">
          {isAdmin && (
            <button
              onClick={() => setIsAddCarModalOpen(true)}
              className="text-sm font-bold text-[#0A84FF] bg-[#0A84FF]/10 px-3 py-1.5 md:px-4 md:py-2 rounded-full"
              >
              <span className="md:hidden">+ Add</span>
              <span className="hidden md:inline">+ Admin: Add Vehicle</span>
            </button>



          )}
          {session ? (
            <div className="flex items-center gap-4 bg-white/5 px-2 py-1.5 rounded-full border border-white/10">
              <Link to="/bookings" className="text-sm text-gray-300 hover:text-white hover:bg-white/10 px-3 py-1.5 rounded-full transition-all hidden md:block">My Bookings</Link>
              <Link to="/profile" className="text-sm text-gray-300 hover:text-white hover:bg-white/10 px-3 py-1.5 rounded-full transition-all hidden md:block">Profile</Link>

              {/* Mobile quick links */}
              <Link to="/bookings" className="text-sm text-gray-300 md:hidden px-2">🗓️</Link>
              <Link to="/profile" className="text-sm text-gray-300 md:hidden px-2">👤</Link>

              <div className="w-px h-4 bg-white/20"></div>
              <button onClick={() => supabase.auth.signOut()} className="text-sm text-red-400 hover:text-red-300 px-3 py-1.5 rounded-full transition-all font-medium">Log Out</button>
            </div>
          ): (
            <button onClick={() => setIsAuthModalOpen(true)} className="text-sm font-medium bg-white text-black px-5 py-2 rounded-full hover:bg-gray-200 transition-colors shadow-lg">Sign In / Join</button>
          )}
        </div>
      </nav>

      {/* 2. Hero Section */}
      <section className="relative pt-32 pb-20 px-6 min-h-[80vh] flex flex-col items-center justify-center overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-[#0A84FF] opacity-10 blur-[120px] rounded-full pointer-events-none"></div>
        <motion.div initial={ { opacity: 0, y: 30 }} animate={ { opacity: 1, y: 0 }} transition={ { duration: 0.8 }} className="text-center z-10 max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter mb-6 leading-tight">Drive the <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-500">Exceptional.</span></h1>
          <p className="text-xl text-gray-400 mb-12 font-light max-w-2xl mx-auto">
            Experience the thrill of the world's most premium vehicles. Delivered to your door.
          </p>
        </motion.div>

        {/* Animated SVG Car */}
        <div className="w-full max-w-3xl mx-auto relative z-10 h-48 md:h-64 mt-8">
          <svg viewBox="0 0 800 300" className="w-full h-full drop-shadow-[0_0_15px_rgba(10,132,255,0.5)]">
            <motion.path initial={ { pathLength: 0, opacity: 0 }} animate={ { pathLength: 1, opacity: 1 }} transition={ { duration: 2.5, ease: "easeInOut", delay: 0.2 }} d="M 120,220 L 150,160 C 180,150 220,130 280,120 L 360,90 C 420,70 500,80 560,110 L 650,150 C 680,160 700,180 720,220 Z" fill="none" stroke="#0A84FF" strokeWidth="4" strokeLinecap="round" />
            <motion.circle initial={ { opacity: 0 }} animate={ { opacity: 1 }} transition={ { delay: 2.2 }} cx="220" cy="220" r="30" fill="none" stroke="#0A84FF" strokeWidth="4" />
            <motion.circle initial={ { opacity: 0 }} animate={ { opacity: 1 }} transition={ { delay: 2.2 }} cx="600" cy="220" r="30" fill="none" stroke="#0A84FF" strokeWidth="4" />
            <motion.line initial={ { pathLength: 0 }} animate={ { pathLength: 1 }} transition={ { duration: 1, delay: 2.5 }} x1="50" y1="220" x2="100" y2="220" stroke="white" strokeWidth="2" strokeOpacity="0.5" strokeLinecap="round" />
            <motion.line initial={ { pathLength: 0 }} animate={ { pathLength: 1 }} transition={ { duration: 1, delay: 2.7 }} x1="20" y1="180" x2="80" y2="180" stroke="white" strokeWidth="2" strokeOpacity="0.3" strokeLinecap="round" />
          </svg>
        </div>
      </section>
   {/* 3. Fleet Grid */}
   <section className="px-6 md:px-12 pb-32 max-w-7xl mx-auto">
     <div className="flex items-center justify-between mb-8">
       <h2 className="text-3xl font-bold tracking-tight">The Fleet</h2>
       <div className="h-px bg-gradient-to-r from-white/20 to-transparent flex-grow ml-8"></div>
     </div>

     {/* --- NEW SEARCH & FILTER BAR --- */}
     <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-10">
       <div className="flex gap-2 overflow-x-auto w-full md:w-auto pb-2 scrollbar-hide">
          {categories.map(cat => (
             <button key={cat} onClick={() => setSelectedCategory(cat)} className={`px-5 py-2.5 rounded-full text-sm font-bold whitespace-nowrap transition-colors ${selectedCategory === cat ? 'bg-[#0A84FF] text-white' : 'bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10'}`}>
               {cat}
             </button>
          ))}
       </div>
       <input type="text" placeholder="Search brands or models..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full md:w-72 bg-white/5 border border-white/10 rounded-full px-5 py-2.5 text-sm text-white focus:ring-2 focus:ring-[#0A84FF] outline-none" />
     </div>

     {loading ? (
       <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0A84FF]"></div></div>
     ) : filteredCars.length === 0 ? (
       <div className="text-center py-20 text-gray-500">No vehicles match your search.</div>
     ) : (
       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
         {/* USE filteredCars HERE INSTEAD OF cars */}
         {filteredCars.map(car => <CarCard key={car.id} car={car} session={session} fetchCars={fetchCars} />)}
       </div>
     )}
   </section>

      

      {/* Modals */}
      <AddCarModal isOpen={isAddCarModalOpen} onClose={() => setIsAddCarModalOpen(false)} onCarAdded={fetchCars} />
      <UserAuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </div>
  )
}

// --- THE MAIN ROUTER APP ---
export default function App() {
  const [session,
    setSession] = useState(null)
  const [cars,
    setCars] = useState([])
  const [loading,
    setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({
      data: {
        session
      }
    }) => setSession(session))
    const {
      data: {
        subscription
      }
    } = supabase.auth.onAuthStateChange((_event, session) => {
        setSession(session)
      })
    return () => subscription.unsubscribe()
  }, [])
  const fetchCars = async () => {
    try {
      setLoading(true)
      const response = await fetch('https://sura-rentals-api.onrender.com/api/cars/')
      let data = await response.json()

      data = data.map(car => ({
        ...car,
        image_url: car.image_url ? car.image_url.replace(
          'https://jdeiyxvvtforxnxjoall.supabase.co', 
          'https://sura-rentals.vercel.app/supabase-proxy'
        ) : car.image_url
      }))

      setCars(data)
    } catch (err) {
      console.error("API Error:", err)
    } finally {
      setLoading(false)
    }
  }

  
  useEffect(() => {
    fetchCars()
  }, [])

  return (
    <Routes>
      <Route path="/" element={<Home session={session} fetchCars={fetchCars} cars={cars} loading={loading} />} />
      <Route path="/admin/login" element={<AdminLogin setSession={setSession} />} />
      <Route path="/bookings" element={<MyBookings session={session} cars={cars} />} />
      <Route path="/profile" element={<UserProfile session={session} cars={cars} />} />
      <Route path="/car/:id" element={<CarDetails cars={cars} session={session} />} />
    </Routes>
  )
}