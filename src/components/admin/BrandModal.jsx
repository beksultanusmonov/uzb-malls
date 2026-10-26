import React, { useState } from 'react'
import { X, Store, Save, Clock, Sparkles } from 'lucide-react'
import { CATEGORIES } from '../../data/mallsData'
import { DAY_NAMES_ORDERED, createStandardSchedule } from '../../utils/workingHours'
import BrandLogo from '../BrandLogo'

const LOGO_BG_PRESETS = [
  { label: 'Moviy / Blue', value: 'bg-blue-600 text-white' },
  { label: 'Klassik Qora / Black', value: 'bg-zinc-900 text-white' },
  { label: 'Qizil / Red', value: 'bg-red-600 text-white' },
  { label: 'Yashil / Emerald', value: 'bg-emerald-600 text-white' },
  { label: 'Sariq / Amber', value: 'bg-amber-500 text-black' },
  { label: 'Binafsha / Purple', value: 'bg-purple-700 text-white' },
  { label: 'Pushti / Pink', value: 'bg-pink-700 text-white' },
  { label: 'To\'q Ko\'k / Indigo', value: 'bg-indigo-900 text-indigo-100' }
]

export default function BrandModal({
  brand,
  mall,
  onSave,
  onClose
}) {
  const isEditing = Boolean(brand?.id)

  const [formData, setFormData] = useState(() => ({
    id: brand?.id || `brand-${Math.random().toString(36).substring(2, 9)}`,
    name: brand?.name || '',
    category: brand?.category || 'fashion',
    categoryName: brand?.categoryName || 'Kiyim & Poyabzal',
    floor: brand?.floor || '1-qavat',
    locationCode: brand?.locationCode || '',
    logoUrl: brand?.logoUrl || brand?.image || '',
    logoText: brand?.logoText || '',
    logoBg: brand?.logoBg || 'bg-zinc-900 text-white',
    phone: brand?.phone || '',
    instagram: brand?.instagram || '',
    website: brand?.website || '',
    discount: brand?.discount || '',
    description: brand?.description || '',
    schedule: brand?.schedule || createStandardSchedule('09:00', '22:00', '23:00')
  }))

  // Jadval rejimi: 'preset' (tezkor) yoki 'custom' (har bir kun alohida)
  const [scheduleMode, setScheduleMode] = useState('preset')
  const [presetOpen, setPresetOpen] = useState('09:00')
  const [presetClose, setPresetClose] = useState('22:00')
  const [presetWeekendClose, setPresetWeekendClose] = useState('23:00')

  const [errors, setErrors] = useState({})

  // Kategoriya o'zgarganda nomini ham yangilash
  const handleCategoryChange = (catId) => {
    const cat = CATEGORIES.find((c) => c.id === catId)
    setFormData((prev) => ({
      ...prev,
      category: catId,
      categoryName: cat ? cat.name : prev.categoryName
    }))
  }

  // Tezkor jadvalni qo'llash
  const handleApplyPreset = () => {
    const newSched = createStandardSchedule(presetOpen, presetClose, presetWeekendClose)
    setFormData((prev) => ({
      ...prev,
      schedule: newSched
    }))
  }

  // Kunlik jadvalni tahrirlash
  const handleDayScheduleChange = (dayIndex, field, value) => {
    setFormData((prev) => ({
      ...prev,
      schedule: {
        ...prev.schedule,
        [dayIndex]: {
          ...prev.schedule[dayIndex],
          [field]: value
        }
      }
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    const errs = {}
    if (!formData.name.trim()) errs.name = 'Brend nomi kiritilishi shart'
    if (!formData.floor.trim()) errs.floor = 'Qavat kiritilishi shart'

    if (Object.keys(errs).length > 0) {
      setErrors(errs)
      return
    }

    const finalBrand = {
      ...formData,
      logoText: formData.logoText.trim() || formData.name.slice(0, 2).toUpperCase()
    }

    onSave(finalBrand)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-zinc-950/50 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-zinc-200 overflow-hidden my-6 animate-modal">
        
        {/* Modal Header */}
        <div className="p-5 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-zinc-900 text-white flex items-center justify-center shadow-xs">
              <Store className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h3 className="font-bold text-base text-zinc-900">
                {isEditing ? 'Brendni tahrirlash' : 'Yangi brend / do\'kon qo\'shish'}
              </h3>
              <p className="text-xs text-zinc-500 mt-0.5">
                {mall?.name ? `${mall.name} majmuasiga` : 'Savdo majmuasi brendini kiritish'}
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
          
          {/* 1. Brend nomi va kategoriya */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1">
                Brend nomi *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Masalan: LC Waikiki"
                className={`w-full px-3 py-2 text-xs sm:text-sm bg-white border rounded-xl outline-none transition-colors ${
                  errors.name ? 'border-rose-400 focus:border-rose-500' : 'border-zinc-200 focus:border-zinc-400'
                }`}
              />
              {errors.name && <p className="text-[11px] text-rose-500 mt-1">{errors.name}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1">
                Kategoriya *
              </label>
              <select
                value={formData.category}
                onChange={(e) => handleCategoryChange(e.target.value)}
                className="w-full px-3 py-2 text-xs sm:text-sm bg-white border border-zinc-200 rounded-xl outline-none focus:border-zinc-400 transition-colors"
              >
                {CATEGORIES.filter((c) => c.id !== 'all').map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1">
                Qavat *
              </label>
              <input
                type="text"
                value={formData.floor}
                onChange={(e) => setFormData({ ...formData, floor: e.target.value })}
                placeholder="1-qavat yoki Food Court"
                className={`w-full px-3 py-2 text-xs sm:text-sm bg-white border rounded-xl outline-none transition-colors ${
                  errors.floor ? 'border-rose-400 focus:border-rose-500' : 'border-zinc-200 focus:border-zinc-400'
                }`}
              />
              {errors.floor && <p className="text-[11px] text-rose-500 mt-1">{errors.floor}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1">
                Joy kodi / Xona raqami
              </label>
              <input
                type="text"
                value={formData.locationCode}
                onChange={(e) => setFormData({ ...formData, locationCode: e.target.value })}
                placeholder="NV-201 yoki A-105"
                className="w-full px-3 py-2 text-xs sm:text-sm bg-white border border-zinc-200 rounded-xl outline-none focus:border-zinc-400"
              />
            </div>
          </div>

          {/* 2. Logo va Rasm sozlamalari */}
          <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-200/90 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-700 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>Logo va Rasm sozlamalari</span>
            </h4>

            {/* Rasm URL havolasi */}
            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1">
                Rasm / Logotip havolasi (URL link)
              </label>
              <input
                type="url"
                value={formData.logoUrl}
                onChange={(e) => setFormData({ ...formData, logoUrl: e.target.value })}
                placeholder="https://example.com/logo.png yoki SVG havolasi"
                className="w-full px-3 py-2 text-xs sm:text-sm bg-white border border-zinc-200 rounded-xl outline-none focus:border-zinc-400"
              />
              <p className="text-[11px] text-zinc-400 mt-1">
                Agar havola berilsa va u ishlasa, rasm ko'rinadi. Rasm bo'lmasa yoki ishlamasa, quyidagi qisqartma (KFC, DF, W...) va rang chiqadi.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">
                  Qisqartma / Monogram matni (KFC, DF, W, ...)
                </label>
                <input
                  type="text"
                  maxLength={6}
                  value={formData.logoText}
                  onChange={(e) => setFormData({ ...formData, logoText: e.target.value })}
                  placeholder={formData.name ? formData.name.slice(0, 3).toUpperCase() : 'KFC'}
                  className="w-full px-3 py-2 text-xs sm:text-sm bg-white border border-zinc-200 rounded-xl outline-none focus:border-zinc-400 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">
                  Qisqartma fon rangi (Preset)
                </label>
                <select
                  value={formData.logoBg}
                  onChange={(e) => setFormData({ ...formData, logoBg: e.target.value })}
                  className="w-full px-3 py-2 text-xs sm:text-sm bg-white border border-zinc-200 rounded-xl outline-none focus:border-zinc-400"
                >
                  {LOGO_BG_PRESETS.map((p) => (
                    <option key={p.value} value={p.value}>
                      {p.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Logo Live Preview */}
            <div className="flex items-center gap-3 pt-2 border-t border-zinc-200/60">
              <span className="text-xs text-zinc-500 font-medium">Jonli ko'rinish:</span>
              <BrandLogo brand={formData} size="lg" className="shadow-xs" />
              <span className="text-[11px] text-zinc-400">
                {formData.logoUrl
                  ? "Rasm yuklanadi (xatolik bo'lsa qisqartmaga qaytadi)"
                  : "Qisqartma rejimi faol"}
              </span>
            </div>
          </div>

          {/* 3. Chegirma / Aksiya va Aloqa */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1">
                Aksiya / Chegirma
              </label>
              <input
                type="text"
                value={formData.discount}
                onChange={(e) => setFormData({ ...formData, discount: e.target.value })}
                placeholder="Mavsumiy 30% chegirma"
                className="w-full px-3 py-2 text-xs sm:text-sm bg-white border border-zinc-200 rounded-xl outline-none focus:border-zinc-400"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1">
                Telefon raqam
              </label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+998 74 228 10 01"
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
                placeholder="@lcwaikikiuzbekistan"
                className="w-full px-3 py-2 text-xs sm:text-sm bg-white border border-zinc-200 rounded-xl outline-none focus:border-zinc-400"
              />
            </div>
          </div>

          {/* 4. Tavsif */}
          <div>
            <label className="block text-xs font-semibold text-zinc-700 mb-1">
              Do'kon haqida tavsif
            </label>
            <textarea
              rows={2}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Brend haqida qisqacha ma'lumot..."
              className="w-full px-3 py-2 text-xs sm:text-sm bg-white border border-zinc-200 rounded-xl outline-none focus:border-zinc-400"
            />
          </div>

          {/* 5. Ish vaqti sozlamalari (WORKING SCHEDULE) */}
          <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-200/90 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-700 flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-blue-600" />
                <span>Ish vaqti jadvali (Ochiq/Yopiqlik tizimi)</span>
              </h4>

              {/* Jadval rejimi switch */}
              <div className="flex bg-white rounded-lg p-0.5 border border-zinc-200 text-xs">
                <button
                  type="button"
                  onClick={() => setScheduleMode('preset')}
                  className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-colors cursor-pointer ${
                    scheduleMode === 'preset' ? 'bg-zinc-900 text-white' : 'text-zinc-600 hover:text-zinc-900'
                  }`}
                >
                  Tezkor sozlash
                </button>
                <button
                  type="button"
                  onClick={() => setScheduleMode('custom')}
                  className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-colors cursor-pointer ${
                    scheduleMode === 'custom' ? 'bg-zinc-900 text-white' : 'text-zinc-600 hover:text-zinc-900'
                  }`}
                >
                  Kunma-kun
                </button>
              </div>
            </div>

            {/* A) Tezkor sozlash rejimi */}
            {scheduleMode === 'preset' ? (
              <div className="space-y-3 pt-1">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-medium text-zinc-600 mb-1">
                      Ochilish vaqti
                    </label>
                    <input
                      type="time"
                      value={presetOpen}
                      onChange={(e) => setPresetOpen(e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs bg-white border border-zinc-200 rounded-lg outline-none font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-zinc-600 mb-1">
                      Yopilish vaqti (Dush-Pay)
                    </label>
                    <input
                      type="time"
                      value={presetClose}
                      onChange={(e) => setPresetClose(e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs bg-white border border-zinc-200 rounded-lg outline-none font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-zinc-600 mb-1">
                      Dam olish kunlari (Juma-Shanba)
                    </label>
                    <input
                      type="time"
                      value={presetWeekendClose}
                      onChange={(e) => setPresetWeekendClose(e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs bg-white border border-zinc-200 rounded-lg outline-none font-mono"
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleApplyPreset}
                  className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-medium transition-colors cursor-pointer"
                >
                  Ushbu vaqtni barcha kunlarga qo'llash
                </button>
              </div>
            ) : (
              /* B) Kunma-kun to'liq sozlash rejimi */
              <div className="space-y-2 pt-1">
                <div className="divide-y divide-zinc-200/80 border border-zinc-200 rounded-xl overflow-hidden bg-white">
                  {DAY_NAMES_ORDERED.map((day) => {
                    const daySched = formData.schedule[day.index] || { open: '09:00', close: '22:00', isClosed: false }
                    return (
                      <div
                        key={day.index}
                        className="p-2.5 flex items-center justify-between gap-3 text-xs"
                      >
                        <span className="font-medium text-zinc-800 w-24">
                          {day.name}
                        </span>

                        <div className="flex items-center gap-2 flex-1 justify-end">
                          <label className="flex items-center gap-1.5 text-[11px] text-zinc-600 cursor-pointer mr-2">
                            <input
                              type="checkbox"
                              checked={Boolean(daySched.isClosed)}
                              onChange={(e) => handleDayScheduleChange(day.index, 'isClosed', e.target.checked)}
                              className="rounded text-zinc-900 cursor-pointer"
                            />
                            <span>Dam olish</span>
                          </label>

                          {!daySched.isClosed ? (
                            <div className="flex items-center gap-1 font-mono">
                              <input
                                type="time"
                                value={daySched.open}
                                onChange={(e) => handleDayScheduleChange(day.index, 'open', e.target.value)}
                                className="px-2 py-1 text-xs border border-zinc-200 rounded-md outline-none"
                              />
                              <span className="text-zinc-400">-</span>
                              <input
                                type="time"
                                value={daySched.close}
                                onChange={(e) => handleDayScheduleChange(day.index, 'close', e.target.value)}
                                className="px-2 py-1 text-xs border border-zinc-200 rounded-md outline-none"
                              />
                            </div>
                          ) : (
                            <span className="text-[11px] font-semibold text-rose-500">
                              Yopiq (Dam olish kuni)
                            </span>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
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
              <span>{isEditing ? 'O\'zgarishlarni saqlash' : 'Brendni qo\'shish'}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  )
}
