'use client'

import { useState } from 'react'
import { aprobarPago } from '@/lib/actions/admin'
import { useRouter } from 'next/navigation'

export function AprobarBoton({ asistenteId, isReenviar = false }: { asistenteId: string, isReenviar?: boolean }) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleAprobar = async () => {
    if (!confirm(`¿Seguro que deseas ${isReenviar ? 'reenviar el QR' : 'aprobar este pago y enviar el QR'}?`)) return

    setLoading(true)
    try {
      const res = await aprobarPago(asistenteId)
      if (!res.success) {
        alert('Error: ' + res.error)
      } else {
        if (res.warning) alert(res.warning)
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
      onClick={handleAprobar}
      disabled={loading}
      className={`font-bold py-2 px-4 rounded transition-colors text-sm ${
        isReenviar 
          ? 'bg-gray-700 hover:bg-gray-600 text-gray-200 disabled:bg-gray-800' 
          : 'bg-green-600 hover:bg-green-500 text-white disabled:bg-green-800'
      }`}
    >
      {loading ? 'Procesando...' : (isReenviar ? 'Reenviar Email' : 'Aprobar Pago')}
    </button>
  )
}
