import React, { useEffect, useRef, useState } from 'react'
import L from 'leaflet'
import {
  Compass,
  Layers,
  MapPin,
  ExternalLink,
  Navigation,
  Plus,
  Minus,
  Star
} from 'lucide-react'
import { REGIONS } from '../data/regionsData'

// Bepul Google Maps va OpenStreetMap qatlamlari
const TILE_LAYERS = {
  googleRoad: {
    name: 'Google Xarita',
    url: 'https://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}',
    subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
    maxZoom: 20,
    attribution: '&copy; Google Maps'
  },
  googleSat: {
    name: 'Yo\'ldosh (Satellite)',
    url: 'https://{s}.google.com/vt/lyrs=y&x={x}&y={y}&z={z}',
    subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
    maxZoom: 20,
    attribution: '&copy; Google Maps Satellite'
  },
  osm: {
    name: 'OpenStreetMap',
    url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
    subdomains: [],
    maxZoom: 19,
    attribution: '&copy; OpenStreetMap'
  }
}

export default function Map({
  malls,
  selectedMall,
  onSelectMall,
  selectedRegionId
}) {
  const mapContainerRef = useRef(null)
  const mapInstanceRef = useRef(null)
  const currentTileLayerRef = useRef(null)
  const markersRef = useRef({})
  const initialRegionRef = useRef(selectedRegionId)

  // Faol qatlam: standart 'googleRoad' (Google Maps aniq yo'l va bino chizmalari bilan)
  const [activeLayerKey, setActiveLayerKey] = useState('googleRoad')
  const [showLayerMenu, setShowLayerMenu] = useState(false)

  // Xavfsiz xarita ko'chishi (NaN xatolarining oldini oladi)
  const safeFlyTo = (coords, zoom, options) => {
    const map = mapInstanceRef.current
    if (!map) return
    if (!coords || isNaN(coords[0]) || isNaN(coords[1])) return

    try {
      const size = map.getSize()
      if (!size || size.x === 0 || size.y === 0) {
        map.setView(coords, zoom)
        return
      }
      map.flyTo(coords, zoom, options || { duration: 0.8, easeLinearity: 0.25 })
    } catch {
      try {
        map.setView(coords, zoom)
      } catch {
        // Xatolikni sokin o'tkazish
      }
    }
  }

  // Xaritani bir marta initsializatsiya qilish
  useEffect(() => {
    if (!mapContainerRef.current) return

    const initialRegion = REGIONS.find((r) => r.id === initialRegionRef.current) || REGIONS[1]

    const map = L.map(mapContainerRef.current, {
      zoomControl: false,
      attributionControl: true,
      maxBounds: [
        [37.0, 55.5],
        [45.8, 73.5]
      ]
    }).setView(initialRegion.coords, initialRegion.zoom)

    mapInstanceRef.current = map

    // Standart Google Maps qatlami
    const layerConfig = TILE_LAYERS.googleRoad
    const tileLayer = L.tileLayer(layerConfig.url, {
      subdomains: layerConfig.subdomains,
      maxZoom: layerConfig.maxZoom,
      attribution: layerConfig.attribution
    }).addTo(map)

    currentTileLayerRef.current = tileLayer

    const timer1 = setTimeout(() => {
      map.invalidateSize()
    }, 200)

    const resizeObserver = new ResizeObserver(() => {
      map.invalidateSize()
    })
    resizeObserver.observe(mapContainerRef.current)

    return () => {
      clearTimeout(timer1)
      resizeObserver.disconnect()
      map.remove()
      mapInstanceRef.current = null
    }
  }, [])

  // Xarita qatlami o'zgarganda (Google Road -> Google Satellite -> OSM)
  const handleSwitchLayer = (layerKey) => {
    const map = mapInstanceRef.current
    if (!map || layerKey === activeLayerKey) return

    if (currentTileLayerRef.current) {
      map.removeLayer(currentTileLayerRef.current)
    }

    const config = TILE_LAYERS[layerKey]
    const newLayer = L.tileLayer(config.url, {
      subdomains: config.subdomains,
      maxZoom: config.maxZoom,
      attribution: config.attribution
    }).addTo(map)

    currentTileLayerRef.current = newLayer
    setActiveLayerKey(layerKey)
    setShowLayerMenu(false)
  }

  // Viloyat o'zgarganda xaritani o'sha viloyat markaziga uchirish
  useEffect(() => {
    if (!mapInstanceRef.current || selectedMall) return

    const region = REGIONS.find((r) => r.id === selectedRegionId)
    if (region && region.coords) {
      safeFlyTo(region.coords, region.zoom)
    }
  }, [selectedRegionId, selectedMall])

  // Mall markerlarini yaratish va sub-piksel aniqlikda joylashtirish
  useEffect(() => {
    const map = mapInstanceRef.current
    if (!map) return

    Object.values(markersRef.current).forEach((marker) => marker.remove())
    markersRef.current = {}

    malls.forEach((mall) => {
      if (!mall.coords || isNaN(mall.coords[0]) || isNaN(mall.coords[1])) return

      const isSelected = selectedMall?.id === mall.id
      const brandsCount = mall.brands?.length || 0

      const customHtml = `
        <div class="mall-pin-marker ${isSelected ? 'active' : ''}">
          <div class="mall-pin-badge">
            <span style="width: 8px; height: 8px; border-radius: 9999px; background-color: ${isSelected ? '#34d399' : '#10b981'}; display: inline-block;"></span>
            <span>${mall.name}</span>
            <span style="font-size: 10px; font-weight: 600; padding: 2px 5px; border-radius: 6px; background-color: ${isSelected ? '#27272a' : '#f4f4f5'}; color: ${isSelected ? '#d4d4d8' : '#71717a'}; margin-left: 2px;">${brandsCount}</span>
          </div>
          <div class="mall-pin-pointer ${isSelected ? 'active' : ''}"></div>
          <div class="mall-pin-anchor-dot ${isSelected ? 'active' : ''}"></div>
        </div>
      `

      const customIcon = L.divIcon({
        className: '',
        html: customHtml,
        iconSize: [0, 0],
        iconAnchor: [0, 0]
      })

      const marker = L.marker(mall.coords, { icon: customIcon }).addTo(map)

      marker.on('click', () => {
        onSelectMall(mall)
      })

      markersRef.current[mall.id] = marker
    })
  }, [malls, selectedMall, onSelectMall])

  // Tanlangan mall koordinatalariga uchish
  useEffect(() => {
    if (!mapInstanceRef.current || !selectedMall || !selectedMall.coords) return
    safeFlyTo(selectedMall.coords, 17)
  }, [selectedMall])

  // Hududni to'liq ko'rish
  const handleResetBounds = () => {
    const map = mapInstanceRef.current
    if (!map) return
    try {
      if (malls.length > 0) {
        const validCoords = malls
          .map((m) => m.coords)
          .filter((c) => Array.isArray(c) && !isNaN(c[0]) && !isNaN(c[1]))
        if (validCoords.length > 0) {
          const bounds = L.latLngBounds(validCoords)
          map.fitBounds(bounds, { padding: [60, 60], maxZoom: 16 })
        }
      } else {
        const region = REGIONS.find((r) => r.id === selectedRegionId) || REGIONS[1]
        safeFlyTo(region.coords, region.zoom)
      }
    } catch {
      // Safe recovery
    }
  }

  return (
    <div className="relative w-full h-full min-h-[300px] overflow-hidden bg-zinc-100">
      
      {/* Asosiy Leaflet Xaritasi */}
      <div ref={mapContainerRef} className="w-full h-full" />

      {/* Tanlangan Mall haqida tezkor mini-kartochka (Pastki chap burchakda) */}
      {selectedMall && (
        <div className="absolute bottom-6 left-6 z-[400] max-w-sm bg-white/95 backdrop-blur-md p-3.5 rounded-2xl shadow-xl border border-zinc-200/90 animate-modal hidden sm:block">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 text-xs text-zinc-500 mb-0.5">
                <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span className="truncate">{selectedMall.city || selectedMall.regionName}</span>
              </div>
              <h3 className="font-bold text-sm text-zinc-900 truncate">
                {selectedMall.name}
              </h3>
              <p className="text-xs text-zinc-500 mt-0.5 truncate">
                {selectedMall.address}
              </p>
            </div>

            <div className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-amber-50 border border-amber-200 text-amber-900 text-xs font-bold shrink-0">
              <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
              <span>{selectedMall.rating}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 mt-2.5 pt-2 border-t border-zinc-100">
            <a
              href={selectedMall.googleMapsUrl || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(selectedMall.googleSearchQuery || selectedMall.coords.join(','))}`}
              target="_blank"
              rel="noreferrer"
              className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-semibold transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5 text-blue-400" />
              <span>Google Maps</span>
            </a>
            <a
              href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(selectedMall.googleSearchQuery || selectedMall.coords.join(','))}`}
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-center gap-1.5 py-1.5 px-2.5 rounded-lg bg-zinc-100 hover:bg-zinc-200 text-zinc-800 text-xs font-medium transition-colors"
              title="Marshrut chizish"
            >
              <Navigation className="w-3.5 h-3.5 text-emerald-600" />
              <span>Marshrut</span>
            </a>
          </div>
        </div>
      )}

      {/* Xarita qatlami o'zgartirgich (Google Road / Satellite / OSM) */}
      <div className="absolute top-4 right-4 z-[400] flex flex-col items-end">
        <button
          onClick={() => setShowLayerMenu(!showLayerMenu)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/95 text-zinc-800 text-xs font-semibold shadow-md border border-zinc-200/90 backdrop-blur-sm hover:bg-white transition-all cursor-pointer"
        >
          <Layers className="w-4 h-4 text-zinc-600" />
          <span>{TILE_LAYERS[activeLayerKey].name}</span>
        </button>

        {showLayerMenu && (
          <div className="mt-1.5 p-1.5 bg-white rounded-xl shadow-lg border border-zinc-200 flex flex-col gap-1 min-w-[170px] animate-modal">
            {Object.entries(TILE_LAYERS).map(([key, config]) => (
              <button
                key={key}
                onClick={() => handleSwitchLayer(key)}
                className={`text-left px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer flex items-center justify-between ${
                  activeLayerKey === key
                    ? 'bg-zinc-900 text-white font-semibold'
                    : 'text-zinc-700 hover:bg-zinc-100'
                }`}
              >
                <span>{config.name}</span>
                {activeLayerKey === key && (
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Xarita boshqaruv paneli (Zoom & Compass) */}
      <div className="absolute bottom-6 right-6 z-[400] flex flex-col gap-2">
        <button
          onClick={handleResetBounds}
          title="Hududni to'liq ko'rsatish"
          className="w-9 h-9 rounded-xl bg-white text-zinc-700 shadow-sm border border-zinc-200 flex items-center justify-center hover:bg-zinc-50 hover:text-zinc-900 transition-colors cursor-pointer"
        >
          <Compass className="w-4 h-4" />
        </button>

        <div className="flex flex-col bg-white rounded-xl shadow-sm border border-zinc-200 overflow-hidden">
          <button
            onClick={() => mapInstanceRef.current?.zoomIn()}
            title="Yaqinlashtirish"
            className="w-9 h-9 flex items-center justify-center text-zinc-700 hover:bg-zinc-50 hover:text-zinc-900 border-b border-zinc-200 transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
          </button>
          <button
            onClick={() => mapInstanceRef.current?.zoomOut()}
            title="Uzoqlashtirish"
            className="w-9 h-9 flex items-center justify-center text-zinc-700 hover:bg-zinc-50 hover:text-zinc-900 transition-colors cursor-pointer"
          >
            <Minus className="w-4 h-4" />
          </button>
        </div>
      </div>

    </div>
  )
}
