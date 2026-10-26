import React, { useState } from 'react'

/**
 * BrandLogo komponenti:
 * 1. Agar brand.logoUrl yoki brand.image mavjud bo'lsa va muvaffaqiyatli yuklansa -> rasmni ko'rsatadi.
 * 2. Agar rasm berilmagan bo'lsa yoki havola xato (404/broken/ishlamasa) bo'lsa -> avtomatik tarzda
 *    qisqartma monogram (KFC, DF, W, Z, EV, TP, TM...) yoki logoText nishonini chiqaradi.
 */
export default function BrandLogo({
  brand,
  size = 'md', // 'sm' (w-9 h-9), 'md' (w-11 h-11), 'lg' (w-12 h-12), 'xl' (w-14 h-14)
  className = ''
}) {
  const [failedUrls, setFailedUrls] = useState(() => new Set())
  const imageUrl = brand?.logoUrl || brand?.image
  const isBroken = Boolean(imageUrl && failedUrls.has(imageUrl))

  // O'lcham klasslari
  const sizeClasses = {
    sm: 'w-9 h-9 text-xs rounded-lg',
    md: 'w-11 h-11 text-xs sm:text-sm rounded-xl',
    lg: 'w-12 h-12 text-sm rounded-xl',
    xl: 'w-14 h-14 text-base rounded-2xl'
  }[size] || 'w-11 h-11 text-xs rounded-xl'

  // Qisqartma hisoblash (Abbreviation generator: KFC, DF, W, Z, TP, TM...)
  const getAbbreviation = () => {
    if (brand?.logoText && String(brand.logoText).trim()) {
      return String(brand.logoText).trim()
    }

    const name = (brand?.name || '').trim()
    if (!name) return 'BR'

    // Ommabop brendlar uchun maxsus qisqartmalar
    const lower = name.toLowerCase()
    if (lower.includes('kfc')) return 'KFC'
    if (lower.includes('defacto')) return 'DF'
    if (lower.includes('waikiki')) return 'LCW'
    if (lower.includes('zara')) return 'Z'
    if (lower.includes('wendy')) return 'W'
    if (lower.includes('evos')) return 'EV'
    if (lower.includes('terra pro')) return 'TP'
    if (lower.includes('texnomart')) return 'TM'
    if (lower.includes('bellstore')) return 'BS'
    if (lower.includes('safia')) return 'SA'
    if (lower.includes('uzum')) return 'UZ'
    if (lower.includes('feed up')) return 'FU'
    if (lower.includes('just')) return 'JT'
    if (lower.includes('les ailes')) return 'LA'
    if (lower.includes('chopar')) return 'CH'
    if (lower.includes('makro')) return 'MK'
    if (lower.includes('korzinka')) return 'KZ'

    // Bir nechta so'z bo'lsa: har bir so'z bosh harfi (masalan: "Old City" -> "OC")
    const words = name.split(/\s+/).filter(Boolean)
    if (words.length >= 2) {
      return words.map((w) => w[0].toUpperCase()).join('').slice(0, 3)
    }

    // 1 ta qisqa so'z bo'lsa
    if (name.length <= 3) {
      return name.toUpperCase()
    }

    // Standart holda dastlabki 2 ta harf
    return name.slice(0, 2).toUpperCase()
  }

  // 1. Agar rasm mavjud bo'lsa va yuklanishda xato bermasa
  if (imageUrl && !isBroken) {
    return (
      <div
        className={`${sizeClasses} bg-white border border-zinc-200/90 shadow-2xs overflow-hidden shrink-0 flex items-center justify-center p-1 ${className}`}
      >
        <img
          key={imageUrl}
          src={imageUrl}
          alt={brand?.name || 'Brend logotipi'}
          className="w-full h-full object-contain"
          onError={() => {
            setFailedUrls((prev) => {
              const updated = new Set(prev)
              updated.add(imageUrl)
              return updated
            })
          }}
          loading="lazy"
        />
      </div>
    )
  }

  // 2. Rasm berilmagan yoki yuklanmagan / xato bo'lsa -> Monogram qisqartma
  return (
    <div
      className={`${sizeClasses} flex items-center justify-center font-bold tracking-wider shrink-0 select-none shadow-2xs ${
        brand?.logoBg || 'bg-zinc-900 text-white'
      } ${className}`}
    >
      <span>{getAbbreviation()}</span>
    </div>
  )
}
