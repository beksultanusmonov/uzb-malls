import React from 'react'
import { REGIONS } from '../data/regionsData'

export default function RegionSelector({
  selectedRegionId,
  onSelectRegion,
  malls
}) {
  // Har bir viloyatdagi mallar sonini hisoblash
  const getMallCount = (regionId) => {
    if (regionId === 'all') return malls.length
    return malls.filter((m) => m.regionId === regionId).length
  }

  return (
    <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
      {REGIONS.map((region) => {
        const isSelected = selectedRegionId === region.id
        const count = getMallCount(region.id)

        // Agar bu viloyatda mall mavjud bo'lmasa ko'rsatmaslik yoki nol ko'rsatish
        if (region.id !== 'all' && count === 0) return null

        return (
          <button
            key={region.id}
            onClick={() => onSelectRegion(region.id)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-150 flex items-center gap-1.5 cursor-pointer shrink-0 ${
              isSelected
                ? 'bg-zinc-900 text-white shadow-xs'
                : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200/80 hover:text-zinc-900'
            }`}
          >
            <span>{region.shortName}</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-md font-medium ${
                isSelected
                  ? 'bg-zinc-800 text-zinc-300'
                  : 'bg-white/80 text-zinc-500'
              }`}
            >
              {count}
            </span>
          </button>
        )
      })}
    </div>
  )
}
