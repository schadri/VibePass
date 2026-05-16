'use client'

import { useState } from 'react'
import { borrarAsistente } from '@/lib/actions/admin'
import { useRouter } from 'next/navigation'

export function BorrarBoton({ asistenteId }: { asistenteId: string }) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleBorrar = async () => {
    if (!confirm('¿Estás SEGURO que deseas ELIMINAR a este asistente por completo? Esta acción no se puede deshacer.')) return

    setLoading(true)
    try {
      const res = await borrarAsistente(asistenteId)
      if (!res.success) {
        alert('Error: ' + res.error)
      } else {
        router.refresh()
      }
    } catch (error) {
      alert('Error en servidor')
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleBorrar}
      disabled={loading}
      className="bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/30 font-bold py-2 px-4 rounded transition-colors text-sm disabled:opacity-50"
    >
      {loading ? 'Borrando...' : 'Borrar'}
    </button>
  )
}
