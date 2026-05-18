'use client'

import { useState } from 'react'

interface CompartirGrupoBotonProps {
  nombre: string
  apellido: string
  qrToken: string
}

export function CompartirGrupoBoton({ nombre, apellido, qrToken }: CompartirGrupoBotonProps) {
  const [isCopied, setIsCopied] = useState(false)

  const getGrupoUrl = () => {
    if (typeof window !== 'undefined') {
      return `${window.location.origin}/grupo/${qrToken}`
    }
    return `/grupo/${qrToken}`
  }

  const handleCopy = async () => {
    const url = getGrupoUrl()
    try {
      await navigator.clipboard.writeText(url)
      setIsCopied(true)
      setTimeout(() => setIsCopied(false), 1500)
    } catch (err) {
      console.error('Error al copiar link del grupo:', err)
    }
  }

  const handleShareWhatsApp = () => {
    const url = getGrupoUrl()
    const rawMessage = `¡Hola ${nombre}! Acá tenés tu panel de control para que repartas las entradas de tus invitados por WhatsApp 1 por 1: ${url} 🎫🔥`
    const encodedText = encodeURIComponent(rawMessage)
    const whatsappUrl = `https://api.whatsapp.com/send?text=${encodedText}`
    window.open(whatsappUrl, '_blank')
  }

  return (
    <div className="inline-flex items-center gap-1 bg-[#1e1135]/50 border border-purple-500/20 p-1 rounded-xl">
      <span className="text-[10px] font-black text-purple-400 uppercase tracking-widest px-2 hidden xl:inline-block">Panel Grupo</span>
      
      {/* WhatsApp Share */}
      <button
        onClick={handleShareWhatsApp}
        className="bg-emerald-600/90 hover:bg-emerald-500 text-white p-2 rounded-lg transition-colors cursor-pointer"
        title="Enviar link de panel por WhatsApp"
      >
        <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.746.953 3.71 1.458 5.706 1.463h.008c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
        </svg>
      </button>

      {/* Copy Link */}
      <button
        onClick={handleCopy}
        className={`p-2 rounded-lg transition-colors cursor-pointer ${
          isCopied ? 'bg-purple-600 text-white' : 'bg-purple-900/50 hover:bg-purple-800 text-purple-200'
        }`}
        title="Copiar link de panel del grupo"
      >
        {isCopied ? (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
          </svg>
        )}
      </button>
    </div>
  )
}
