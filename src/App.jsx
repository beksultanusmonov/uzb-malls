import React, { useState, useEffect, useMemo } from 'react'
import {
  getStoredMalls,
  saveStoredMalls,
  resetStoredMalls,
  getAdminAuth,
  setAdminAuth
} from './utils/storage'
import Navbar from './components/Navbar'
import Map from './components/Map'
import MallSidebar from './components/MallSidebar'
import BrandDetailModal from './components/BrandDetailModal'
import AdminDashboard from './components/admin/AdminDashboard'
import AdminLoginModal from './components/admin/AdminLoginModal'
import { Map as MapIcon, Store, PanelLeftOpen, ChevronLeft, ChevronRight } from 'lucide-react'

export default function App() {
  // Mallar ma'lumotlari (LocalStorage bilan avtomatik sinxronlanadi)
  const [malls, setMalls] = useState(() => getStoredMalls())
  
  // Viloyat tanlash holati: 'andijon' boshlang'ich qilib qo'yildi
  const [selectedRegionId, setSelectedRegionId] = useState('andijon')
  const [selectedMall, setSelectedMall] = useState(null)
  const [activeBrandModal, setActiveBrandModal] = useState(null) // { brand, mall }
  const [searchTerm, setSearchTerm] = useState('')

  // Yon panelni yopish / ochish holati (Desktop va mobil uchun)
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)

  // Real-time soat (Har soniyada aniq mahalliy vaqt bilan yangilanadi)
  const [currentTime, setCurrentTime] = useState(() => new Date())

  // Mobil qurilmalar uchun ko'rinish holati: 'sidebar' yoki 'map'
  const [mobileView, setMobileView] = useState('sidebar')

  // Admin panel holatlari
  const [isAdminOpen, setIsAdminOpen] = useState(() => window.location.hash === '#admin')
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(() => getAdminAuth())

  // URL hash (#admin) orqali alohida kirish linkini kuzatish
  useEffect(() => {
    const checkHash = () => {
      if (window.location.hash === '#admin') {
        setIsAdminOpen(true)
      } else {
        setIsAdminOpen(false)
      }
    }

    checkHash()
    window.addEventListener('hashchange', checkHash)
    return () => window.removeEventListener('hashchange', checkHash)
  }, [])

  // Soatni har soniyada yangilab turish
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  // Admin panelni ochish / yopish
  const handleOpenAdmin = () => {
    window.location.hash = '#admin'
    setIsAdminOpen(true)
  }

  const handleCloseAdmin = () => {
    window.location.hash = ''
    setIsAdminOpen(false)
  }

  const handleAdminLoginSuccess = () => {
    setAdminAuth(true)
    setIsAdminAuthenticated(true)
  }

  const handleAdminLogout = () => {
    setAdminAuth(false)
    setIsAdminAuthenticated(false)
    handleCloseAdmin()
  }

  // ==========================================
  // MALL CRUD HARAKATLARI (Admin uchun)
  // ==========================================
  const handleAddMall = (newMall) => {
    setMalls((prev) => {
      const updated = [newMall, ...prev]
      saveStoredMalls(updated)
      return updated
    })
  }

  const handleUpdateMall = (mallId, updatedMall) => {
    setMalls((prev) => {
      const updated = prev.map((m) => (m.id === mallId ? updatedMall : m))
      saveStoredMalls(updated)
      return updated
    })
    if (selectedMall?.id === mallId) {
      setSelectedMall(updatedMall)
    }
  }

  const handleDeleteMall = (mallId) => {
    setMalls((prev) => {
      const updated = prev.filter((m) => m.id !== mallId)
      saveStoredMalls(updated)
      return updated
    })
    if (selectedMall?.id === mallId) {
      setSelectedMall(null)
    }
  }

  // ==========================================
  // BRAND CRUD HARAKATLARI (Admin uchun)
  // ==========================================
  const handleAddBrand = (mallId, newBrand) => {
    setMalls((prev) => {
      const updated = prev.map((m) => {
        if (m.id !== mallId) return m
        return {
          ...m,
          brands: [...(m.brands || []), newBrand]
        }
      })
      saveStoredMalls(updated)
      return updated
    })

    if (selectedMall?.id === mallId) {
      setSelectedMall((prev) => ({
        ...prev,
        brands: [...(prev.brands || []), newBrand]
      }))
    }
  }

  const handleUpdateBrand = (mallId, brandId, updatedBrand) => {
    setMalls((prev) => {
      const updated = prev.map((m) => {
        if (m.id !== mallId) return m
        return {
          ...m,
          brands: (m.brands || []).map((b) => (b.id === brandId ? updatedBrand : b))
        }
      })
      saveStoredMalls(updated)
      return updated
    })

    if (selectedMall?.id === mallId) {
      setSelectedMall((prev) => ({
        ...prev,
        brands: (prev.brands || []).map((b) => (b.id === brandId ? updatedBrand : b))
      }))
    }
  }

  const handleDeleteBrand = (mallId, brandId) => {
    setMalls((prev) => {
      const updated = prev.map((m) => {
        if (m.id !== mallId) return m
        return {
          ...m,
          brands: (m.brands || []).filter((b) => b.id !== brandId)
        }
      })
      saveStoredMalls(updated)
      return updated
    })

    if (selectedMall?.id === mallId) {
      setSelectedMall((prev) => ({
        ...prev,
        brands: (prev.brands || []).filter((b) => b.id !== brandId)
      }))
    }
  }

  // Boshlang'ich holatga qaytarish (Reset)
  const handleResetMalls = () => {
    const defaultData = resetStoredMalls()
    setMalls(defaultData)
    setSelectedMall(null)
  }

  // Viloyat o'zgarganda
  const handleSelectRegion = (regionId) => {
    setSelectedRegionId(regionId)
    setSelectedMall(null)
  }

  // Mall tanlanganda
  const handleSelectMall = (mall) => {
    setSelectedMall(mall)
    setIsSidebarOpen(true)
    setMobileView('sidebar')
  }

  // Yon panelni ochish / yopish
  const handleToggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev)
  }

  // Barcha mallarga qaytish
  const handleBackToMalls = () => {
    setSelectedMall(null)
  }

  // Brend tanlanganda (Modal ochish)
  const handleSelectBrand = (brand, mall) => {
    setActiveBrandModal({ brand, mall })
  }

  // Xaritada ko'rsatiladigan mallar ro'yxati (Tanlangan viloyatga mos)
  const mapMalls = useMemo(() => {
    if (selectedRegionId === 'all') return malls
    return malls.filter((m) => m.regionId === selectedRegionId)
  }, [malls, selectedRegionId])

  // Jami brendlar soni
  const totalBrandsCount = malls.reduce((acc, m) => acc + (m.brands?.length || 0), 0)

  // ==========================================
  // AGAR ADMIN PANEL OCHIQ BO'LSA
  // ==========================================
  if (isAdminOpen) {
    if (!isAdminAuthenticated) {
      return (
        <AdminLoginModal
          onLoginSuccess={handleAdminLoginSuccess}
          onCancel={handleCloseAdmin}
        />
      )
    }

    return (
      <AdminDashboard
        malls={malls}
        onAddMall={handleAddMall}
        onUpdateMall={handleUpdateMall}
        onDeleteMall={handleDeleteMall}
        onAddBrand={handleAddBrand}
        onUpdateBrand={handleUpdateBrand}
        onDeleteBrand={handleDeleteBrand}
        onResetMalls={handleResetMalls}
        onLogout={handleAdminLogout}
        onCloseAdmin={handleCloseAdmin}
        currentTime={currentTime}
      />
    )
  }

  // ==========================================
  // ASOSIY FOYDALANUVChI KO'RINISHI
  // ==========================================
  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-white text-zinc-900 font-sans antialiased">
      
      {/* 1. Yuqori Navigatsiya (Viloyat tanlash, Qidiruv, Yon panel va Admin linki bilan) */}
      <Navbar
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        currentTime={currentTime}
        totalMalls={malls.length}
        totalBrands={totalBrandsCount}
        selectedRegionId={selectedRegionId}
        onSelectRegion={handleSelectRegion}
        onOpenAdmin={handleOpenAdmin}
        isSidebarOpen={isSidebarOpen}
        onToggleSidebar={handleToggleSidebar}
      />

      {/* 2. Asosiy Maydon (Sidebar + Xarita) */}
      <main className="flex-1 relative flex flex-col lg:flex-row overflow-hidden">
        
        {/* Mobil uchun sodda tab boshqaruvi */}
        <div className="lg:hidden flex border-b border-zinc-200 bg-white shrink-0">
          <button
            onClick={() => setMobileView('sidebar')}
            className={`flex-1 py-2.5 text-xs font-semibold flex items-center justify-center gap-2 border-b-2 transition-colors cursor-pointer ${
              mobileView === 'sidebar'
                ? 'border-zinc-900 text-zinc-900 bg-zinc-50'
                : 'border-transparent text-zinc-500 hover:text-zinc-700'
            }`}
          >
            <Store className="w-4 h-4" />
            <span>{selectedMall ? selectedMall.name : 'Mallar & Do\'konlar'}</span>
          </button>

          <button
            onClick={() => setMobileView('map')}
            className={`flex-1 py-2.5 text-xs font-semibold flex items-center justify-center gap-2 border-b-2 transition-colors cursor-pointer ${
              mobileView === 'map'
                ? 'border-zinc-900 text-zinc-900 bg-zinc-50'
                : 'border-transparent text-zinc-500 hover:text-zinc-700'
            }`}
          >
            <MapIcon className="w-4 h-4" />
            <span>Xarita</span>
          </button>
        </div>

        {/* Chap Tomon: Yon Panel (Viloyatlar kesimi, Mallar va Brendlar ro'yxati) */}
        <div
          className={`h-full shrink-0 transition-all duration-300 ease-in-out ${
            mobileView === 'sidebar' ? 'block' : 'hidden lg:block'
          } ${
            isSidebarOpen ? 'w-full lg:w-[460px] xl:w-[480px]' : 'w-0 overflow-hidden border-none'
          }`}
        >
          <div className="w-full lg:w-[460px] xl:w-[480px] h-full">
            <MallSidebar
              malls={malls}
              selectedMall={selectedMall}
              onSelectMall={handleSelectMall}
              onBackToMalls={handleBackToMalls}
              onSelectBrand={handleSelectBrand}
              currentTime={currentTime}
              globalSearchTerm={searchTerm}
              selectedRegionId={selectedRegionId}
              onSelectRegion={handleSelectRegion}
              onToggleSidebar={() => {
                setIsSidebarOpen(false)
                setMobileView('map')
              }}
            />
          </div>
        </div>

        {/* O'ng Tomon: Interaktiv Umumiy Xarita */}
        <div
          className={`flex-1 h-full relative ${
            mobileView === 'map' ? 'block' : 'hidden lg:block'
          }`}
        >
          {/* Panel yopilganda qayta ochish uchun suzuvchi tugma */}
          {!isSidebarOpen && (
            <div className="absolute top-4 left-4 z-[400] flex items-center gap-2 animate-modal">
              <button
                onClick={() => setIsSidebarOpen(true)}
                className="flex items-center gap-2 px-3.5 py-2.5 bg-white/95 hover:bg-white text-zinc-900 rounded-xl shadow-lg border border-zinc-200/90 font-medium text-xs backdrop-blur-xs transition-all hover:shadow-xl cursor-pointer hover:border-zinc-300"
                title="Savdo majmualari panelini ochish"
              >
                <PanelLeftOpen className="w-4 h-4 text-emerald-600" />
                <span className="font-semibold">
                  {selectedMall ? selectedMall.name : 'Savdo majmualari'}
                </span>
                <span className="px-1.5 py-0.5 text-[10px] bg-zinc-100 rounded-md font-bold text-zinc-600">
                  {selectedMall ? 'Do\'konlar' : `${malls.length} ta`}
                </span>
              </button>

              {selectedMall && (
                <button
                  onClick={() => {
                    setSelectedMall(null)
                    setIsSidebarOpen(true)
                  }}
                  className="flex items-center gap-1.5 px-3 py-2.5 bg-white/95 hover:bg-white text-zinc-700 hover:text-zinc-900 rounded-xl shadow-lg border border-zinc-200/90 font-medium text-xs backdrop-blur-xs transition-all hover:shadow-xl cursor-pointer"
                  title="Barcha savdo majmualari ro'yxatiga o'tish"
                >
                  <span>Barcha mallar</span>
                </button>
              )}
            </div>
          )}

          {/* Qirra bo'ylab tezkor yopish/ochish tugmasi (Desktop Edge Tab) */}
          <button
            onClick={handleToggleSidebar}
            className="hidden lg:flex absolute top-5 left-0 z-[400] items-center justify-center w-5.5 h-10 bg-white hover:bg-zinc-50 text-zinc-600 hover:text-zinc-900 border border-zinc-200 shadow-md transition-all cursor-pointer rounded-r-lg"
            title={isSidebarOpen ? "Yon panelni yopish (Xaritani to'liq ko'rish)" : "Savdo majmualari panelini ochish"}
          >
            {isSidebarOpen ? (
              <ChevronLeft className="w-3.5 h-3.5" />
            ) : (
              <ChevronRight className="w-3.5 h-3.5" />
            )}
          </button>

          <Map
            malls={mapMalls}
            selectedMall={selectedMall}
            onSelectMall={handleSelectMall}
            selectedRegionId={selectedRegionId}
          />
        </div>

      </main>

      {/* 3. Brendning To'liq Ma'lumot Modali (Ayni vaqtdagi ochiq/yopiqlik holati) */}
      {activeBrandModal && (
        <BrandDetailModal
          brand={activeBrandModal.brand}
          mall={activeBrandModal.mall}
          onClose={() => setActiveBrandModal(null)}
          currentTime={currentTime}
        />
      )}

    </div>
  )
}
