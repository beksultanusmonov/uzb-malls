import React from 'react'
import { Search, Building2, Clock, X, MapPin, ShieldCheck, PanelLeftClose, PanelLeftOpen } from 'lucide-react'
import { REGIONS } from '../data/regionsData'

export default function Navbar({
  searchTerm,
  onSearchChange,
  currentTime,
  totalMalls,
  totalBrands,
  selectedRegionId,
  onSelectRegion,
  onOpenAdmin,
  isSidebarOpen,
  onToggleSidebar
}) {
  // Toshkent/Mahalliy vaqt formati
  const hours = String(currentTime.getHours()).padStart(2, '0')
  const minutes = String(currentTime.getMinutes()).padStart(2, '0')
  const seconds = String(currentTime.getSeconds()).padStart(2, '0')

  const monthNames = [
    'yanvar', 'fevral', 'mart', 'aprel', 'may', 'iyun',
    'iyul', 'avgust', 'sentabr', 'oktabr', 'noyabr', 'dekabr'
  ]
  const dayNames = ['Yakshanba', 'Dushanba', 'Seshanba', 'Chorshanba', 'Payshanba', 'Juma', 'Shanba']

  const dateString = `${currentTime.getDate()}-${monthNames[currentTime.getMonth()]}, ${dayNames[currentTime.getDay()]}`

  return (
    <header className="sticky top-0 z-40 w-full bg-white border-b border-zinc-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        
        {/* Logo / Brend nomi va Yon Panel tugmasi */}
        <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
          {onToggleSidebar && (
            <button
              onClick={onToggleSidebar}
              className="p-2 rounded-xl border border-zinc-200 text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 transition-colors cursor-pointer hidden md:flex items-center justify-center shadow-2xs"
              title={isSidebarOpen ? "Yon panelni yopish (Xaritani to'liq ekranga yoyish)" : "Yon panelni ochish (Savdo majmualari ro'yxati)"}
            >
              {isSidebarOpen ? (
                <PanelLeftClose className="w-4 h-4 text-zinc-700" />
              ) : (
                <PanelLeftOpen className="w-4 h-4 text-emerald-600" />
              )}
            </button>
          )}

          <div className="w-9 h-9 rounded-xl bg-zinc-900 text-white flex items-center justify-center font-bold text-sm shadow-sm">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-base tracking-tight text-zinc-900">
                Uzbekistan MALLs
              </span>
              <span className="text-[11px] font-medium text-zinc-500 bg-zinc-100 px-2 py-0.5 rounded-full border border-zinc-200 hidden sm:inline-block">
                {totalMalls} majmua • {totalBrands} brend
              </span>
            </div>
            <p className="text-[11px] text-zinc-500 hidden sm:block">
              Andijon, Toshkent va viloyatlar savdo majmualari
            </p>
          </div>
        </div>

        {/* Global Qidiruv va Viloyat Tanlagich */}
        <div className="flex-1 max-w-lg hidden md:flex items-center gap-2">
          {/* Viloyat Select */}
          <div className="relative shrink-0">
            <select
              value={selectedRegionId}
              onChange={(e) => onSelectRegion(e.target.value)}
              className="appearance-none bg-zinc-100 hover:bg-zinc-200/70 border border-zinc-200 text-zinc-800 text-xs font-semibold py-2 pl-7 pr-7 rounded-xl outline-none cursor-pointer transition-colors"
            >
              {REGIONS.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </select>
            <MapPin className="w-3.5 h-3.5 text-zinc-500 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Qidiruv Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Mall, brend yoki viloyat qidirish (Navro'z, Zara, KFC)..."
              className="w-full pl-9 pr-8 py-2 text-xs sm:text-sm bg-zinc-100 hover:bg-zinc-100/80 focus:bg-white border border-transparent focus:border-zinc-300 rounded-xl outline-none transition-all placeholder:text-zinc-400 text-zinc-900"
            />
            {searchTerm && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 p-0.5 rounded-full cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Real-time mahalliy vaqt va Admin Panel kirish tugmasi */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-zinc-50 border border-zinc-200 text-zinc-700">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>

            <div className="flex items-center gap-1.5 text-xs">
              <Clock className="w-3.5 h-3.5 text-zinc-400" />
              <span className="hidden xl:inline text-zinc-500">{dateString}</span>
              <span className="hidden xl:inline text-zinc-300">•</span>
              <span className="font-mono font-semibold text-zinc-900">
                {hours}:{minutes}
                <span className="text-[10px] text-zinc-400 font-normal">:{seconds}</span>
              </span>
            </div>
          </div>

          {/* Admin Panel Alohida Kirish Linki */}
          <button
            onClick={onOpenAdmin}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
            title="Admin boshqaruv paneliga o'tish (Savdo majmualari va brendlarni tahrirlash)"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">Admin Panel</span>
          </button>
        </div>

      </div>

      {/* Mobil qidiruv va viloyat qatori */}
      <div className="px-4 py-2.5 md:hidden border-t border-zinc-100 bg-zinc-50 flex flex-col gap-2">
        <div className="flex items-center gap-2">
          {/* Viloyat Select (mobil) */}
          <div className="relative shrink-0">
            <select
              value={selectedRegionId}
              onChange={(e) => onSelectRegion(e.target.value)}
              className="appearance-none bg-white border border-zinc-200 text-zinc-800 text-xs font-semibold py-1.5 pl-7 pr-6 rounded-lg outline-none"
            >
              {REGIONS.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.shortName}
                </option>
              ))}
            </select>
            <MapPin className="w-3.5 h-3.5 text-zinc-500 absolute left-2 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Qidiruv input (mobil) */}
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Mall yoki brend qidirish..."
              className="w-full pl-8 pr-7 py-1.5 text-xs bg-white border border-zinc-200 rounded-lg outline-none text-zinc-900"
            />
            {searchTerm && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-400"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
