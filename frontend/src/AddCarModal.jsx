import { useState } from 'react'
import { supabase } from './supabaseClient'
import imageCompression from 'browser-image-compression'

export default function AddCarModal({ isOpen, onClose, onCarAdded }) {
  const [formData, setFormData] = useState({
    brand: '', model: '', daily_rate: '', image_url: '', description: '', category: 'Premium'
  })

  const [uploadMethod, setUploadMethod] = useState('url')
  const [imageFiles, setImageFiles] = useState([]) // Array for multiple images
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  if (!isOpen) return null

  // Handle multiple file selection
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setImageFiles(Array.from(e.target.files))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      // 1. Get the secure Supabase JWT Token
      const { data: { session }, error: authError } = await supabase.auth.getSession()
      if (authError || !session) throw new Error("Authentication error. Please log in again.")

      let finalImageUrl = formData.image_url
      let finalGallery = []

      // 2. Handle Multiple Device File Uploads with Compression
      if (uploadMethod === 'file' && imageFiles.length > 0) {
        
        const options = {
          maxSizeMB: 0.5,          // Compress to a maximum of 500KB
          maxWidthOrHeight: 1280,  // Scale down massive photos
          useWebWorker: true       // Makes compression faster
        }

        for (const file of imageFiles) {
          // Compress each image before uploading
          const compressedFile = await imageCompression(file, options)
          
          const fileExt = compressedFile.name.split('.').pop() || 'jpg'
          const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
          
          const { error: uploadError } = await supabase.storage
            .from('car-images')
            .upload(fileName, compressedFile, { cacheControl: '3600', upsert: true })

          if (uploadError) throw new Error("Failed to upload image: " + uploadError.message)

          // Get the permanent public URL
          const { data: { publicUrl } } = supabase.storage
            .from('car-images')
            .getPublicUrl(fileName)

          finalGallery.push(publicUrl)
        }

        // The first image becomes the main cover, the rest go to the gallery array
        finalImageUrl = finalGallery[0]

      } else if (uploadMethod === 'file' && imageFiles.length === 0) {
        throw new Error("Please select an image file to upload.")
      }

      // 3. Send the final data (with the URL and Gallery) to your Django API
      const payload = {
        ...formData,
        image_url: finalImageUrl,
        gallery: finalGallery
      }

      const res = await fetch('https://sura-rentals-api.onrender.com/api/cars/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify(payload)
      })

      if (!res.ok) throw new Error("Failed to save to database. Check your inputs.")

      // Success! Refresh grid and reset form
      onCarAdded()
      setFormData({ brand: '', model: '', daily_rate: '', image_url: '', description: '', category: 'Premium' })
      setImageFiles([])
      onClose()

    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-[#1c1c1e] border border-white/10 w-full max-w-md rounded-3xl p-8 shadow-2xl relative overflow-hidden">

        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-32 bg-[#0A84FF] rounded-full blur-[80px] opacity-20 pointer-events-none"></div>

        <h2 className="text-2xl font-bold text-white mb-6 relative z-10">Add New Vehicle</h2>

        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-3 rounded-lg mb-4 text-sm relative z-10">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
          <div className="flex gap-4">
            <input required type="text" placeholder="Brand (e.g. Porsche)" className="w-1/2 bg-black/40 border border-white/10 rounded-xl p-3 text-white focus:ring-2 focus:ring-[#0A84FF] outline-none" onChange={e => setFormData({ ...formData, brand: e.target.value })} />
            <input required type="text" placeholder="Model (e.g. 911)" className="w-1/2 bg-black/40 border border-white/10 rounded-xl p-3 text-white focus:ring-2 focus:ring-[#0A84FF] outline-none" onChange={e => setFormData({ ...formData, model: e.target.value })} />
          </div>

          <input required type="number" placeholder="Daily Rate ($)" className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white focus:ring-2 focus:ring-[#0A84FF] outline-none" onChange={e => setFormData({ ...formData, daily_rate: e.target.value })} />

          <select value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })} className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white focus:ring-2 focus:ring-[#0A84FF] outline-none mb-4">
            <option value="Premium">Premium</option>
            <option value="Vintage">Vintage</option>
            <option value="EV">Electric (EV)</option>
            <option value="SUV">SUV</option>
            <option value="Sports">Sports</option>
          </select>

          {/* Image Upload Toggle */}
          <div className="bg-black/20 p-2 rounded-xl border border-white/5">
            <div className="flex gap-2 mb-3">
              <button type="button" onClick={() => setUploadMethod('url')} className={`flex-1 py-1.5 text-sm rounded-lg transition-colors ${uploadMethod === 'url' ? 'bg-white/10 text-white font-medium' : 'text-gray-500 hover:text-white'}`}>Link URL</button>
              <button type="button" onClick={() => setUploadMethod('file')} className={`flex-1 py-1.5 text-sm rounded-lg transition-colors ${uploadMethod === 'file' ? 'bg-white/10 text-white font-medium' : 'text-gray-500 hover:text-white'}`}>Upload File(s)</button>
            </div>

            {uploadMethod === 'url' ? (
              <input required type="url" placeholder="Paste Image URL here" className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white focus:ring-2 focus:ring-[#0A84FF] outline-none" onChange={e => setFormData({ ...formData, image_url: e.target.value })} />
            ) : (
              // ADDED 'multiple' attribute here to allow selecting many files
              <input required type="file" multiple accept="image/*" onChange={handleFileChange} className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[#0A84FF] file:text-white hover:file:bg-blue-600 outline-none" />
            )}
          </div>

          <textarea required placeholder="Vehicle Description" className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white h-24 focus:ring-2 focus:ring-[#0A84FF] outline-none" onChange={e => setFormData({ ...formData, description: e.target.value })} />

          <div className="flex gap-4 pt-4">
            <button type="button" onClick={onClose} disabled={loading} className="flex-1 bg-white/5 text-white py-3 rounded-xl hover:bg-white/10 transition-colors">Cancel</button>
            <button type="submit" disabled={loading} className="flex-1 bg-[#0A84FF] hover:bg-blue-600 text-white py-3 rounded-xl font-bold shadow-lg shadow-blue-500/30 transition-all disabled:opacity-50">
              {loading ? 'Uploading & Saving...' : 'Save Vehicle'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
