import React, { useState } from 'react'
import { ShieldCheck, Lock, ArrowLeft, KeyRound, AlertCircle } from 'lucide-react'

export default function AdminLoginModal({
  onLoginSuccess,
  onCancel
}) {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const handleLogin = (e) => {
    e.preventDefault()
    // Standart admin parollari: admin, admin123, 2026
    if (password === 'admin' || password === 'admin123' || password === '2026') {
      onLoginSuccess()
    } else {
      setError('Parol noto\'g\'ri!')
    }
  }

  const handleQuickDemoLogin = () => {
    setPassword('admin123')
    onLoginSuccess()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/60 backdrop-blur-xs">
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-zinc-200 overflow-hidden animate-modal">
        
        {/* Yuqori Banner */}
        <div className="p-6 bg-zinc-900 text-white text-center relative">
          <button
            onClick={onCancel}
            className="absolute top-4 left-4 inline-flex items-center gap-1 text-xs text-zinc-400 hover:text-white transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Asosiy sahifaga</span>
          </button>

          <div className="w-12 h-12 rounded-2xl bg-zinc-800 text-emerald-400 flex items-center justify-center mx-auto mb-3 border border-zinc-700/80 shadow-md">
            <ShieldCheck className="w-6 h-6" />
          </div>

          <h3 className="font-bold text-lg text-white">
            MALLs Admin Portali
          </h3>
          <p className="text-xs text-zinc-400 mt-1">
            Savdo majmualari va brendlarni to'liq nazorat qilish
          </p>
        </div>

        {/* Form Body */}
        <form onSubmit={handleLogin} className="p-6 space-y-4">
          
          <div>
            <label className="block text-xs font-semibold text-zinc-700 mb-1.5">
              Admin parolini kiriting
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value)
                  if (error) setError('')
                }}
                placeholder="Parol..."
                autoFocus
                className="w-full pl-9 pr-3 py-2.5 text-xs sm:text-sm bg-zinc-50 border border-zinc-200 rounded-xl outline-none focus:bg-white focus:border-zinc-400 transition-colors"
              />
            </div>
            {error && (
              <p className="text-xs text-rose-600 mt-1.5 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>{error}</span>
              </p>
            )}
          </div>

          {/* Tugmalar */}
          <div className="pt-2 flex flex-col gap-2">
            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white font-semibold text-xs transition-colors cursor-pointer shadow-xs"
            >
              Admin panelga kirish
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="w-full py-2.5 rounded-xl border border-zinc-200 text-zinc-600 hover:bg-zinc-100 font-medium text-xs transition-colors cursor-pointer"
            >
              Bekor qilish
            </button>
          </div>

        </form>

      </div>
    </div>
  )
}
