'use client'

import { useState } from 'react'
import { aprobarPago } from '@/lib/actions/admin'
import { useRouter } from 'next/navigation'

export function AprobarBoton({ asistenteId }: { asistenteId: string }) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleAprobar = async () => {
    if (!confirm('¿Seguro que deseas aprobar este pago y enviar el QR?')) return

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
      className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:bg-blue-400 transition-colors"
    >
      {loading ? 'Aprobando...' : 'Aprobar Pago'}
    </button>
  )
}
