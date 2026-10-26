import React, { useState } from 'react'
import { X, Building2, MapPin, Save } from 'lucide-react'
import { REGIONS } from '../../data/regionsData'
import LocationPickerMap from './LocationPickerMap'

export default function MallModal({
  mall,
  onSave,
  onClose
}) {
  const isEditing = Boolean(mall?.id)

  const [formData, setFormData] = useState(() => ({
    id: mall?.id || `mall-${Math.random().toString(36).substring(2, 9)}`,
    name: mall?.name || '',
    regionId: mall?.regionId || 'andijon',
    regionName: mall?.regionName || 'Andijon viloyati',
    city: mall?.city || 'Andijon shahri',
    category: mall?.category || 'Savdo va Ko\'ngilochar Majmuasi',
    coords: mall?.coords || [40.7580, 72.3550],
    address: mall?.address || '',
    generalHours: mall?.generalHours || '09:00 - 22:00',
    image: mall?.image || 'https://images.unsplash.com/photo-1519567241046-7f570eee3ce6?w=800&auto=format&fit=crop&q=80',
    rating: mall?.rating || 4.7,
    reviewsCount: mall?.reviewsCount || 1200,
    phone: mall?.phone || '+998 74 228 00 00',
    website: mall?.website || '',
    instagram: mall?.instagram || '',
    parkingSpots: mall?.parkingSpots || 500,
    plusCode: mall?.plusCode || '',
    description: mall?.description || '',
    floors: mall?.floors ? mall.floors.join(', ') : '1-qavat, 2-qavat, 3-qavat',
    brands: mall?.brands || []
  }))

  const [errors, setErrors] = useState({})

  // Region o'zgarganda nomini va shahar nomini avtomatik moslashtirish
  const handleRegionChange = (regId) => {
    const reg = REGIONS.find((r) => r.id === regId)
    setFormData((prev) => ({
      ...prev,
      regionId: regId,
      regionName: reg ? reg.name : prev.regionName,
      city: reg ? `${reg.shortName} shahri` : prev.city,
      coords: reg ? reg.coords : prev.coords
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    const errs = {}
    if (!formData.name.trim()) errs.name = 'Majmua nomi kiritilishi shart'
    if (!formData.address.trim()) errs.address = 'Manzil kiritilishi shart'
    if (!formData.coords || formData.coords.length !== 2 || isNaN(formData.coords[0]) || isNaN(formData.coords[1])) {
      errs.coords = 'Xaritadan aniq lokatsiyani tanlang'
    }

    if (Object.keys(errs).length > 0) {
      setErrors(errs)
      return
    }

    // Floors string -> array
    const floorsArray = formData.floors
      .split(',')
      .map((f) => f.trim())
      .filter(Boolean)

    const updatedMall = {
      ...formData,
      floors: floorsArray.length > 0 ? floorsArray : ['1-qavat'],
      googleSearchQuery: `${formData.name}, ${formData.address}`,
      googlePlaceName: formData.name,
      googleMapsUrl: `https://www.google.com/maps/search/?api=1&query=${formData.coords[0]},${formData.coords[1]}`
    }

    onSave(updatedMall)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-zinc-950/50 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl border border-zinc-200 overflow-hidden my-6 animate-modal">
        
        {/* Modal Header */}
        <div className="p-5 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-zinc-900 text-white flex items-center justify-center shadow-xs">
              <Building2 className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h3 className="font-bold text-base text-zinc-900">
                {isEditing ? 'Savdo majmuasini tahrirlash' : 'Yangi Savdo majmuasi qo\'shish'}
              </h3>
              <p className="text-xs text-zinc-500 mt-0.5">
                Barcha ma'lumotlar va xaritadagi lokatsiyani kiriting
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 hover:bg-zinc-200/60 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-5 max-h-[78vh] overflow-y-auto">
          
          {/* 1. Asosiy ma'lumotlar */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1">
                Majmua nomi *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Masalan: Navro'z Mall"
                className={`w-full px-3 py-2 text-xs sm:text-sm bg-white border rounded-xl outline-none transition-colors ${
                  errors.name ? 'border-rose-400 focus:border-rose-500' : 'border-zinc-200 focus:border-zinc-400'
                }`}
              />
              {errors.name && <p className="text-[11px] text-rose-500 mt-1">{errors.name}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1">
                Viloyat *
              </label>
              <select
                value={formData.regionId}
                onChange={(e) => handleRegionChange(e.target.value)}
                className="w-full px-3 py-2 text-xs sm:text-sm bg-white border border-zinc-200 rounded-xl outline-none focus:border-zinc-400 transition-colors"
              >
                {REGIONS.filter((r) => r.id !== 'all').map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1">
                Shahar / Tuman
              </label>
              <input
                type="text"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                placeholder="Andijon shahri"
                className="w-full px-3 py-2 text-xs sm:text-sm bg-white border border-zinc-200 rounded-xl outline-none focus:border-zinc-400"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1">
                Turi / Kategoriya
              </label>
              <input
                type="text"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                placeholder="Savdo va Ko'ngilochar Majmuasi"
                className="w-full px-3 py-2 text-xs sm:text-sm bg-white border border-zinc-200 rounded-xl outline-none focus:border-zinc-400"
              />
            </div>
          </div>

          {/* 2. Manzil */}
          <div>
            <label className="block text-xs font-semibold text-zinc-700 mb-1">
              To'liq manzil *
            </label>
            <input
              type="text"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="Andijon sh., Mashrab ko'chasi, 62/64"
              className={`w-full px-3 py-2 text-xs sm:text-sm bg-white border rounded-xl outline-none transition-colors ${
                errors.address ? 'border-rose-400 focus:border-rose-500' : 'border-zinc-200 focus:border-zinc-400'
              }`}
            />
            {errors.address && <p className="text-[11px] text-rose-500 mt-1">{errors.address}</p>}
          </div>

          {/* 3. Xaritada joylashuvni tanlash (INTERACTIVE MAP PICKER) */}
          <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200/90 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-700 flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-emerald-600" />
                  <span>Xaritadan lokatsiyani belgilash *</span>
                </h4>
                <p className="text-[11px] text-zinc-500 mt-0.5">
                  Xaritadagi bino ustiga bosib yoki pinni surib aniq nuqtani ko'rsating
                </p>
              </div>
            </div>

            {/* Xarita Picker */}
            <LocationPickerMap
              coords={formData.coords}
              regionId={formData.regionId}
              onChange={(newCoords) => setFormData({ ...formData, coords: newCoords })}
            />

            {/* Qo'lda koordinata kiritish imkoniyati */}
            <div className="grid grid-cols-2 gap-3 pt-1">
              <div>
                <label className="block text-[11px] text-zinc-500 mb-0.5">Kenglik (Latitude)</label>
                <input
                  type="number"
                  step="0.000001"
                  value={formData.coords[0]}
                  onChange={(e) => setFormData({
                    ...formData,
                    coords: [parseFloat(e.target.value) || 0, formData.coords[1]]
                  })}
                  className="w-full px-2.5 py-1.5 text-xs font-mono bg-white border border-zinc-200 rounded-lg outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] text-zinc-500 mb-0.5">Uzunlik (Longitude)</label>
                <input
                  type="number"
                  step="0.000001"
                  value={formData.coords[1]}
                  onChange={(e) => setFormData({
                    ...formData,
                    coords: [formData.coords[0], parseFloat(e.target.value) || 0]
                  })}
                  className="w-full px-2.5 py-1.5 text-xs font-mono bg-white border border-zinc-200 rounded-lg outline-none"
                />
              </div>
            </div>
            {errors.coords && <p className="text-[11px] text-rose-500">{errors.coords}</p>}
          </div>

          {/* 4. Ish vaqti, qavatlar va rasm */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1">
                Umumiy ish vaqti
              </label>
              <input
                type="text"
                value={formData.generalHours}
                onChange={(e) => setFormData({ ...formData, generalHours: e.target.value })}
                placeholder="09:00 - 23:00"
                className="w-full px-3 py-2 text-xs sm:text-sm bg-white border border-zinc-200 rounded-xl outline-none focus:border-zinc-400"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1">
                Reyting (1.0 - 5.0)
              </label>
              <input
                type="number"
                step="0.1"
                min="1"
                max="5"
                value={formData.rating}
                onChange={(e) => setFormData({ ...formData, rating: parseFloat(e.target.value) || 4.5 })}
                className="w-full px-3 py-2 text-xs sm:text-sm bg-white border border-zinc-200 rounded-xl outline-none focus:border-zinc-400"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1">
                Avtoturargoh o'rni
              </label>
              <input
                type="number"
                value={formData.parkingSpots}
                onChange={(e) => setFormData({ ...formData, parkingSpots: parseInt(e.target.value) || 0 })}
                placeholder="1000"
                className="w-full px-3 py-2 text-xs sm:text-sm bg-white border border-zinc-200 rounded-xl outline-none focus:border-zinc-400"
              />
            </div>
          </div>

          {/* 5. Qavatlar va Plus code */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1">
                Qavatlar ro'yxati (vergul bilan)
              </label>
              <input
                type="text"
                value={formData.floors}
                onChange={(e) => setFormData({ ...formData, floors: e.target.value })}
                placeholder="1-qavat, 2-qavat, 3-qavat, Food Court"
                className="w-full px-3 py-2 text-xs sm:text-sm bg-white border border-zinc-200 rounded-xl outline-none focus:border-zinc-400"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1">
                Google Plus Code
              </label>
              <input
                type="text"
                value={formData.plusCode}
                onChange={(e) => setFormData({ ...formData, plusCode: e.target.value })}
                placeholder="Q927+XGV, Andijan"
                className="w-full px-3 py-2 text-xs sm:text-sm font-mono bg-white border border-zinc-200 rounded-xl outline-none focus:border-zinc-400"
              />
            </div>
          </div>

          {/* 6. Kontaktlar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1">
                Telefon
              </label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+998 74 228 00 00"
                className="w-full px-3 py-2 text-xs sm:text-sm bg-white border border-zinc-200 rounded-xl outline-none focus:border-zinc-400"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1">
                Instagram
              </label>
              <input
                type="text"
                value={formData.instagram}
                onChange={(e) => setFormData({ ...formData, instagram: e.target.value })}
                placeholder="@navrozmall_andijon"
                className="w-full px-3 py-2 text-xs sm:text-sm bg-white border border-zinc-200 rounded-xl outline-none focus:border-zinc-400"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1">
                Veb-sayt
              </label>
              <input
                type="text"
                value={formData.website}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                placeholder="https://..."
                className="w-full px-3 py-2 text-xs sm:text-sm bg-white border border-zinc-200 rounded-xl outline-none focus:border-zinc-400"
              />
            </div>
          </div>

          {/* 7. Rasm URL */}
          <div>
            <label className="block text-xs font-semibold text-zinc-700 mb-1">
              Rasm URL manzili
            </label>
            <input
              type="text"
              value={formData.image}
              onChange={(e) => setFormData({ ...formData, image: e.target.value })}
              placeholder="https://images.unsplash.com/..."
              className="w-full px-3 py-2 text-xs sm:text-sm bg-white border border-zinc-200 rounded-xl outline-none focus:border-zinc-400"
            />
            {formData.image && (
              <div className="mt-2 w-36 h-20 rounded-lg overflow-hidden border border-zinc-200">
                <img
                  src={formData.image}
                  alt="Mall preview"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = 'https://images.unsplash.com/photo-1519567241046-7f570eee3ce6?w=800&auto=format&fit=crop&q=80'
                  }}
                />
              </div>
            )}
          </div>

          {/* 8. Tavsif */}
          <div>
            <label className="block text-xs font-semibold text-zinc-700 mb-1">
              Qisqacha tavsif
            </label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Savdo majmuasi haqida ma'lumot..."
              className="w-full px-3 py-2 text-xs sm:text-sm bg-white border border-zinc-200 rounded-xl outline-none focus:border-zinc-400"
            />
          </div>

          {/* Footer buttons */}
          <div className="pt-4 border-t border-zinc-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-zinc-200 hover:bg-zinc-100 text-zinc-700 text-xs font-semibold transition-colors cursor-pointer"
            >
              Bekor qilish
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
            >
              <Save className="w-4 h-4 text-emerald-400" />
              <span>{isEditing ? 'O\'zgarishlarni saqlash' : 'Majmuani qo\'shish'}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  )
}
