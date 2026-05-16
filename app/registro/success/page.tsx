'use client'

import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

function SuccessContent() {
  const searchParams = useSearchParams()
  const nombre = searchParams.get('nombre') || 'Asistente'
  const orden_id = searchParams.get('orden') || '0000'

  const telefonoDestino = '5491100000000' // Reemplazar con tu número
  const textoWhatsApp = `Hola, soy ${nombre} y te envío el comprobante de la orden #${orden_id}`
  const urlWhatsApp = `https://wa.me/${telefonoDestino}?text=${encodeURIComponent(textoWhatsApp)}`

  return (
    <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full">
      <h1 className="text-2xl font-black text-green-600 mb-2">¡Paso 1 Completado!</h1>
      <p className="text-gray-600 mb-6">Tu orden es la <span className="font-bold text-black text-lg">#{orden_id}</span></p>

      <div className="bg-gray-50 p-4 rounded-lg mb-6 text-left border border-gray-200">
        <p className="text-sm text-gray-500 mb-2">Datos para la transferencia:</p>
        <p className="font-bold text-gray-800">CBU/CVU: 0000000000000000000000</p>
        <p className="font-bold text-gray-800">Alias: la.fiesta.mp</p>
      </div>

      <p className="text-sm text-gray-600 mb-4">
        Para confirmar tu entrada, realiza la transferencia y envíanos el comprobante.
      </p>

      <a 
        href={urlWhatsApp} 
        target="_blank" 
        rel="noopener noreferrer"
        className="flex items-center justify-center gap-2 bg-[#25D366] text-white font-bold py-4 px-6 rounded-xl w-full hover:bg-[#1DA851] transition-colors"
      >
        Enviar Comprobante por WhatsApp
      </a>
    </div>
  )
}

export default function SuccessPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center bg-gray-50">
      <Suspense fallback={<div>Cargando...</div>}>
        <SuccessContent />
      </Suspense>
    </div>
  )
}
