'use client'

import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

function SuccessContent() {
  const searchParams = useSearchParams()
  const nombre = searchParams.get('nombre') || 'Asistente'
  const apellido = searchParams.get('apellido') || ''
  const orden_id = searchParams.get('orden') || '0000'

  const telefono = '+5491123986494'
  const mensaje = `Hola, soy ${nombre} ${apellido} y te envío el comprobante de la orden #${orden_id}`
  const urlWhatsapp = `https://wa.me/${telefono.replace('+', '')}?text=${encodeURIComponent(mensaje)}`

  return (
    <div className="bg-[#161920] border border-[#2D0A4E] p-8 rounded-3xl shadow-[0_0_40px_rgba(168,85,247,0.15)] max-w-md w-full relative overflow-hidden">
      {/* Decorative glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-b-full blur-[2px]"></div>

      <h1 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600 mb-2">¡Paso 1 Completado!</h1>
      <p className="text-gray-400 mb-6">Tu orden es la <span className="font-bold text-white text-lg">#{orden_id}</span></p>

      <div className="bg-[#1a1e26] p-5 rounded-xl mb-6 text-left border border-[#374151] shadow-lg relative">
        <div className="absolute top-0 right-0 bg-gradient-to-r from-purple-600 to-pink-600 px-4 py-1 rounded-bl-lg rounded-tr-xl">
          <p className="font-bold text-white text-sm">TOTAL: $6000</p>
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
      <Suspense fallback={<div className="text-purple-400 font-bold animate-pulse">Cargando...</div>}>
        <SuccessContent />
      </Suspense>
    </div>
  )
}
