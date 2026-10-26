import React from 'react'
import {
  X,
  Phone,
  Globe,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Calendar,
  ExternalLink,
  Navigation
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
  onClose,
  currentTime
}) {
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
                <span className="font-medium text-zinc-700">{mall.name}</span>
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

          {/* 2. Haftalik Ish Jadvali */}
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

          {/* 3. Do'kon haqida tavsif */}
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

          {/* 4. Bog'lanish tugmalari */}
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