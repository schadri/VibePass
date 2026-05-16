'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { registrarAsistente } from '@/lib/actions/registro'

export function RegistroForm() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const formData = new FormData(e.currentTarget)
    
    try {
      const result = await registrarAsistente(formData)
      if (result.error) throw new Error(result.error)
      
      router.push(`/registro/success?orden=${(result as any).orden_id}&nombre=${(result as any).nombre}&apellido=${(result as any).apellido}`)
    } catch (err: any) {
      setError(err.message || 'Hubo un error en el registro')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 max-w-md mx-auto w-full p-4">
      {error && <div className="bg-red-100 text-red-600 p-3 rounded-md">{error}</div>}
      
      <input type="text" name="nombre" placeholder="Nombre" required className="p-4 bg-[#1f242e] border border-[#374151] rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none text-white placeholder-gray-500 transition-all" />
      <input type="text" name="apellido" placeholder="Apellido" required className="p-4 bg-[#1f242e] border border-[#374151] rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none text-white placeholder-gray-500 transition-all" />
      <input type="text" name="dni" placeholder="DNI" required className="p-4 bg-[#1f242e] border border-[#374151] rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none text-white placeholder-gray-500 transition-all" />
      <input type="email" name="email" placeholder="Email" required className="p-4 bg-[#1f242e] border border-[#374151] rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none text-white placeholder-gray-500 transition-all" />
      
      <button disabled={loading} className="mt-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold p-4 rounded-xl hover:opacity-90 disabled:opacity-50 transition-all shadow-[0_0_20px_rgba(168,85,247,0.4)]">
        {loading ? 'Procesando...' : 'Completar Registro'}
      </button>
    </form>
  )
}
