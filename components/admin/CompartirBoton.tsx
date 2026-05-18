'use client'

import { useState } from 'react'

interface CompartirBotonProps {
  nombre: string
  apellido: string
  qrToken: string
}

export function CompartirBoton({ nombre, apellido, qrToken }: CompartirBotonProps) {
  const [copiado, setCopiado] = useState(false)

  // Obtener la URL base dinámicamente en el navegador
  const getTicketUrl = () => {
    if (typeof window !== 'undefined') {
      return `${window.location.origin}/ticket/${qrToken}`
    }
    return ''
  }

  const handleCopiar = async () => {
    const url = getTicketUrl()
    if (!url) return

    try {
      await navigator.clipboard.writeText(url)
      setCopiado(true)
      setTimeout(() => setCopiado(false), 2000)
    } catch (err) {
      console.error('Error al copiar enlace:', err)
    }
  }

  const handleCompartirWhatsApp = () => {
    const url = getTicketUrl()
    if (!url) return

    const mensaje = `¡Hola ${nombre} ${apellido}! Acá tenés tu entrada para Pecado & Perreo: ${url} 🎫🔥`
    const urlWa = `https://api.whatsapp.com/send?text=${encodeURIComponent(mensaje)}`
    window.open(urlWa, '_blank', 'noopener,noreferrer')
  }

  return (
    <div className="flex items-center gap-1.5 inline-flex">
      {/* Botón WhatsApp */}
      <button
        onClick={handleCompartirWhatsApp}
        title="Enviar por WhatsApp"
        className="flex items-center justify-center p-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 hover:border-emerald-500/40 transition-all duration-200 active:scale-95 shadow-md shadow-emerald-950/20"
      >
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.457L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.37 9.864-9.799.002-2.63-1.023-5.101-2.885-6.963C16.588 2.02 14.12 1.02 11.522 1.02 6.082 1.02 1.66 5.391 1.657 10.82c-.001 1.685.441 3.325 1.288 4.776l-.99 3.616 3.702-.958zm12.355-6.626c-.33-.165-1.951-.951-2.253-1.061-.301-.11-.52-.165-.74.165-.22.33-.85.827-1.04 1.048-.19.22-.38.247-.71.082-.33-.165-1.391-.506-2.65-1.619-.98-.864-1.64-1.932-1.83-2.262-.19-.33-.02-.508.145-.671.15-.147.33-.382.495-.572.165-.19.22-.325.33-.541.11-.216.055-.407-.03-.572-.085-.165-.74-1.76-.995-2.39-.24-.59-.51-.51-.71-.51-.18 0-.39-.02-.6-.02s-.55.08-.84.4c-.29.32-1.1 1.07-1.1 2.61 0 1.54 1.13 3.03 1.29 3.25.16.22 2.22 3.35 5.38 4.69.75.32 1.34.51 1.8.65.76.24 1.45.2 2 .12.61-.09 1.95-.79 2.22-1.52.27-.73.27-1.35.19-1.48-.08-.13-.3-.21-.63-.38z"/>
        </svg>
      </button>

      {/* Botón Copiar Link */}
      <button
        onClick={handleCopiar}
        title="Copiar enlace"
        className={`flex items-center gap-1 p-2 rounded-xl text-xs font-bold border transition-all duration-200 active:scale-95 shadow-md ${
          copiado
            ? 'bg-purple-600 text-white border-purple-500'
            : 'bg-[#1f242e] hover:bg-[#2a313d] text-purple-400 border-[#374151] hover:border-purple-500/50 shadow-black/30'
        }`}
      >
        {copiado ? (
          <>
            <svg className="w-4 h-4 animate-in zoom-in-50 duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            <span className="text-[10px] pr-0.5">¡Copiado!</span>
          </>
        ) : (
          <>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
            </svg>
          </>
        )}
      </button>
    </div>
  )
}
