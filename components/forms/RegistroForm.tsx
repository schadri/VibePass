'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { registrarAsistente, obtenerPrecios } from '@/lib/actions/registro'

export function RegistroForm() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [is2x1, setIs2x1] = useState(false)
  const [precios, setPrecios] = useState({ simple: 5000, doble: 8500 })

  useEffect(() => {
    obtenerPrecios().then(setPrecios)
  }, [])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const formData = new FormData(e.currentTarget)
    
    try {
      const result = await registrarAsistente(formData)
      if (result.error) throw new Error(result.error)
      
      const payload = { orden: (result as any).orden_id }
      const token = btoa(JSON.stringify(payload))
      router.push(`/registro/success?t=${token}`)
    } catch (err: any) {
      setError(err.message || 'Hubo un error en el registro')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 max-w-md mx-auto w-full p-4">
      {error && <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-3 rounded-xl text-center text-sm">{error}</div>}
      
      <div className="space-y-4">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-bold text-purple-400 uppercase tracking-wider ml-2">Tus Datos (Titular)</label>
          <input type="text" name="nombre" placeholder="Tu Nombre" required className="p-4 bg-[#1f242e] border border-[#374151] rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none text-white placeholder-gray-500 transition-all" />
          <input type="text" name="apellido" placeholder="Tu Apellido" required className="p-4 bg-[#1f242e] border border-[#374151] rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none text-white placeholder-gray-500 transition-all" />
          <input type="text" name="dni" placeholder="Tu DNI / Pasaporte" required className="p-4 bg-[#1f242e] border border-[#374151] rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none text-white placeholder-gray-500 transition-all" />
          <input type="email" name="email" placeholder="Tu Email (Aquí recibirás los QR)" required className="p-4 bg-[#1f242e] border border-[#374151] rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none text-white placeholder-gray-500 transition-all" />
        </div>

        {/* Toggle 2x1 */}
        <div className="bg-[#1a1e26] p-4 rounded-2xl border border-[#2D0A4E] shadow-inner">
          <label className="flex items-center justify-between cursor-pointer">
            <span className="text-sm font-bold text-white">🎟️ Activar Promo 2 Entradas</span>
            <div className="relative inline-flex items-center">
              <input 
                type="checkbox" 
                name="es_2x1"
                checked={is2x1}
                onChange={(e) => setIs2x1(e.target.checked)}
                className="sr-only peer" 
              />
              <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
            </div>
          </label>
          <p className="text-[10px] text-gray-500 mt-2">Marcá esta casilla si venís con alguien más. Se enviará un solo correo con 2 entradas.</p>
        </div>

        {/* Campos Acompañante */}
        {is2x1 && (
          <div className="flex flex-col gap-1 pt-2 animate-in fade-in slide-in-from-top-2 duration-300">
            <label className="text-xs font-bold text-pink-400 uppercase tracking-wider ml-2">Datos del Acompañante</label>
            <input type="text" name="acompanante_nombre" placeholder="Nombre Acompañante" required={is2x1} className="p-4 bg-[#1f242e] border border-[#374151] rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none text-white placeholder-gray-500 transition-all" />
            <input type="text" name="acompanante_apellido" placeholder="Apellido Acompañante" required={is2x1} className="p-4 bg-[#1f242e] border border-[#374151] rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none text-white placeholder-gray-500 transition-all" />
            <input type="text" name="acompanante_dni" placeholder="DNI Acompañante" required={is2x1} className="p-4 bg-[#1f242e] border border-[#374151] rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none text-white placeholder-gray-500 transition-all" />
          </div>
        )}
      </div>
      
      <button disabled={loading} className="mt-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold p-4 rounded-xl hover:opacity-90 disabled:opacity-50 transition-all shadow-[0_0_20px_rgba(168,85,247,0.4)] active:scale-[0.98]">
        {loading ? 'Procesando...' : 'Completar Registro'}
      </button>
    </form>
  )
}
