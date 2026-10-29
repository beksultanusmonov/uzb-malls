import React, { useState, useMemo } from 'react'
import {
  Building2,
  Store,
  Plus,
  Search,
  MapPin,
  Clock,
  Edit3,
  Trash2,
  RotateCcw,
  LogOut,
  ArrowLeft,
  CheckCircle2,
  ShieldCheck,
  Filter,
  Save
} from 'lucide-react'
import { REGIONS } from '../../data/regionsData'
import { CATEGORIES } from '../../data/mallsData'
import { getBrandStatus } from '../../utils/workingHours'
import BrandLogo from '../BrandLogo'
import MallModal from './MallModal'
import BrandModal from './BrandModal'

export default function AdminDashboard({
  malls,
  onAddMall,
  onUpdateMall,
  onDeleteMall,
  onAddBrand,
  onUpdateBrand,
  onDeleteBrand,
  onResetMalls,
  onSaveAsDefault,
  onLogout,
  onCloseAdmin,
  currentTime
}) {
  // Faol tab: 'malls' yoki 'brands'
  const [activeTab, setActiveTab] = useState('malls')

  // MALLS bo'limi filtrlari
  const [mallSearch, setMallSearch] = useState('')
  const [mallRegionFilter, setMallRegionFilter] = useState('all')

  // BRANDS bo'limi filtrlari
  const [selectedMallId, setSelectedMallId] = useState(malls[0]?.id || '')
  const [brandSearch, setBrandSearch] = useState('')
  const [brandCategoryFilter, setBrandCategoryFilter] = useState('all')

  // Modallar holati
  const [editingMall, setEditingMall] = useState(null) // null yoki mall obyekti yoki 'new'
  const [editingBrand, setEditingBrand] = useState(null) // null yoki brand obyekti yoki 'new'
  
  // Bildirishnoma (Toast)
  const [toastMessage, setToastMessage] = useState('')

  const showToast = (msg) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(''), 3000)
  }

  // Tanlangan Mall obyekti
  const activeMall = useMemo(() => {
    return malls.find((m) => m.id === selectedMallId) || malls[0]
  }, [malls, selectedMallId])

  // MALLAR filtri
  const filteredMalls = useMemo(() => {
    return malls.filter((m) => {
      if (mallRegionFilter !== 'all' && m.regionId !== mallRegionFilter) {
        return false
      }
      if (mallSearch.trim()) {
        const q = mallSearch.toLowerCase().trim()
        const matchesName = m.name.toLowerCase().includes(q)
        const matchesCity = (m.city || '').toLowerCase().includes(q)
        const matchesAddress = m.address.toLowerCase().includes(q)
        if (!matchesName && !matchesCity && !matchesAddress) return false
      }
      return true
    })
  }, [malls, mallRegionFilter, mallSearch])

  // BRENDLAR filtri
  const filteredBrands = useMemo(() => {
    if (!activeMall || !activeMall.brands) return []
    return activeMall.brands.filter((b) => {
      if (brandCategoryFilter !== 'all' && b.category !== brandCategoryFilter) {
        return false
      }
      if (brandSearch.trim()) {
        const q = brandSearch.toLowerCase().trim()
        const matchesName = b.name.toLowerCase().includes(q)
        const matchesCategory = (b.categoryName || '').toLowerCase().includes(q)
        const matchesFloor = (b.floor || '').toLowerCase().includes(q)
        if (!matchesName && !matchesCategory && !matchesFloor) return false
      }
      return true
    })
  }, [activeMall, brandCategoryFilter, brandSearch])

  // Jami brendlar soni
  const totalBrandsCount = malls.reduce((acc, m) => acc + (m.brands?.length || 0), 0)

  // MALL saqlanganda
  const handleSaveMall = (mallData) => {
    if (editingMall === 'new') {
      onAddMall(mallData)
      showToast('Yangi savdo majmuasi muvaffaqiyatli qo\'shildi!')
    } else {
      onUpdateMall(mallData.id, mallData)
      showToast('Savdo majmuasi ma\'lumotlari yangilandi!')
    }
    setEditingMall(null)
  }

  // MALL o'chirilganda
  const handleDeleteMall = (mallId, mallName) => {
    if (window.confirm(`Haqiqatan ham "${mallName}" savdo majmuasini va uning barcha brendlarini o'chirmoqchimisiz?`)) {
      onDeleteMall(mallId)
      showToast(`"${mallName}" o'chirildi!`)
      if (selectedMallId === mallId) {
        const remaining = malls.filter((m) => m.id !== mallId)
        if (remaining.length > 0) setSelectedMallId(remaining[0].id)
      }
    }
  }

  // BRAND saqlanganda
  const handleSaveBrand = (brandData) => {
    if (!activeMall) return
    if (editingBrand === 'new') {
      onAddBrand(activeMall.id, brandData)
      showToast('Yangi brend muvaffaqiyatli qo\'shildi!')
    } else {
      onUpdateBrand(activeMall.id, brandData.id, brandData)
      showToast('Brend ma\'lumotlari yangilandi!')
    }
    setEditingBrand(null)
  }

  // BRAND o'chirilganda
  const handleDeleteBrand = (brandId, brandName) => {
    if (!activeMall) return
    if (window.confirm(`Haqiqatan ham "${brandName}" brendini o'chirmoqchimisiz?`)) {
      onDeleteBrand(activeMall.id, brandId)
      showToast(`"${brandName}" brendi o'chirildi!`)
    }
  }

  // Hozirgi holatni standart (default) baza qilib saqlash
  const handleSaveAsDefault = async () => {
    if (onSaveAsDefault) {
      await onSaveAsDefault()
    }
    showToast("Hozirgi barcha o'zgarishlar asosiy standart baza (mallsData.js) ga saqlandi!")
  }

  // Asl holatga qaytarish (Standart holatga)
  const handleReset = () => {
    if (window.confirm("Barcha ma'lumotlar oxirgi saqlangan standart (default) holatiga qaytariladi. Davom etasizmi?")) {
      onResetMalls()
      showToast("Barcha ma'lumotlar standart holatiga qaytarildi!")
    }
  }

  return (
    <div className="min-h-screen bg-zinc-100 flex flex-col font-sans text-zinc-900">
      
      {/* 1. Admin Yuqori Header */}
      <header className="sticky top-0 z-40 bg-zinc-900 text-white border-b border-zinc-800 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          
          {/* Logo va Admin Portal nishoni */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-sm shadow-xs">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-base tracking-tight text-white">
                  MALLs Admin Portali
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  Live Control
                </span>
              </div>
              <p className="text-[11px] text-zinc-400 hidden sm:block">
                Savdo majmualari, lokatsiyalar va brendlarni to'liq boshqarish
              </p>
            </div>
          </div>

          {/* Harakatlar (Default saqlash, Bosh sahifa, Reset, Chiqish) */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={handleSaveAsDefault}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
              title="Hozirgi barcha o'zgartirilgan ma'lumotlarni doimiy standart (default) baza qilib saqlash"
            >
              <Save className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Default qilib saqlash</span>
            </button>

            <button
              onClick={onCloseAdmin}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold border border-zinc-700 transition-colors cursor-pointer"
              title="Bosh sahifaga qaytish"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline">Bosh sahifa (Xarita)</span>
            </button>

            <button
              onClick={handleReset}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-medium border border-zinc-700 transition-colors cursor-pointer"
              title="Standart ma'lumotlarga qaytarish"
            >
              <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden md:inline">Qayta tiklash</span>
            </button>

            <button
              onClick={onLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 text-xs font-semibold border border-rose-800/50 transition-colors cursor-pointer"
              title="Admin paneldan chiqish"
            >
              <LogOut className="w-3.5 h-3.5 text-rose-400" />
              <span className="hidden sm:inline">Chiqish</span>
            </button>
          </div>

        </div>
      </header>

      {/* Toast Xabarnoma */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 flex items-center gap-2 px-4 py-3 bg-zinc-900 text-white rounded-xl shadow-2xl border border-emerald-500/40 text-xs font-semibold animate-modal">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 2. Asosiy Maydon */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 w-full flex-1 space-y-6">
        
        {/* Yuqori Metrikalar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          <div className="p-4 rounded-2xl bg-white border border-zinc-200/90 shadow-xs flex flex-col justify-between">
            <span className="text-xs font-medium text-zinc-500">Jami Mallar</span>
            <div className="flex items-baseline justify-between mt-2">
              <span className="text-2xl font-bold text-zinc-900 font-mono">{malls.length}</span>
              <span className="text-xs text-emerald-600 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                Aktiv
              </span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-zinc-200/90 shadow-xs flex flex-col justify-between">
            <span className="text-xs font-medium text-zinc-500">Jami Brendlar</span>
            <div className="flex items-baseline justify-between mt-2">
              <span className="text-2xl font-bold text-zinc-900 font-mono">{totalBrandsCount}</span>
              <span className="text-xs text-blue-600 font-semibold bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                Do'konlar
              </span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-zinc-200/90 shadow-xs flex flex-col justify-between">
            <span className="text-xs font-medium text-zinc-500">Qamrov (Hududlar)</span>
            <div className="flex items-baseline justify-between mt-2">
              <span className="text-2xl font-bold text-zinc-900 font-mono">
                {new Set(malls.map((m) => m.regionId)).size}
              </span>
              <span className="text-xs text-amber-600 font-semibold bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                Viloyatlar
              </span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-zinc-200/90 shadow-xs flex flex-col justify-between">
            <span className="text-xs font-medium text-zinc-500">O'rtacha Reyting</span>
            <div className="flex items-baseline justify-between mt-2">
              <span className="text-2xl font-bold text-zinc-900 font-mono">
                {(malls.reduce((acc, m) => acc + (m.rating || 4.5), 0) / (malls.length || 1)).toFixed(1)}
              </span>
              <span className="text-xs text-amber-600 font-semibold flex items-center gap-0.5">
                ★ Baho
              </span>
            </div>
          </div>
        </div>

        {/* Boshqaruv Tablari: Mallar yoki Brendlar */}
        <div className="flex items-center justify-between border-b border-zinc-200 pb-3 gap-4">
          <div className="flex items-center bg-zinc-200/80 p-1 rounded-xl text-xs font-bold">
            <button
              onClick={() => setActiveTab('malls')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all cursor-pointer ${
                activeTab === 'malls'
                  ? 'bg-white text-zinc-900 shadow-xs'
                  : 'text-zinc-600 hover:text-zinc-900'
              }`}
            >
              <Building2 className="w-4 h-4 text-emerald-600" />
              <span>Savdo Majmualari ({malls.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('brands')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all cursor-pointer ${
                activeTab === 'brands'
                  ? 'bg-white text-zinc-900 shadow-xs'
                  : 'text-zinc-600 hover:text-zinc-900'
              }`}
            >
              <Store className="w-4 h-4 text-blue-600" />
              <span>Brendlar va Do'konlar ({totalBrandsCount})</span>
            </button>
          </div>

          {/* Yangi qo'shish tugmasi */}
          {activeTab === 'malls' ? (
            <button
              onClick={() => setEditingMall('new')}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4 text-emerald-400" />
              <span>Yangi MALL qo'shish</span>
            </button>
          ) : (
            <button
              onClick={() => setEditingBrand('new')}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4 text-emerald-400" />
              <span>{activeMall?.name || 'MALL'}ga yangi brend qo'shish</span>
            </button>
          )}
        </div>

        {/* ======================================================== */}
        {/* TAB 1: SAVDO MAJMUALARI (MALLS) RO'YXATI VA BOSHQARUVI */}
        {/* ======================================================== */}
        {activeTab === 'malls' && (
          <div className="space-y-4">
            
            {/* Filter va qidiruv paneli */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 bg-white rounded-2xl border border-zinc-200/90 shadow-xs">
              
              {/* Qidiruv */}
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                <input
                  type="text"
                  value={mallSearch}
                  onChange={(e) => setMallSearch(e.target.value)}
                  placeholder="Majmua nomi, manzil yoki shahar bo'yicha qidirish..."
                  className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-zinc-50 border border-zinc-200 rounded-xl outline-none focus:bg-white focus:border-zinc-400 transition-colors"
                />
              </div>

              {/* Viloyat filtri */}
              <div className="flex items-center gap-2 shrink-0">
                <Filter className="w-4 h-4 text-zinc-400" />
                <select
                  value={mallRegionFilter}
                  onChange={(e) => setMallRegionFilter(e.target.value)}
                  className="px-3 py-2 text-xs font-semibold bg-zinc-50 border border-zinc-200 rounded-xl outline-none focus:bg-white focus:border-zinc-400 cursor-pointer"
                >
                  <option value="all">Barcha viloyatlar</option>
                  {REGIONS.filter((r) => r.id !== 'all').map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name}
                    </option>
                  ))}
                </select>
              </div>

            </div>

            {/* MALL Kartochkalari Jadvali/Griddagi ko'rinishi */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredMalls.map((m) => {
                const brandsCount = m.brands?.length || 0
                return (
                  <div
                    key={m.id}
                    className="p-4 rounded-2xl bg-white border border-zinc-200/90 shadow-xs hover:border-zinc-300 transition-all flex flex-col justify-between gap-3 group"
                  >
                    <div>
                      {/* Rasm va Reyting */}
                      <div className="relative h-36 rounded-xl overflow-hidden mb-3 bg-zinc-100">
                        <img
                          src={m.image}
                          alt={m.name}
                          className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-200"
                        />
                        <div className="absolute top-2 left-2 flex items-center gap-1 px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-xs text-white text-[11px] font-semibold">
                          <MapPin className="w-3 h-3 text-emerald-400" />
                          <span>{m.regionName}</span>
                        </div>
                        <div className="absolute top-2 right-2 flex items-center gap-1 px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-xs text-amber-400 text-xs font-bold">
                          <span>★ {m.rating}</span>
                        </div>
                      </div>

                      {/* Mall nomi va kategoriyasi */}
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="font-bold text-sm text-zinc-900 group-hover:text-zinc-700">
                            {m.name}
                          </h3>
                          <p className="text-xs text-zinc-500 mt-0.5 flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-zinc-400 shrink-0" />
                            <span className="truncate">{m.address}</span>
                          </p>
                        </div>
                        <span className="px-2 py-0.5 rounded-md bg-zinc-100 text-zinc-700 border border-zinc-200 text-xs font-bold shrink-0">
                          {brandsCount} brend
                        </span>
                      </div>

                      {/* GPS Koordinatalar va Ish vaqti */}
                      <div className="mt-3 pt-2.5 border-t border-zinc-100 flex items-center justify-between text-xs text-zinc-500">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-zinc-400" />
                          <span>{m.generalHours}</span>
                        </span>
                        <span className="font-mono text-[11px] text-zinc-600 bg-zinc-50 px-2 py-0.5 rounded border border-zinc-200">
                          {m.coords ? `${m.coords[0].toFixed(3)}, ${m.coords[1].toFixed(3)}` : 'GPS yo\'q'}
                        </span>
                      </div>
                    </div>

                    {/* Harakatlar (Brendlarni boshqarish, Tahrirlash, O'chirish) */}
                    <div className="pt-2 border-t border-zinc-100 flex items-center gap-2">
                      <button
                        onClick={() => {
                          setSelectedMallId(m.id)
                          setActiveTab('brands')
                        }}
                        className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-800 text-xs font-semibold transition-colors cursor-pointer"
                        title="Brendlarni ko'rish va boshqarish"
                      >
                        <Store className="w-3.5 h-3.5 text-blue-600" />
                        <span>Brendlar ({brandsCount})</span>
                      </button>

                      <button
                        onClick={() => setEditingMall(m)}
                        className="p-2 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-700 hover:text-zinc-900 transition-colors cursor-pointer"
                        title="Tahrirlash"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => handleDeleteMall(m.id, m.name)}
                        className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 hover:text-rose-700 border border-rose-200/60 transition-colors cursor-pointer"
                        title="O'chirish"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                  </div>
                )
              })}
            </div>

            {filteredMalls.length === 0 && (
              <div className="p-12 text-center bg-white rounded-2xl border border-dashed border-zinc-300">
                <Building2 className="w-10 h-10 mx-auto text-zinc-400 mb-2" />
                <h4 className="font-bold text-sm text-zinc-800">
                  Mos savdo majmuasi topilmadi
                </h4>
                <p className="text-xs text-zinc-500 mt-1">
                  Qidiruv so'zini o'zgartiring yoki yangi majmua qo'shing
                </p>
                <button
                  onClick={() => setEditingMall('new')}
                  className="mt-4 px-4 py-2 rounded-xl bg-zinc-900 text-white text-xs font-semibold cursor-pointer"
                >
                  Yangi MALL qo'shish
                </button>
              </div>
            )}

          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 2: BRENDLAR VA DO'KONLARNI BOSHQARISH */}
        {/* ======================================================== */}
        {activeTab === 'brands' && (
          <div className="space-y-5">
            
            {/* Mall tanlash va Brend qo'shish boshqaruv paneli */}
            <div className="p-4 bg-white rounded-2xl border border-zinc-200/90 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-zinc-700 shrink-0">
                    Majmuani tanlang:
                  </span>
                  <select
                    value={selectedMallId}
                    onChange={(e) => setSelectedMallId(e.target.value)}
                    className="px-3 py-2 text-xs sm:text-sm font-semibold bg-zinc-50 border border-zinc-200 rounded-xl outline-none focus:bg-white focus:border-zinc-400 cursor-pointer max-w-xs"
                  >
                    {malls.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name} ({m.regionName})
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  onClick={() => setEditingBrand('new')}
                  className="flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer shrink-0"
                >
                  <Plus className="w-4 h-4 text-emerald-400" />
                  <span>+ Yangi Brend qo'shish</span>
                </button>
              </div>

              {/* Tanlangan Mall banneri */}
              {activeMall && (
                <div className="p-3.5 rounded-xl bg-zinc-50 border border-zinc-200/80 flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-3">
                    <img
                      src={activeMall.image}
                      alt={activeMall.name}
                      className="w-12 h-12 rounded-lg object-cover border border-zinc-200 shrink-0"
                    />
                    <div>
                      <h4 className="font-bold text-sm text-zinc-900">{activeMall.name}</h4>
                      <p className="text-zinc-500 mt-0.5">{activeMall.address}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="px-3 py-1 rounded-lg bg-white border border-zinc-200 font-bold text-zinc-800">
                      Jami {activeMall.brands?.length || 0} ta brend
                    </span>
                  </div>
                </div>
              )}

              {/* Qidiruv va Kategoriya filtri */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-1">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                  <input
                    type="text"
                    value={brandSearch}
                    onChange={(e) => setBrandSearch(e.target.value)}
                    placeholder={`${activeMall?.name || 'MALL'} brendlarini qidirish...`}
                    className="w-full pl-9 pr-3 py-2 text-xs bg-zinc-50 border border-zinc-200 rounded-xl outline-none focus:bg-white focus:border-zinc-400"
                  />
                </div>

                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                  {CATEGORIES.map((cat) => {
                    const isActive = brandCategoryFilter === cat.id
                    return (
                      <button
                        key={cat.id}
                        onClick={() => setBrandCategoryFilter(cat.id)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                          isActive
                            ? 'bg-zinc-900 text-white'
                            : 'bg-zinc-50 hover:bg-zinc-100 text-zinc-600 border border-zinc-200'
                        }`}
                      >
                        {cat.name}
                      </button>
                    )
                  })}
                </div>
              </div>

            </div>

            {/* Brendlar Ro'yxati (Grid) */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {filteredBrands.map((brand) => {
                const status = getBrandStatus(brand.schedule, currentTime)

                return (
                  <div
                    key={brand.id}
                    className="p-4 rounded-2xl bg-white border border-zinc-200/90 shadow-xs hover:border-zinc-300 transition-all flex flex-col justify-between gap-3"
                  >
                    <div>
                      {/* Logo, Nom va Holat */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <BrandLogo brand={brand} size="lg" className="shadow-xs" />
                          <div>
                            <h4 className="font-bold text-sm text-zinc-900">{brand.name}</h4>
                            <p className="text-xs text-zinc-500 mt-0.5">{brand.categoryName}</p>
                          </div>
                        </div>

                        {/* Status (Ochiq/Yopiq) */}
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                            status.isOpen
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                              : 'bg-zinc-100 text-zinc-600 border-zinc-200'
                          }`}
                        >
                          {status.isOpen ? 'Hozir Ochiq' : 'Hozir Yopiq'}
                        </span>
                      </div>

                      {/* Joylashuv va Chegirma */}
                      <div className="mt-3 space-y-1.5 text-xs text-zinc-600">
                        <div className="flex items-center justify-between">
                          <span className="text-zinc-400">Qavat / Joy:</span>
                          <span className="font-semibold text-zinc-800">
                            {brand.floor} {brand.locationCode ? `(${brand.locationCode})` : ''}
                          </span>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-zinc-400">Bugungi vaqt:</span>
                          <span className="font-mono text-zinc-700">
                            {status.todayHours}
                          </span>
                        </div>

                        {brand.discount && (
                          <div className="pt-1">
                            <span className="inline-block px-2 py-0.5 rounded bg-amber-50 text-amber-900 border border-amber-200 text-[11px] font-semibold">
                              {brand.discount}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Harakatlar */}
                    <div className="pt-2 border-t border-zinc-100 flex items-center justify-between gap-2">
                      <span className="text-[11px] font-mono text-zinc-400 truncate">
                        {brand.phone || brand.instagram || 'Aloqa yo\'q'}
                      </span>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => setEditingBrand(brand)}
                          className="p-1.5 rounded-lg bg-zinc-100 hover:bg-zinc-200 text-zinc-700 hover:text-zinc-900 transition-colors cursor-pointer"
                          title="Tahrirlash"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => handleDeleteBrand(brand.id, brand.name)}
                          className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 hover:text-rose-700 border border-rose-200/60 transition-colors cursor-pointer"
                          title="O'chirish"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                  </div>
                )
              })}
            </div>

            {filteredBrands.length === 0 && (
              <div className="p-10 text-center bg-white rounded-2xl border border-dashed border-zinc-300">
                <Store className="w-10 h-10 mx-auto text-zinc-400 mb-2" />
                <h4 className="font-bold text-sm text-zinc-800">
                  Ushbu majmuada brendlar topilmadi
                </h4>
                <p className="text-xs text-zinc-500 mt-1">
                  Yangi brend qo'shish orqali do'konlar ro'yxatini to'ldiring
                </p>
                <button
                  onClick={() => setEditingBrand('new')}
                  className="mt-4 px-4 py-2 rounded-xl bg-zinc-900 text-white text-xs font-semibold cursor-pointer"
                >
                  + Yangi Brend qo'shish
                </button>
              </div>
            )}

          </div>
        )}

      </main>

      {/* 3. Savdo Majmuasi Qo'shish / Tahrirlash Modali */}
      {editingMall && (
        <MallModal
          mall={editingMall === 'new' ? null : editingMall}
          onSave={handleSaveMall}
          onClose={() => setEditingMall(null)}
        />
      )}

      {/* 4. Brend Qo'shish / Tahrirlash Modali */}
      {editingBrand && activeMall && (
        <BrandModal
          brand={editingBrand === 'new' ? null : editingBrand}
          mall={activeMall}
          onSave={handleSaveBrand}
          onClose={() => setEditingBrand(null)}
        />
      )}

    </div>
  )
}
