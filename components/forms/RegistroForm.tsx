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
      
      router.push(`/registro/success?orden=${result.orden_id}&nombre=${result.nombre}`)
    } catch (err: any) {
      setError(err.message || 'Hubo un error en el registro')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 max-w-md mx-auto w-full p-4">
      {error && <div className="bg-red-100 text-red-600 p-3 rounded-md">{error}</div>}
      
      <input type="text" name="nombre" placeholder="Nombre" required className="p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 text-black" />
      <input type="text" name="apellido" placeholder="Apellido" required className="p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 text-black" />
      <input type="text" name="dni" placeholder="DNI" required className="p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 text-black" />
      <input type="email" name="email" placeholder="Email" required className="p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 text-black" />
      <input type="text" name="numero_referencia" placeholder="Número de Referencia (Opcional)" className="p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 text-black" />
      
      <button disabled={loading} className="bg-black text-white font-bold p-3 rounded-lg hover:bg-gray-800 disabled:bg-gray-400">
        {loading ? 'Procesando...' : 'Completar Registro'}
      </button>
    </form>
  )
}
