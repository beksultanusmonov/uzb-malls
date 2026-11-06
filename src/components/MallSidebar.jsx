import React, { useState, useMemo } from 'react'
import {
  ArrowLeft,
  Search,
  MapPin,
  Clock,
  Star,
  Store,
  Building2,
  X,
  Navigation,
  ExternalLink,
  Check,
  Copy,
  PanelLeftClose
} from 'lucide-react'
import { CATEGORIES } from '../data/mallsData'
import RegionSelector from './RegionSelector'
import BrandCard from './BrandCard'
import BrandLogo from './BrandLogo'
import { getBrandStatus } from '../utils/workingHours'

export default function MallSidebar({
  malls,
  selectedMall,
  onSelectMall,
  onBackToMalls,
  onSelectBrand,
  currentTime,
  globalSearchTerm,
  selectedRegionId,
  onSelectRegion,
  onToggleSidebar
}) {
  const [mallSearchQuery, setMallSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedFloor, setSelectedFloor] = useState('all')
  const [onlyOpenNow, setOnlyOpenNow] = useState(false)
  const [copiedPlusCode, setCopiedPlusCode] = useState(false)

  const handleCopyPlusCode = (code) => {
    if (!code) return
    navigator.clipboard.writeText(code)
    setCopiedPlusCode(true)
    setTimeout(() => setCopiedPlusCode(false), 2000)
  }

  // Ko'rinish rejimi: 'malls' (savdo majmualari) yoki 'brands' (brendlar katalogi)
  const [viewTab, setViewTab] = useState('malls')

  // Barcha brendlarni nomlari bo'yicha guruhlash (har bir brend qaysi MALLlarda borligini bog'lash)
  const groupedBrands = useMemo(() => {
    const q = (globalSearchTerm || '').toLowerCase().trim()
    const map = new Map()

    malls.forEach((m) => {
      // Agar viloyat tanlangan bo'lsa va qidiruv bo'lmasa, viloyatga qaraymiz
      if (!q && selectedRegionId !== 'all' && m.regionId !== selectedRegionId) {
        return
      }

      (m.brands || []).forEach((b) => {
        // Asosiy nom bo'yicha guruhlash (masalan "LC Waikiki", "KFC", "Terra Pro")
        const baseKey = b.name
          .replace(/(Flagship|City Mall|Mall|Samarqand|Namangan|Buxoro|Andijon|Farg'ona|Toshkent|Compass|Riviera|Next|Navro'z|O'zbegim)/gi, '')
          .trim() || b.name

        // Qidiruv filtri
        if (q) {
          const matchesName = b.name.toLowerCase().includes(q)
          const matchesCat = (b.categoryName || '').toLowerCase().includes(q)
          const matchesDesc = (b.description || '').toLowerCase().includes(q)
          const matchesDiscount = (b.discount || '').toLowerCase().includes(q)
          const matchesMall = m.name.toLowerCase().includes(q) || (m.city || '').toLowerCase().includes(q)
          if (!matchesName && !matchesCat && !matchesDesc && !matchesDiscount && !matchesMall) {
            return
          }
        }

        if (!map.has(baseKey)) {
          map.set(baseKey, {
            name: baseKey,
            category: b.category,
            categoryName: b.categoryName,
            logoText: b.logoText,
            logoBg: b.logoBg,
            logoUrl: b.logoUrl,
            description: b.description,
            discount: b.discount,
            malls: []
          })
        }

        const group = map.get(baseKey)
        if (!group.malls.some((item) => item.mall.id === m.id)) {
          group.malls.push({
            mall: m,
            brand: b,
            status: getBrandStatus(b.schedule, currentTime)
          })
        }
      })
    })

    return Array.from(map.values()).sort((a, b) => b.malls.length - a.malls.length)
  }, [malls, selectedRegionId, globalSearchTerm, currentTime])

  // 1. Agar birorta mall tanlanmagan bo'lsa (MALLS LIST)
  const filteredMalls = useMemo(() => {
    const q = (globalSearchTerm || '').toLowerCase().trim()

    return malls.filter((m) => {
      // Qidiruv so'zi bo'lmaganda: faqat tanlangan viloyatga mos mallar
      if (!q) {
        if (selectedRegionId !== 'all' && m.regionId !== selectedRegionId) {
          return false
        }
        return true
      }

      // Qidiruv so'zi bo'lganda: nomi, manzili, shahri, viloyati yoki brendlari bo'yicha
      const matchesName = m.name.toLowerCase().includes(q)
      const matchesAddress = (m.address || '').toLowerCase().includes(q)
      const matchesCity = (m.city || '').toLowerCase().includes(q)
      const matchesRegion = (m.regionName || '').toLowerCase().includes(q)
      const matchesBrand = (m.brands || []).some(
        (b) =>
          b.name.toLowerCase().includes(q) ||
          (b.categoryName || '').toLowerCase().includes(q) ||
          (b.description || '').toLowerCase().includes(q) ||
          (b.discount || '').toLowerCase().includes(q) ||
          (b.floor || '').toLowerCase().includes(q)
      )

      if (!matchesName && !matchesAddress && !matchesCity && !matchesRegion && !matchesBrand) {
        return false
      }

      // Agar qidiruv bor bo'lsa, mos keladigan barcha mallarni ko'rsatamiz
      // Lekin foydalanuvchi viloyat filtrida bo'lsa va bu mall boshqa viloyatda bo'lsa ham qidiruvda ko'rsatiladi
      return true
    })
  }, [malls, selectedRegionId, globalSearchTerm])

  // 2. Tanlangan Mall ichidagi brendlarni filtrlash
  const filteredBrands = useMemo(() => {
    if (!selectedMall) return []

    return (selectedMall.brands || []).filter((brand) => {
      // Qidiruv
      const q = (mallSearchQuery || globalSearchTerm).toLowerCase().trim()
      if (q) {
        const matchesName = brand.name.toLowerCase().includes(q)
        const matchesCategory = (brand.categoryName || '').toLowerCase().includes(q)
        const matchesLocation = (brand.floor || '').toLowerCase().includes(q) || (brand.locationCode || '').toLowerCase().includes(q)
        const matchesDesc = (brand.description || '').toLowerCase().includes(q)
        const matchesDiscount = (brand.discount || '').toLowerCase().includes(q)
        if (!matchesName && !matchesCategory && !matchesLocation && !matchesDesc && !matchesDiscount) return false
      }

      // Kategoriya
      if (selectedCategory !== 'all' && brand.category !== selectedCategory) {
        return false
      }

      // Qavat
      if (selectedFloor !== 'all' && brand.floor !== selectedFloor) {
        return false
      }

      // Faqat hozir ochiqlar
      if (onlyOpenNow) {
        const status = getBrandStatus(brand.schedule, currentTime)
        if (!status.isOpen) return false
      }

      return true
    })
  }, [selectedMall, mallSearchQuery, globalSearchTerm, selectedCategory, selectedFloor, onlyOpenNow, currentTime])

  // Tanlangan malldagi ochiq brendlar soni
  const openBrandsCount = useMemo(() => {
    if (!selectedMall) return 0
    return selectedMall.brands.filter((b) => getBrandStatus(b.schedule, currentTime).isOpen).length
  }, [selectedMall, currentTime])

  return (
    <aside className="w-full lg:w-[460px] xl:w-[480px] bg-white border-r border-zinc-200 flex flex-col h-full z-20 shadow-xs overflow-hidden">
      
      {/* A) BARCHA MALLAR RO'YXATI */}
      {!selectedMall ? (
        <div className="flex flex-col h-full">
          {/* Header & Viloyatlar paneli */}
          <div className="p-4 border-b border-zinc-200 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-base font-bold text-zinc-900">
                  Savdo majmualari
                </h1>
                <p className="text-xs text-zinc-500 mt-0.5">
                  Viloyatni tanlang yoki qidiruvdan foydalaning
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-700 border border-zinc-200">
                  {filteredMalls.length} ta majmua
                </span>
                {onToggleSidebar && (
                  <button
                    onClick={onToggleSidebar}
                    className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-800 hover:bg-zinc-100 transition-colors cursor-pointer border border-zinc-200"
                    title="Yon panelni yopish (Xaritani to'liq ekranga yoyish)"
                  >
                    <PanelLeftClose className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Viloyatlar tanlagich (Andijon, Toshkent, Samarqand...) */}
            <RegionSelector
              selectedRegionId={selectedRegionId}
              onSelectRegion={onSelectRegion}
              malls={malls}
            />

            {/* Ko'rinish rejimi tanlagich: Savdo Majmualari vs Brendlar Katalogi */}
            <div className="flex bg-zinc-100 p-1 rounded-xl gap-1">
              <button
                onClick={() => setViewTab('malls')}
                className={`flex-1 py-1.5 px-2.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  viewTab === 'malls'
                    ? 'bg-white text-zinc-900 shadow-2xs'
                    : 'text-zinc-500 hover:text-zinc-900'
                }`}
              >
                <Building2 className="w-3.5 h-3.5" />
                <span>Majmualar ({filteredMalls.length})</span>
              </button>

              <button
                onClick={() => setViewTab('brands')}
                className={`flex-1 py-1.5 px-2.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  viewTab === 'brands'
                    ? 'bg-white text-zinc-900 shadow-2xs'
                    : 'text-zinc-500 hover:text-zinc-900'
                }`}
              >
                <Store className="w-3.5 h-3.5" />
                <span>Brendlar ({groupedBrands.length})</span>
              </button>
            </div>
          </div>

          {/* Mallar yoki Brendlar Ro'yxati */}
          <div className="flex-1 overflow-y-auto p-3.5 space-y-2.5">
            {globalSearchTerm && (
              <div className="p-2.5 rounded-xl bg-blue-50/80 border border-blue-200/80 flex items-center justify-between text-xs text-blue-900">
                <span className="font-medium">
                  "{globalSearchTerm}" bo'yicha: <strong className="font-bold">{viewTab === 'malls' ? `${filteredMalls.length} ta majmua` : `${groupedBrands.length} ta brend`}</strong> topildi
                </span>
                {selectedRegionId !== 'all' && (
                  <button
                    onClick={() => onSelectRegion('all')}
                    className="text-[11px] font-semibold text-blue-700 hover:text-blue-900 underline cursor-pointer"
                  >
                    Barcha viloyatlar
                  </button>
                )}
              </div>
            )}

            {viewTab === 'malls' ? (
              filteredMalls.length > 0 ? (
                filteredMalls.map((mall) => {
                  const brandsCount = mall.brands.length
                  const openCount = mall.brands.filter((b) => getBrandStatus(b.schedule, currentTime).isOpen).length

                  // Qidiruv so'ziga mos kelgan brendlar
                  const q = (globalSearchTerm || '').toLowerCase().trim()
                  const matchedBrands = q
                    ? (mall.brands || []).filter(
                        (b) =>
                          b.name.toLowerCase().includes(q) ||
                          (b.categoryName || '').toLowerCase().includes(q) ||
                          (b.description || '').toLowerCase().includes(q) ||
                          (b.discount || '').toLowerCase().includes(q) ||
                          (b.floor || '').toLowerCase().includes(q)
                      )
                    : []

                  return (
                    <div
                      key={mall.id}
                      onClick={() => onSelectMall(mall)}
                      className="group p-3 rounded-xl border border-zinc-200/90 hover:border-zinc-300 hover:shadow-xs transition-all duration-150 cursor-pointer flex flex-col bg-white"
                    >
                      <div className="flex gap-3.5 items-center w-full">
                        {/* Photo */}
                        <div className="relative w-20 h-20 rounded-lg overflow-hidden shrink-0 bg-zinc-100">
                          <img
                            src={mall.image}
                            alt={mall.name}
                            className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-200"
                          />
                          <div className="absolute bottom-1 left-1 flex items-center gap-0.5 text-[10px] font-bold text-white bg-black/60 px-1.5 py-0.2 rounded">
                            <Star className="w-2.5 h-2.5 text-amber-400 fill-amber-400" />
                            <span>{mall.rating}</span>
                          </div>
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1">
                            <h3 className="font-semibold text-sm text-zinc-900 group-hover:text-zinc-700 truncate">
                              {mall.name}
                            </h3>
                            <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-zinc-100 text-zinc-600 border border-zinc-200 shrink-0">
                              {mall.city || mall.regionName}
                            </span>
                          </div>

                          <div className="flex items-center gap-1 text-xs text-zinc-500 mt-0.5 truncate">
                            <MapPin className="w-3 h-3 text-zinc-400 shrink-0" />
                            <span className="truncate">{mall.address}</span>
                          </div>

                          <div className="flex items-center gap-1.5 text-xs text-zinc-500 mt-1">
                            <Clock className="w-3 h-3 text-zinc-400 shrink-0" />
                            <span>{mall.generalHours}</span>
                          </div>

                          <div className="flex items-center gap-2 mt-2 text-xs">
                            <span className="text-zinc-600 font-medium">
                              {brandsCount} ta brend
                            </span>
                            <span className="text-zinc-300">•</span>
                            <span className="text-emerald-700 font-medium flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                              {openCount} tasi hozir ochiq
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Qidiruv natijasi sifatida topilgan brendlar (agar bor bo'lsa) */}
                      {matchedBrands.length > 0 && (
                        <div className="mt-2.5 pt-2 border-t border-zinc-100 flex flex-wrap gap-1.5 items-center">
                          <span className="text-[10px] font-semibold text-zinc-400">Topildi:</span>
                          {matchedBrands.slice(0, 3).map((brand) => (
                            <span
                              key={brand.id}
                              onClick={(e) => {
                                e.stopPropagation()
                                onSelectMall(mall)
                                onSelectBrand(brand, mall)
                              }}
                              className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-md bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 transition-colors cursor-pointer"
                              title="Brend tafsilotlarini ko'rish"
                            >
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                              {brand.name}
                              <span className="text-zinc-500 font-normal text-[10px]">({brand.floor})</span>
                            </span>
                          ))}
                          {matchedBrands.length > 3 && (
                            <span className="text-[10px] font-medium text-zinc-500 bg-zinc-100 px-1.5 py-0.5 rounded">
                              +{matchedBrands.length - 3} ta
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  )
                })
              ) : (
                <div className="p-8 text-center bg-zinc-50 rounded-xl border border-dashed border-zinc-200">
                  <Store className="w-8 h-8 mx-auto text-zinc-400 mb-2" />
                  <h4 className="font-semibold text-sm text-zinc-800">
                    Ushbu hududda savdo majmuasi topilmadi
                  </h4>
                  <p className="text-xs text-zinc-500 mt-1">
                    Boshqa viloyatni tanlab ko'ring yoki qidiruv so'zini tozalang.
                  </p>
                  <button
                    onClick={() => onSelectRegion('all')}
                    className="mt-3 px-3 py-1.5 rounded-lg bg-zinc-900 text-white text-xs font-medium cursor-pointer"
                  >
                    Barcha viloyatlarni ko'rish
                  </button>
                </div>
              )
            ) : (
              /* BRENDLAR BO'YICHA RO'YXAT (Barcha MALLlarga bog'langan holda) */
              groupedBrands.length > 0 ? (
                groupedBrands.map((group) => (
                  <div
                    key={group.name}
                    className="p-3.5 rounded-xl border border-zinc-200/90 bg-white hover:border-zinc-300 hover:shadow-xs transition-all space-y-2.5"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <BrandLogo brand={group} size="sm" />
                        <div className="min-w-0">
                          <h4 className="font-bold text-sm text-zinc-900 truncate">{group.name}</h4>
                          <span className="text-[11px] text-zinc-500">{group.categoryName}</span>
                        </div>
                      </div>
                      <span className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200 shrink-0">
                        {group.malls.length} ta MALLda
                      </span>
                    </div>

                    {/* Ushbu brend mavjud bo'lgan MALLlar ro'yxati (Bog'liqlik) */}
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block mb-1.5">
                        Mavjud Savdo Majmualari (O'tish uchun bosing):
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {group.malls.map((item) => (
                          <button
                            key={item.mall.id}
                            onClick={() => {
                              onSelectMall(item.mall)
                              onSelectBrand(item.brand, item.mall)
                            }}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-zinc-50 hover:bg-blue-50 text-zinc-700 hover:text-blue-800 border border-zinc-200 hover:border-blue-300 text-xs font-medium transition-colors cursor-pointer group"
                            title={`${item.mall.name} (${item.brand.floor})`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${item.status.isOpen ? 'bg-emerald-500' : 'bg-zinc-300'}`} />
                            <span className="font-semibold group-hover:text-blue-700">{item.mall.name}</span>
                            <span className="text-[10px] text-zinc-400 font-normal">({item.mall.city} • {item.brand.floor})</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center bg-zinc-50 rounded-xl border border-dashed border-zinc-200">
                  <Store className="w-8 h-8 mx-auto text-zinc-400 mb-2" />
                  <h4 className="font-semibold text-sm text-zinc-800">
                    Brendlar topilmadi
                  </h4>
                  <p className="text-xs text-zinc-500 mt-1">
                    Boshqa toifa yoki viloyatni tanlab ko'ring yoki qidiruv so'zini tozalang.
                  </p>
                </div>
              )
            )}
          </div>
        </div>
      ) : (
        /* B) TANLANGAN MALL SAHIFASI */
        <div className="flex flex-col h-full">
          
          {/* Mall Cover & Header */}
          <div className="relative border-b border-zinc-200 bg-zinc-900 text-white">
            <div className="relative h-44 overflow-hidden">
              <img
                src={selectedMall.image}
                alt={selectedMall.name}
                className="w-full h-full object-cover opacity-80"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent" />

              {/* Orqaga qaytish tugmasi */}
              <button
                onClick={onBackToMalls}
                className="absolute top-3 left-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-black/60 hover:bg-black/80 text-white text-xs font-medium backdrop-blur-sm transition-colors cursor-pointer border border-white/10"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Barcha mallar</span>
              </button>

              {/* Panelni yopish tugmasi */}
              {onToggleSidebar && (
                <button
                  onClick={onToggleSidebar}
                  className="absolute top-3 right-3 p-1.5 rounded-lg bg-black/60 hover:bg-black/80 text-white text-xs font-medium backdrop-blur-sm transition-colors cursor-pointer border border-white/10"
                  title="Yon panelni yopish (Xaritani to'liq ekranga yoyish)"
                >
                  <PanelLeftClose className="w-4 h-4" />
                </button>
              )}

              <div className="absolute bottom-3 left-4 right-4 flex items-end justify-between">
                <div>
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <span className="text-[11px] font-medium text-zinc-300">
                      {selectedMall.regionName}
                    </span>
                    <span className="text-zinc-500">•</span>
                    <span className="text-[11px] text-zinc-400">
                      {selectedMall.category}
                    </span>
                  </div>
                  <h2 className="text-xl font-bold text-white tracking-tight">
                    {selectedMall.name}
                  </h2>
                </div>

                <div className="flex items-center gap-1 px-2 py-1 rounded bg-black/50 text-white text-xs font-semibold backdrop-blur-xs">
                  <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                  <span>{selectedMall.rating}</span>
                </div>
              </div>
            </div>

            {/* Quick Meta Row */}
            <div className="p-3 bg-zinc-950/90 text-xs text-zinc-300 flex items-center justify-between border-t border-zinc-800">
              <div className="flex items-center gap-2 truncate">
                <span className="flex items-center gap-1 truncate text-zinc-400">
                  <MapPin className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                  <span className="truncate">{selectedMall.address}</span>
                </span>
                <span className="text-zinc-600">•</span>
                <span className="text-emerald-400 font-medium shrink-0">
                  {openBrandsCount} tasi ochiq
                </span>
              </div>
              <span className="font-mono text-zinc-400 shrink-0 ml-2">
                {selectedMall.generalHours}
              </span>
            </div>

            {/* Aniq GPS navigatsiya tugmalari */}
            <div className="p-3 bg-zinc-900 border-t border-zinc-800 space-y-2">
              <div className="flex items-center gap-2">
                <a
                  href={selectedMall.googleMapsUrl || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(selectedMall.googleSearchQuery || selectedMall.coords.join(','))}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-100 text-xs font-semibold transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-blue-400" />
                  <span>Google Maps'da ochish</span>
                </a>
                <a
                  href={`https://yandex.uz/maps/?pt=${selectedMall.coords[1]},${selectedMall.coords[0]}&z=17&l=map`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium transition-colors"
                >
                  <Navigation className="w-3.5 h-3.5 text-amber-400" />
                  <span>Yandex Navigatsiya</span>
                </a>
              </div>

              {/* Plus Code va GPS */}
              <div className="flex items-center justify-between text-[11px] text-zinc-400 font-mono px-1">
                <div className="flex items-center gap-1">
                  <span>Plus Code:</span>
                  <strong className="text-zinc-200 font-semibold">
                    {selectedMall.plusCode || 'Mavjud'}
                  </strong>
                  {selectedMall.plusCode && (
                    <button
                      onClick={() => handleCopyPlusCode(selectedMall.plusCode)}
                      className="p-0.5 rounded hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 cursor-pointer transition-colors"
                      title="Nusxalash"
                    >
                      {copiedPlusCode ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  )}
                </div>
                <span>GPS: {selectedMall.coords[0].toFixed(4)}, {selectedMall.coords[1].toFixed(4)}</span>
              </div>
            </div>
          </div>

          {/* Qidiruv va Filterlar Paneli */}
          <div className="p-3.5 border-b border-zinc-200 bg-zinc-50 space-y-2.5">
            {/* Do'kon qidirish */}
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input
                type="text"
                value={mallSearchQuery}
                onChange={(e) => setMallSearchQuery(e.target.value)}
                placeholder={`${selectedMall.name} brendlarini qidirish...`}
                className="w-full pl-9 pr-8 py-2 text-xs sm:text-sm bg-white border border-zinc-200 rounded-lg outline-none focus:border-zinc-400 transition-colors text-zinc-900"
              />
              {mallSearchQuery && (
                <button
                  onClick={() => setMallSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Kategoriya Pills (Gorizontal scroll) */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5">
              {CATEGORIES.map((cat) => {
                const isActive = selectedCategory === cat.id
                return (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
                      isActive
                        ? 'bg-zinc-900 text-white'
                        : 'bg-white text-zinc-600 border border-zinc-200 hover:border-zinc-300'
                    }`}
                  >
                    {cat.name}
                  </button>
                )
              })}
            </div>

            {/* Qavat tanlash va Faqat ochiqlar filtri */}
            <div className="flex items-center justify-between text-xs pt-0.5">
              <div className="flex items-center gap-1.5">
                <span className="text-zinc-500 font-medium">Qavat:</span>
                <select
                  value={selectedFloor}
                  onChange={(e) => setSelectedFloor(e.target.value)}
                  className="bg-white border border-zinc-200 text-zinc-700 px-2 py-1 rounded-md text-xs outline-none cursor-pointer"
                >
                  <option value="all">Barchasi</option>
                  {selectedMall.floors.map((fl) => (
                    <option key={fl} value={fl}>
                      {fl}
                    </option>
                  ))}
                </select>
              </div>

              <label className="flex items-center gap-1.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={onlyOpenNow}
                  onChange={(e) => setOnlyOpenNow(e.target.checked)}
                  className="rounded text-zinc-900 w-3.5 h-3.5 accent-zinc-900 cursor-pointer"
                />
                <span className={`text-xs font-medium ${onlyOpenNow ? 'text-emerald-700 font-semibold' : 'text-zinc-600'}`}>
                  Faqat hozir ochiqlar
                </span>
              </label>
            </div>
          </div>

          {/* Brendlar Ro'yxati */}
          <div className="flex-1 overflow-y-auto p-3.5 space-y-2">
            <div className="flex items-center justify-between text-xs text-zinc-500 px-1 mb-1">
              <span>{filteredBrands.length} ta brend</span>
              <span>Batafsil ma'lumot uchun bosing</span>
            </div>

            {filteredBrands.length > 0 ? (
              filteredBrands.map((brand) => (
                <BrandCard
                  key={brand.id}
                  brand={brand}
                  mall={selectedMall}
                  onSelect={onSelectBrand}
                  currentTime={currentTime}
                />
              ))
            ) : (
              <div className="p-8 text-center bg-zinc-50 rounded-xl border border-dashed border-zinc-200">
                <Store className="w-8 h-8 mx-auto text-zinc-400 mb-2" />
                <h4 className="font-semibold text-sm text-zinc-800">
                  Mos brend topilmadi
                </h4>
                <p className="text-xs text-zinc-500 mt-1">
                  Filtr parametrlarini o'zgartirib ko'ring.
                </p>
                <button
                  onClick={() => {
                    setMallSearchQuery('')
                    setSelectedCategory('all')
                    setSelectedFloor('all')
                    setOnlyOpenNow(false)
                  }}
                  className="mt-3 px-3 py-1.5 rounded-lg bg-white border border-zinc-200 text-zinc-700 text-xs font-medium hover:bg-zinc-50 cursor-pointer"
                >
                  Filtrlarni tozalash
                </button>
              </div>
            )}
          </div>

        </div>
      )}

    </aside>
  )
}
