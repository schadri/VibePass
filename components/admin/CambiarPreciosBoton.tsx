'use client'

import { useState, useEffect } from 'react'
import { obtenerPrecios, actualizarPrecios } from '@/lib/actions/registro'

export function CambiarPreciosBoton() {
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [prices, setPrices] = useState({ simple: 5000, doble: 8500, puerta: 10000 })

  useEffect(() => {
    if (isOpen) {
      obtenerPrecios().then(setPrices)
    }
  }, [isOpen])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    const result = await actualizarPrecios(prices.simple, prices.doble, prices.puerta)

    if (result.success) {
      setMessage('Precios actualizados con éxito!')
      setTimeout(() => {
        setIsOpen(false)
        setMessage('')
      }, 1500)
    } else {
      setMessage(`Error: ${result.error}`)
    }
    setLoading(false)
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold py-2.5 px-6 rounded-xl hover:opacity-90 transition-all shadow-[0_0_15px_rgba(168,85,247,0.3)] active:scale-[0.98] flex items-center gap-2 text-sm"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 3m0-3a2 2 0 110 3m-3.793-.117l1.414-1.414m0 0a2 2 0 102.828 2.828m-2.828-2.828a2 2 0 012.828 2.828m-.117 3.793l1.414 1.414m0 0a2 2 0 102.828-2.828m-2.828 2.828a2 2 0 01-2.828-2.828m-.117-3.793L6.343 6.343m0 0a2 2 0 10-2.828 2.828m2.828-2.828a2 2 0 01-2.828 2.828" />
        </svg>
        Cambiar Precios
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
          <div className="absolute inset-0" onClick={() => setIsOpen(false)} />
          
          <div className="relative w-full max-w-md p-6 sm:p-8 bg-[#161920]/95 border border-[#2D0A4E] rounded-3xl shadow-[0_0_50px_rgba(168,85,247,0.25)] backdrop-blur-md animate-scale-in text-left">
            <button 
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 text-zinc-400 hover:text-white transition-colors p-2 rounded-full hover:bg-white/10"
              aria-label="Cerrar modal"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <h3 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600 mb-6 text-center uppercase">
              Actualizar Precios
            </h3>

            {message && (
              <div className={`p-3 rounded-xl text-center text-sm mb-4 border ${
                message.startsWith('Error') 
                  ? 'bg-red-500/10 border-red-500/30 text-red-400' 
                  : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
              }`}>
                {message}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-purple-400 uppercase tracking-wider ml-2">Entrada Simple ($)</label>
                <input 
                  type="number" 
                  value={prices.simple} 
                  onChange={(e) => setPrices({ ...prices, simple: parseInt(e.target.value) || 0 })}
                  required 
                  className="p-4 bg-[#1f242e] border border-[#374151] rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none text-white transition-all" 
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-purple-400 uppercase tracking-wider ml-2">Promo 2 Entradas ($)</label>
                <input 
                  type="number" 
                  value={prices.doble} 
                  onChange={(e) => setPrices({ ...prices, doble: parseInt(e.target.value) || 0 })}
                  required 
                  className="p-4 bg-[#1f242e] border border-[#374151] rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none text-white transition-all" 
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-purple-400 uppercase tracking-wider ml-2">Entrada en Puerta ($)</label>
                <input 
                  type="number" 
                  value={prices.puerta} 
                  onChange={(e) => setPrices({ ...prices, puerta: parseInt(e.target.value) || 0 })}
                  required 
                  className="p-4 bg-[#1f242e] border border-[#374151] rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none text-white transition-all" 
                />
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className="w-full mt-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold p-4 rounded-xl hover:opacity-90 disabled:opacity-50 transition-all shadow-[0_0_20px_rgba(168,85,247,0.4)] active:scale-[0.98]"
              >
                {loading ? 'Guardando...' : 'Confirmar Cambios'}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
