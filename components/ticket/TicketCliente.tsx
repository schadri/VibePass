'use client'

import { useState } from 'react'

interface Asistente {
  id: string
  nombre: string
  apellido: string
  dni: string
  email: string
  orden_id: string
  qr_token: string
  titular_id: string | null
  estado_pago: string
}

interface TicketClienteProps {
  asistente: Asistente
  qrBase64: string
}

export function TicketCliente({ asistente, qrBase64 }: TicketClienteProps) {
  const [downloading, setDownloading] = useState(false)
  const isAprobado = asistente.estado_pago === 'aprobado'
  const isTitular = asistente.titular_id === null

  const handleDownload = () => {
    if (!isAprobado || !qrBase64) return
    setDownloading(true)

    // Crear canvas para exportar de forma limpia y con resolución ultra alta
    const canvas = document.createElement('canvas')
    canvas.width = 600
    canvas.height = 700
    const ctx = canvas.getContext('2d')
    if (!ctx) {
      setDownloading(false)
      return
    }

    // 1. Fondo de gradiente premium
    const gradient = ctx.createLinearGradient(0, 0, 600, 700)
    gradient.addColorStop(0, '#18052b')
    gradient.addColorStop(1, '#000000')
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, 600, 700)

    // Borde discontinuo (dashed) violeta
    ctx.strokeStyle = '#e22a8e'
    ctx.lineWidth = 2
    ctx.setLineDash([8, 6])
    ctx.strokeRect(15, 15, 570, 670)
    ctx.setLineDash([]) // Resetear guiones

    // 2. Dibujar píldora superior (Pill)
    const pillGradient = ctx.createLinearGradient(160, 45, 440, 45)
    pillGradient.addColorStop(0, '#9333ea')
    pillGradient.addColorStop(1, '#db2777')
    ctx.fillStyle = pillGradient
    ctx.beginPath()
    ctx.roundRect(150, 40, 300, 46, 23)
    ctx.fill()

    // Texto de la píldora
    ctx.fillStyle = '#ffffff'
    ctx.font = '900 15px sans-serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    const accessText = isTitular ? 'TITULAR' : 'ACOMPAÑANTE'
    ctx.fillText(`ENTRADA #${asistente.orden_id} (${accessText})`, 300, 63)

    // 3. Dibujar QR en el medio
    const qrImg = new Image()
    qrImg.crossOrigin = 'anonymous'
    qrImg.src = qrBase64
    qrImg.onload = () => {
      // Fondo blanco redondeado para el QR
      ctx.fillStyle = '#ffffff'
      ctx.beginPath()
      ctx.roundRect(140, 140, 320, 320, 24)
      ctx.fill()

      // Imagen del código QR
      ctx.drawImage(qrImg, 160, 160, 280, 280)

      // 4. Línea divisoria
      ctx.strokeStyle = 'rgba(168, 85, 247, 0.25)'
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.moveTo(35, 540)
      ctx.lineTo(565, 540)
      ctx.stroke()

      // 5. Textos del pie (Nombre y DNI)
      // Etiquetas (Labels) en morado/rosa
      ctx.fillStyle = '#c084fc'
      ctx.font = 'bold 12px sans-serif'
      
      ctx.textAlign = 'left'
      ctx.fillText('NOMBRE', 60, 580)

      ctx.textAlign = 'right'
      ctx.fillText('DNI', 540, 580)

      // Valores en blanco negrita gigante
      ctx.fillStyle = '#ffffff'
      ctx.font = '900 24px sans-serif'

      ctx.textAlign = 'left'
      ctx.fillText(`${asistente.nombre} ${asistente.apellido}`, 60, 625)

      ctx.textAlign = 'right'
      ctx.fillText(asistente.dni, 540, 625)

      // Descargar como imagen
      try {
        const link = document.createElement('a')
        link.download = `Entrada_P&P_${asistente.nombre}_${asistente.apellido}.png`
        link.href = canvas.toDataURL('image/png')
        link.click()
      } catch (err) {
        console.error('Error al exportar canvas:', err)
      } finally {
        setDownloading(false)
      }
    }
  }

  const handleShareWhatsApp = () => {
    const currentUrl = typeof window !== 'undefined' ? window.location.href : ''
    const rawMessage = `¡Hola! Acá te comparto mi entrada para Pecado & Perreo: ${currentUrl} 🎫🔥`
    const encodedText = encodeURIComponent(rawMessage)
    const whatsappUrl = `https://api.whatsapp.com/send?text=${encodedText}`
    window.open(whatsappUrl, '_blank')
  }

  return (
    <div className="w-full max-w-sm sm:max-w-md mx-auto space-y-6">
      
      {/* TARJETA DE ENTRADA (Mismo formato que la captura) */}
      <div 
        id="entrada-visual-card"
        className="relative w-full aspect-[6/7] bg-gradient-to-br from-[#18052b] to-black border border-dashed border-[#e22a8e] rounded-3xl p-6 sm:p-8 flex flex-col justify-between shadow-[0_0_50px_rgba(226,42,142,0.15)] relative overflow-hidden"
      >
        {/* Glow decorativo de fondo */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-pink-500/5 rounded-full filter blur-3xl pointer-events-none"></div>

        {/* 1. Pill Superior */}
        <div className="flex justify-center mt-2">
          <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white font-black text-xs sm:text-sm px-6 py-2.5 rounded-full tracking-wider uppercase shadow-md select-none">
            Entrada #{asistente.orden_id} ({isTitular ? 'Titular' : 'Acompañante'})
          </div>
        </div>

        {/* 2. QR Code en el medio */}
        <div className="flex justify-center my-6">
          {isAprobado ? (
            <div className="bg-white p-4 rounded-3xl shadow-inner max-w-[210px] w-full aspect-square flex items-center justify-center hover:scale-[1.02] transition-transform duration-300">
              {qrBase64 ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img 
                  src={qrBase64} 
                  alt="Código QR de Acceso" 
                  className="w-full h-full object-contain rounded-lg" 
                />
              ) : (
                <div className="w-8 h-8 border-3 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
              )}
            </div>
          ) : (
            <div className="bg-[#101217] border border-amber-500/20 border-dashed rounded-3xl p-6 text-center max-w-[210px] aspect-square flex flex-col items-center justify-center">
              <svg className="w-8 h-8 text-amber-500 mb-2 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <span className="text-[10px] font-black uppercase text-amber-400 tracking-wider">Pago Pendiente</span>
            </div>
          )}
        </div>

        {/* 3. Línea divisoria y Datos */}
        <div className="space-y-4">
          <div className="border-t border-[#2D0A4E]/45 w-full"></div>
          
          <div className="flex justify-between items-center text-left">
            <div>
              <span className="text-[9px] font-black text-purple-400 uppercase tracking-widest block">Nombre</span>
              <span className="text-white text-base sm:text-lg font-black tracking-wide block mt-0.5 truncate max-w-[200px]">
                {asistente.nombre} {asistente.apellido}
              </span>
            </div>
            <div className="text-right">
              <span className="text-[9px] font-black text-purple-400 uppercase tracking-widest block">DNI</span>
              <span className="text-white text-base sm:text-lg font-black tracking-wide block mt-0.5 font-mono">
                {asistente.dni}
              </span>
            </div>
          </div>
        </div>

      </div>

      {/* 4. DOS BOTONES INDIVIDUALES (DESCARGAR Y COMPARTIR POR WSP) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
        
        {/* Botón Descargar */}
        <button
          onClick={handleDownload}
          disabled={downloading || !isAprobado}
          className="bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold py-4 px-6 rounded-2xl hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-[0_0_20px_rgba(168,85,247,0.3)] active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer text-sm uppercase tracking-wider"
        >
          {downloading ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Descargando...
            </>
          ) : (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Descargar Entrada
            </>
          )}
        </button>

        {/* Botón Compartir WhatsApp */}
        <button
          onClick={handleShareWhatsApp}
          className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-4 px-6 rounded-2xl transition-all shadow-[0_0_20px_rgba(16,185,129,0.25)] active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer text-sm uppercase tracking-wider"
        >
          <svg className="w-4.5 h-4.5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.746.953 3.71 1.458 5.706 1.463h.008c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
          </svg>
          Compartir WhatsApp
        </button>

      </div>

    </div>
  )
}
