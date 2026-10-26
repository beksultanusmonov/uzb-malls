import React from 'react'
import { Clock, RotateCcw } from 'lucide-react'

export default function TimeSimulatorBanner({
  currentTime,
  isSimulating,
  onResetTime,
  onSetPresetTime
}) {
  if (!isSimulating) return null

  const hours = String(currentTime.getHours()).padStart(2, '0')
  const minutes = String(currentTime.getMinutes()).padStart(2, '0')

  return (
    <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-white px-4 py-2 text-xs flex flex-wrap items-center justify-between gap-2 shadow-inner z-30">
      <div className="flex items-center gap-2">
        <Clock className="w-4 h-4 animate-spin" />
        <span className="font-semibold">
          Vaqt simulyatsiyasi faol:
        </span>
        <span className="font-mono font-bold bg-black/20 px-2 py-0.5 rounded-md text-white">
          {hours}:{minutes}
        </span>
        <span className="hidden sm:inline text-amber-100">
          (Barcha do'konlarning ochiq/yopiqlik holati ushbu vaqt bo'yicha ko'rsatilmoqda)
        </span>
      </div>

      <div className="flex items-center gap-2">
        {/* Tezkor presets */}
        <div className="hidden md:flex items-center gap-1.5 text-[11px]">
          <span className="text-amber-200">Tezkor:</span>
          <button
            onClick={() => onSetPresetTime(11, 30)}
            className="px-2 py-0.5 rounded-md bg-black/20 hover:bg-black/30 transition-colors cursor-pointer"
          >
            11:30 (Kunduz)
          </button>
          <button
            onClick={() => onSetPresetTime(22, 15)}
            className="px-2 py-0.5 rounded-md bg-black/20 hover:bg-black/30 transition-colors cursor-pointer"
          >
            22:15 (Yopilish arafasi)
          </button>
          <button
            onClick={() => onSetPresetTime(1, 30)}
            className="px-2 py-0.5 rounded-md bg-black/20 hover:bg-black/30 transition-colors cursor-pointer"
          >
            01:30 (Tun)
          </button>
        </div>

        <button
          onClick={onResetTime}
          className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-white text-zinc-900 font-bold hover:bg-amber-50 transition-colors cursor-pointer shadow-xs"
        >
          <RotateCcw className="w-3 h-3 text-amber-600" />
          <span>Jonli vaqtga qaytish</span>
        </button>
      </div>
    </div>
  )
}