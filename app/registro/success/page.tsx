'use client'

import { useSearchParams } from 'next/navigation'
import { Suspense, useState, useEffect } from 'react'
import { obtenerDatosOrden } from '@/lib/actions/registro'

function SuccessContent() {
  const searchParams = useSearchParams()
  const token = searchParams.get('t') || ''

  const [loading, setLoading] = useState(true)
  const [datos, setDatos] = useState({
    ordenId: '0000',
    nombre: 'Asistente',
    apellido: '',
    total: 5000,
    email: '',
    error: ''
  })

  useEffect(() => {
    if (!token) {
      setDatos((prev) => ({ ...prev, error: 'Acceso inválido o enlace corrupto.' }))
      setLoading(false)
      return
    }

    try {
      // Decodificar el token de forma segura
      const decodedStr = atob(token)
      const decoded = JSON.parse(decodedStr)
      const ordenId = decoded.orden

      if (!ordenId) {
        throw new Error('Identificador de orden no encontrado.')
      }

      // Consultar los datos directamente en el servidor (Base de Datos)
      obtenerDatosOrden(ordenId).then((res) => {
        if (res.success) {
          setDatos({
            ordenId,
            nombre: res.nombre || 'Asistente',
            apellido: res.apellido || '',
            total: res.total || 5000,
            email: res.email || '',
            error: ''
          })
        } else {
          setDatos((prev) => ({ ...prev, error: res.error || 'La orden no existe o fue cancelada.' }))
        }
        setLoading(false)
      })
    } catch (e: any) {
      setDatos((prev) => ({ ...prev, error: 'El enlace de confirmación es inválido o fue modificado.' }))
      setLoading(false)
    }
  }, [token])

  const telefono = '+5491123986494'
  const mensaje = `Hola, soy ${datos.nombre} ${datos.apellido} y te envío el comprobante de la orden #${datos.ordenId}`
  const urlWhatsapp = `https://wa.me/${telefono.replace('+', '')}?text=${encodeURIComponent(mensaje)}`

  if (loading) {
    return (
      <div className="bg-[#161920] border border-[#2D0A4E] p-12 rounded-3xl shadow-[0_0_40px_rgba(168,85,247,0.15)] max-w-md w-full flex flex-col items-center justify-center relative overflow-hidden">
        <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-purple-400 font-bold animate-pulse text-sm uppercase tracking-wider">Cargando tu orden...</p>
      </div>
    )
  }

  if (datos.error) {
    return (
      <div className="bg-[#161920] border border-red-500/30 p-8 rounded-3xl shadow-[0_0_40px_rgba(239,68,68,0.1)] max-w-md w-full relative overflow-hidden text-center">
        <div className="w-16 h-16 bg-red-500/10 border border-red-500/20 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-red-400 mb-2">Error de Validación</h2>
        <p className="text-gray-400 text-sm mb-6 leading-relaxed">{datos.error}</p>
        <a 
          href="/" 
          className="inline-block bg-zinc-900 border border-zinc-800 text-white font-bold py-3 px-6 rounded-xl hover:bg-zinc-800 transition-colors w-full"
        >
          Volver al Inicio
        </a>
      </div>
    )
  }

  return (
    <div className="bg-[#161920] border border-[#2D0A4E] p-8 rounded-3xl shadow-[0_0_40px_rgba(168,85,247,0.15)] max-w-md w-full relative overflow-hidden">
      {/* Decorative glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-b-full blur-[2px]"></div>

      <h1 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600 mb-2">¡Paso 1 Completado!</h1>
      <p className="text-gray-400 mb-6">Tu orden es la <span className="font-bold text-white text-lg">#{datos.ordenId}</span></p>

      <div className="bg-[#1a1e26] p-5 rounded-xl mb-6 text-left border border-[#374151] shadow-lg relative">
        <div className="absolute top-0 right-0 bg-gradient-to-r from-purple-600 to-pink-600 px-4 py-1 rounded-bl-lg rounded-tr-xl">
          <p className="font-bold text-white text-sm">TOTAL: ${datos.total.toLocaleString('es-AR')}</p>
        </div>
        <p className="text-sm text-gray-400 mb-2">Datos para la transferencia:</p>
        <p className="font-bold text-white">Alias: pecado.perreo</p>
        <p className="font-bold text-white">Titular: Alexia Camila Cassese Salim</p>
        <p className="font-bold text-white">Banco: Banco Ciudad</p>
      </div>

      <p className="text-sm text-gray-400 mb-6">
        Para confirmar tu entrada, realizá la transferencia y envianos el comprobante.
      </p>

      <a 
        href={urlWhatsapp} 
        target="_blank" 
        rel="noopener noreferrer"
        className="flex items-center justify-center gap-2 bg-[#25D366] text-white font-bold py-4 px-6 rounded-xl w-full hover:bg-[#1DA851] hover:scale-105 transition-all duration-300 shadow-[0_0_15px_rgba(37,211,102,0.3)]"
      >
        Enviar Comprobante
      </a>
    </div>
  )
}

export default function SuccessPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center bg-black bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#2D0A4E] via-black to-black">
      <Suspense fallback={
        <div className="bg-[#161920] border border-[#2D0A4E] p-12 rounded-3xl shadow-[0_0_40px_rgba(168,85,247,0.15)] max-w-md w-full flex flex-col items-center justify-center relative overflow-hidden">
          <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-purple-400 font-bold animate-pulse text-sm uppercase tracking-wider">Cargando...</p>
        </div>
      }>
        <SuccessContent />
      </Suspense>
    </div>
  )
}
