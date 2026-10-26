import React, { useEffect, useRef, useState } from 'react'
import L from 'leaflet'
import { MapPin, Check, Copy } from 'lucide-react'
import { REGIONS } from '../../data/regionsData'

const TILE_LAYERS = {
  googleRoad: {
    name: 'Google Xarita',
    url: 'https://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}',
    subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
    maxZoom: 20
  },
  googleSat: {
    name: 'Yo\'ldosh (3D)',
    url: 'https://{s}.google.com/vt/lyrs=y&x={x}&y={y}&z={z}',
    subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
    maxZoom: 20
  }
}

export default function LocationPickerMap({
  coords,
  onChange,
  regionId = 'andijon'
}) {
  const mapContainerRef = useRef(null)
  const mapInstanceRef = useRef(null)
  const markerRef = useRef(null)
  const currentTileLayerRef = useRef(null)

  const [activeLayer, setActiveLayer] = useState('googleRoad')
  const [copied, setCopied] = useState(false)

  // Boshlang'ich koordinatalar
  const currentRegion = REGIONS.find((r) => r.id === regionId) || REGIONS[1]
  const validCoords = (Array.isArray(coords) && !isNaN(coords[0]) && !isNaN(coords[1]))
    ? coords
    : currentRegion.coords

  const initialCoordsRef = useRef(validCoords)
  const onChangeRef = useRef(onChange)
  useEffect(() => {
    onChangeRef.current = onChange
  }, [onChange])

  // Xaritani bir marta yaratish
  useEffect(() => {
    if (!mapContainerRef.current) return

    const initialCoords = initialCoordsRef.current

    const map = L.map(mapContainerRef.current, {
      zoomControl: false,
      attributionControl: false
    }).setView(initialCoords, 15)

    mapInstanceRef.current = map

    // Standart qatlam
    const cfg = TILE_LAYERS.googleRoad
    const tileLayer = L.tileLayer(cfg.url, {
      subdomains: cfg.subdomains,
      maxZoom: cfg.maxZoom
    }).addTo(map)

    currentTileLayerRef.current = tileLayer

    // Pin marker yaratish
    const pinHtml = `
      <div class="mall-pin-marker active">
        <div class="mall-pin-badge" style="background-color: #09090b; color: #ffffff; border-color: #27272a;">
          <span style="width: 8px; height: 8px; border-radius: 9999px; background-color: #10b981; display: inline-block;"></span>
          <span style="font-weight: 700; font-size: 11px;">Tanlangan joy</span>
        </div>
        <div class="mall-pin-pointer active"></div>
        <div class="mall-pin-anchor-dot active"></div>
      </div>
    `
    const icon = L.divIcon({
      className: '',
      html: pinHtml,
      iconSize: [0, 0],
      iconAnchor: [0, 0]
    })

    const marker = L.marker(initialCoords, {
      icon,
      draggable: true
    }).addTo(map)

    markerRef.current = marker

    // Marker sudralganda (drag)
    marker.on('dragend', () => {
      const pos = marker.getLatLng()
      const newCoords = [Number(pos.lat.toFixed(6)), Number(pos.lng.toFixed(6))]
      onChangeRef.current?.(newCoords)
    })

    // Xarita bosilganda (click)
    map.on('click', (e) => {
      const newCoords = [Number(e.latlng.lat.toFixed(6)), Number(e.latlng.lng.toFixed(6))]
      marker.setLatLng(newCoords)
      onChangeRef.current?.(newCoords)
    })

    const timer = setTimeout(() => {
      map.invalidateSize()
    }, 250)

    return () => {
      clearTimeout(timer)
      map.remove()
      mapInstanceRef.current = null
    }
  }, [])

  // Tashqaridan koordinata o'zgarganda markerni yangilash
  useEffect(() => {
    if (mapInstanceRef.current && markerRef.current && Array.isArray(coords)) {
      markerRef.current.setLatLng(coords)
    }
  }, [coords])

  // Qatlamni almashtirish
  const handleToggleLayer = (layerKey) => {
    const map = mapInstanceRef.current
    if (!map || layerKey === activeLayer) return

    if (currentTileLayerRef.current) {
      map.removeLayer(currentTileLayerRef.current)
    }

    const cfg = TILE_LAYERS[layerKey]
    const newLayer = L.tileLayer(cfg.url, {
      subdomains: cfg.subdomains,
      maxZoom: cfg.maxZoom
    }).addTo(map)

    currentTileLayerRef.current = newLayer
    setActiveLayer(layerKey)
  }

  // Tezkor shahar markaziga o'tish
  const handleJumpToRegion = (reg) => {
    const map = mapInstanceRef.current
    if (!map) return
    map.flyTo(reg.coords, reg.zoom, { duration: 0.8 })
    if (markerRef.current) {
      markerRef.current.setLatLng(reg.coords)
      onChange(reg.coords)
    }
  }

  const handleCopy = () => {
    if (!coords) return
    navigator.clipboard.writeText(`${coords[0]}, ${coords[1]}`)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div className="space-y-2">
      {/* Yuqori yo'riqnoma va tezkor shaharlar */}
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
        <span className="text-zinc-600 font-medium flex items-center gap-1.5">
          <MapPin className="w-3.5 h-3.5 text-emerald-600" />
          <span>Xaritadagi bino ustiga bosing yoki pinni suring</span>
        </span>

        {/* Tezkor hudud tugmalari */}
        <div className="flex items-center gap-1">
          {REGIONS.filter((r) => r.id !== 'all').map((r) => (
            <button
              key={r.id}
              type="button"
              onClick={() => handleJumpToRegion(r)}
              className="px-2 py-0.5 rounded bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-[11px] font-medium transition-colors cursor-pointer"
            >
              {r.shortName}
            </button>
          ))}
        </div>
      </div>

      {/* Xarita maydoni */}
      <div className="relative w-full h-64 sm:h-72 rounded-xl overflow-hidden border border-zinc-200 bg-zinc-100 shadow-inner">
        <div ref={mapContainerRef} className="w-full h-full" />

        {/* Xarita qatlamini almashtirish (Road / Satellite) */}
        <div className="absolute top-2 right-2 z-[400] flex bg-white/95 backdrop-blur-xs p-0.5 rounded-lg border border-zinc-200 shadow-sm text-xs">
          <button
            type="button"
            onClick={() => handleToggleLayer('googleRoad')}
            className={`px-2 py-1 rounded text-[11px] font-semibold transition-colors cursor-pointer ${
              activeLayer === 'googleRoad'
                ? 'bg-zinc-900 text-white'
                : 'text-zinc-600 hover:text-zinc-900'
            }`}
          >
            Oddiy
          </button>
          <button
            type="button"
            onClick={() => handleToggleLayer('googleSat')}
            className={`px-2 py-1 rounded text-[11px] font-semibold transition-colors cursor-pointer ${
              activeLayer === 'googleSat'
                ? 'bg-zinc-900 text-white'
                : 'text-zinc-600 hover:text-zinc-900'
            }`}
          >
            Yo'ldosh (3D)
          </button>
        </div>
      </div>

      {/* Tanlangan koordinatalar qatori */}
      <div className="flex items-center justify-between p-2 rounded-lg bg-zinc-50 border border-zinc-200 text-xs">
        <div className="flex items-center gap-2 font-mono text-zinc-700">
          <span className="text-zinc-400">Tanlangan GPS:</span>
          <span className="font-semibold text-zinc-900">
            {coords && coords.length === 2 ? `${coords[0]}, ${coords[1]}` : 'Tanlanmagan'}
          </span>
        </div>

        <button
          type="button"
          onClick={handleCopy}
          className="flex items-center gap-1 px-2 py-1 rounded bg-white hover:bg-zinc-100 border border-zinc-200 text-zinc-700 text-[11px] font-medium transition-colors cursor-pointer"
          title="Nusxalash"
        >
          {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
          <span>{copied ? 'Nusxalandi' : 'Nusxa olish'}</span>
        </button>
      </div>
    </div>
  )
}
