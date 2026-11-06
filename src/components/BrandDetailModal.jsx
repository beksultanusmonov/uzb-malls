import React, { useMemo } from 'react'
import {
  X,
  Phone,
  Globe,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Calendar,
  ExternalLink,
  Navigation,
  Building2,
  ChevronRight,
  MapPin,
  Store
} from 'lucide-react'
import { getBrandStatus } from '../utils/workingHours'
import BrandLogo from './BrandLogo'

const InstagramIcon = ({ className = 'w-4 h-4' }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
)

export default function BrandDetailModal({
  brand,
  mall,
  malls = [],
  onSelectMall,
  onClose,
  currentTime
}) {
  // Ushbu brend mavjud bo'lgan boshqa savdo majmualarini (filiallarini) topish
  const otherBranches = useMemo(() => {
    if (!malls || !brand || !mall) return []
    
    // Asosiy brend nomini aniqlash (masalan: "LC Waikiki", "KFC", "Terra Pro", "ZARA")
    const cleanBrandName = (name) => {
      return (name || '')
        .toLowerCase()
        .replace(/(flagship|city mall|mall|samarqand|namangan|buxoro|andijon|farg'ona|toshkent|compass|riviera|next|navro'z|o'zbegim)/gi, '')
        .trim()
    }
    const targetCore = cleanBrandName(brand.name)

    const branches = []
    malls.forEach((m) => {
      if (m.id === mall.id) return // Hozirgi mallni o'tkazib yuboramiz
      (m.brands || []).forEach((b) => {
        const bCore = cleanBrandName(b.name)
        if (
          bCore === targetCore ||
          b.name.toLowerCase().includes(targetCore) ||
          targetCore.includes(bCore)
        ) {
          branches.push({ mall: m, brand: b })
        }
      })
    })
    return branches
  }, [malls, brand, mall])

  if (!brand || !mall) return null

  const status = getBrandStatus(brand.schedule, currentTime)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/40 backdrop-blur-xs">
      {/* Backdrop */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-xl bg-white rounded-2xl shadow-xl border border-zinc-200 overflow-hidden flex flex-col max-h-[90vh] z-10 animate-modal">
        
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-zinc-100 flex items-start justify-between gap-4">
          <div className="flex items-center gap-3.5">
            {/* Logo */}
            <BrandLogo brand={brand} size="xl" className="shadow-xs" />

            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-bold text-zinc-900">
                  {brand.name}
                </h3>
                {brand.discount && (
                  <span className="px-2 py-0.5 text-[11px] font-medium bg-amber-50 text-amber-800 border border-amber-200 rounded-md">
                    {brand.discount}
                  </span>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-500 mt-1">
                <span>{brand.categoryName}</span>
                <span className="text-zinc-300">•</span>
                <span className="font-semibold text-zinc-800">{mall.name}</span>
                <span className="text-zinc-300">•</span>
                <span className="text-zinc-700 font-medium">{brand.floor}</span>
                {brand.locationCode && (
                  <span className="text-zinc-400">({brand.locationCode})</span>
                )}
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition-colors cursor-pointer"
            title="Yopish"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5">
          
          {/* 1. Real-time Status Card (Ochiq/Yopiqlik ma'lumoti) */}
          <div
            className={`p-4 rounded-xl border ${
              status.isOpen
                ? status.closingSoon
                  ? 'bg-amber-50/70 border-amber-200'
                  : 'bg-emerald-50/70 border-emerald-200'
                : 'bg-zinc-50 border-zinc-200'
            }`}
          >
            <div className="flex items-start gap-3">
              <div className="mt-0.5 shrink-0">
                {status.isOpen ? (
                  status.closingSoon ? (
                    <AlertCircle className="w-5 h-5 text-amber-600" />
                  ) : (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  )
                ) : (
                  <XCircle className="w-5 h-5 text-rose-500" />
                )}
              </div>

              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h4
                    className={`font-semibold text-base ${
                      status.isOpen
                        ? status.closingSoon
                          ? 'text-amber-800'
                          : 'text-emerald-800'
                        : 'text-zinc-800'
                    }`}
                  >
                    {status.statusText}
                  </h4>
                  <span className="text-xs font-mono text-zinc-500">
                    Bugun: {status.todayHours}
                  </span>
                </div>

                <p className="text-xs text-zinc-600 mt-1 leading-relaxed">
                  {status.remainingText}
                </p>
              </div>
            </div>
          </div>

          {/* 2. MALLga Bog'lanish Kartasi (Qaysi savdo markazida joylashgan) */}
          <div className="p-3.5 rounded-xl bg-gradient-to-r from-zinc-50 to-blue-50/40 border border-zinc-200/90 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="relative w-12 h-12 rounded-lg overflow-hidden shrink-0 bg-zinc-200 border border-zinc-200">
                <img src={mall.image} alt={mall.name} className="w-full h-full object-cover" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 text-[10px] font-bold text-blue-700 uppercase tracking-wider">
                  <Building2 className="w-3 h-3" />
                  <span>Savdo Majmuasi</span>
                </div>
                <h4 className="font-bold text-sm text-zinc-900 truncate">{mall.name}</h4>
                <p className="text-xs text-zinc-500 truncate flex items-center gap-1 mt-0.5">
                  <MapPin className="w-3 h-3 text-zinc-400 shrink-0" />
                  <span>{mall.city} • {brand.floor} {brand.locationCode ? `(${brand.locationCode})` : ''}</span>
                </p>
              </div>
            </div>

            <a
              href={mall.googleMapsUrl || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mall.googleSearchQuery || mall.name)}`}
              target="_blank"
              rel="noreferrer"
              className="px-2.5 py-1.5 rounded-lg bg-white border border-zinc-200 text-xs font-semibold text-zinc-700 hover:text-blue-600 hover:border-blue-300 transition-colors flex items-center gap-1 shrink-0 shadow-2xs"
            >
              <ExternalLink className="w-3.5 h-3.5 text-blue-500" />
              <span>Xaritada</span>
            </a>
          </div>

          {/* 3. Ushbu Brend Mavjud Bo'lgan Boshqa MALLlar (Filiallar) */}
          {otherBranches.length > 0 && (
            <div className="space-y-2 pt-1">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-500 flex items-center gap-1.5">
                  <Store className="w-3.5 h-3.5 text-zinc-400" />
                  <span>Boshqa MALLlardagi filiallari ({otherBranches.length})</span>
                </h4>
                <span className="text-[11px] text-zinc-400">O'tish uchun bosing</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {otherBranches.map((item) => (
                  <button
                    key={item.mall.id + item.brand.id}
                    onClick={() => {
                      if (onSelectMall) {
                        onSelectMall(item.mall, item.brand)
                      }
                    }}
                    className="p-2.5 rounded-xl bg-white border border-zinc-200 hover:border-blue-300 hover:bg-blue-50/40 transition-all text-left flex items-center gap-2.5 cursor-pointer group"
                    title={`${item.mall.name} dagi filialiga o'tish`}
                  >
                    <div className="w-9 h-9 rounded-lg bg-zinc-100 overflow-hidden shrink-0 border border-zinc-200">
                      <img src={item.mall.image} alt={item.mall.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h5 className="font-semibold text-xs text-zinc-900 group-hover:text-blue-600 truncate">
                        {item.mall.name}
                      </h5>
                      <p className="text-[11px] text-zinc-500 truncate">
                        {item.mall.city} • <span className="font-medium text-zinc-700">{item.brand.floor}</span>
                      </p>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-zinc-400 group-hover:text-blue-500 shrink-0" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 4. Haftalik Ish Jadvali */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Calendar className="w-4 h-4 text-zinc-500" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-500">
                Haftalik ish tartibi
              </h4>
            </div>

            <div className="border border-zinc-200 rounded-xl overflow-hidden divide-y divide-zinc-100">
              {status.weeklyList.map((day) => (
                <div
                  key={day.index}
                  className={`px-3.5 py-2.5 text-xs flex items-center justify-between transition-colors ${
                    day.isToday
                      ? 'bg-zinc-100 font-semibold text-zinc-900'
                      : 'bg-white text-zinc-600 hover:bg-zinc-50/50'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span>{day.dayName}</span>
                    {day.isToday && (
                      <span className="px-1.5 py-0.2 rounded text-[10px] bg-zinc-900 text-white font-medium">
                        Bugun
                      </span>
                    )}
                  </div>
                  <span className={`font-mono text-xs ${day.isToday ? 'text-zinc-900' : 'text-zinc-500'}`}>
                    {day.formattedText}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* 5. Do'kon haqida tavsif */}
          {brand.description && (
            <div className="space-y-1.5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-500">
                Do'kon haqida
              </h4>
              <p className="text-xs text-zinc-600 leading-relaxed bg-zinc-50 p-3.5 rounded-xl border border-zinc-200">
                {brand.description}
              </p>
            </div>
          )}

          {/* 6. Bog'lanish tugmalari */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
            {brand.phone && (
              <a
                href={`tel:${brand.phone}`}
                className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-800 text-xs font-medium transition-colors"
              >
                <Phone className="w-4 h-4 text-zinc-600" />
                <span>Qo'ng'iroq qilish</span>
              </a>
            )}
            {brand.instagram && (
              <a
                href={`https://instagram.com/${brand.instagram.replace('@', '')}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-800 text-xs font-medium transition-colors"
              >
                <InstagramIcon className="w-4 h-4 text-zinc-600" />
                <span>{brand.instagram}</span>
              </a>
            )}

            {brand.website && (
              <a
                href={brand.website}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-800 text-xs font-medium transition-colors"
              >
                <Globe className="w-4 h-4 text-zinc-600" />
                <span>Saytga o'tish</span>
              </a>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-zinc-50 border-t border-zinc-100 flex items-center justify-between text-xs text-zinc-500 gap-2">
          <div className="flex items-center gap-3 truncate">
            <a
              href={mall.googleMapsUrl || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mall.googleSearchQuery || mall.coords.join(','))}`}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 font-semibold text-zinc-800 hover:text-blue-600 transition-colors shrink-0"
              title="Google Maps'da ochish"
            >
              <ExternalLink className="w-3.5 h-3.5 text-blue-500 shrink-0" />
              <span>Google Maps ({mall.plusCode || 'GPS'})</span>
            </a>

            <a
              href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(mall.googleSearchQuery || mall.coords.join(','))}`}
              target="_blank"
              rel="noreferrer"
              className="hidden sm:inline-flex items-center gap-1 font-semibold text-emerald-700 hover:text-emerald-800 transition-colors shrink-0"
              title="Marshrut chizish"
            >
              <Navigation className="w-3.5 h-3.5 text-emerald-600" />
              <span>Marshrut</span>
            </a>

            <span className="text-zinc-300 hidden sm:inline">•</span>

            <span className="truncate hidden sm:inline text-zinc-500">
              {mall.address}
            </span>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white font-medium text-xs transition-colors cursor-pointer"
          >
            Yopish
          </button>
        </div>

      </div>
    </div>
  )
}