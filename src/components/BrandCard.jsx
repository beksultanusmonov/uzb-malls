import React from 'react'
import { ChevronRight } from 'lucide-react'
import { getBrandStatus } from '../utils/workingHours'
import BrandLogo from './BrandLogo'

export default function BrandCard({ brand, mall, onSelect, currentTime }) {
  const status = getBrandStatus(brand.schedule, currentTime)

  return (
    <div
      onClick={() => onSelect(brand, mall)}
      className="group p-3.5 rounded-xl bg-white border border-zinc-200/90 hover:border-zinc-300 hover:shadow-xs transition-all duration-150 cursor-pointer flex items-center justify-between gap-3"
    >
      <div className="flex items-center gap-3 min-w-0">
        {/* Brand Monogram/Logo */}
        <BrandLogo
          brand={brand}
          size="md"
          className="transition-transform group-hover:scale-102"
        />

        {/* Brand Details */}
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h4 className="font-semibold text-sm text-zinc-900 truncate group-hover:text-zinc-700">
              {brand.name}
            </h4>
            {brand.discount && (
              <span className="hidden sm:inline-block px-1.5 py-0.2 text-[10px] font-medium bg-amber-50 text-amber-700 border border-amber-200 rounded">
                Aksiya
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 text-xs text-zinc-500 mt-0.5">
            <span className="truncate">{brand.categoryName}</span>
            <span className="text-zinc-300">•</span>
            <span className="font-medium text-zinc-700 shrink-0">{brand.floor}</span>
          </div>

          {/* Ish holati (Real-time Status) */}
          <div className="flex items-center gap-1.5 mt-1.5">
            <span
              className={`w-2 h-2 rounded-full shrink-0 ${
                status.isOpen
                  ? status.closingSoon
                    ? 'bg-amber-500'
                    : 'bg-emerald-500'
                  : 'bg-rose-500'
              }`}
            />
            <span
              className={`text-xs font-medium ${
                status.isOpen
                  ? status.closingSoon
                    ? 'text-amber-700'
                    : 'text-emerald-700'
                  : 'text-zinc-500'
              }`}
            >
              {status.isOpen ? (
                status.closingSoon ? (
                  `Tez orada yopiladi (${status.remainingMinutes} daq.)`
                ) : (
                  `Ochiq • ${brand.schedule[currentTime.getDay()]?.close || '22:00'} gacha`
                )
              ) : (
                `Yopiq • ${status.remainingText.split('•')[0].trim()}`
              )}
            </span>
          </div>
        </div>
      </div>

      {/* Right chevron */}
      <div className="shrink-0 p-1 rounded-lg text-zinc-400 group-hover:text-zinc-700 group-hover:bg-zinc-100 transition-colors">
        <ChevronRight className="w-4 h-4" />
      </div>
    </div>
  )
}
