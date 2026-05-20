'use client'

import { useState, useMemo } from 'react'
import { marcarComoEnviado } from '@/lib/actions/admin'

interface Asistente {
  id: string
  nombre: string
  apellido: string
  dni: string
  email: string
  orden_id: string
  qr_token: string
  titular_id: string | null
  enviado?: boolean
  numero_referencia?: string | null
  estado_pago: string
}

interface GrupoDashboardClientProps {
  titular: Asistente
  invitados: Asistente[]
}

export function GrupoDashboardClient({ titular, invitados }: GrupoDashboardClientProps) {
  const [list, setList] = useState<Asistente[]>(invitados)
  const [search, setSearch] = useState('')
  const [activeTab, setActiveTab] = useState<'por_enviar' | 'enviados'>('por_enviar')
  const [copiedId, setCopiedId] = useState<string | null>(null)

  // Determinar si una entrada ya fue enviada
  const isEnviado = (item: Asistente) => {
    return item.enviado === true || item.numero_referencia === 'enviado'
  }

  // Obtener URL del ticket
  const getTicketUrl = (qrToken: string) => {
    if (typeof window !== 'undefined') {
      return `${window.location.origin}/ticket/${qrToken}`
    }
    return `/ticket/${qrToken}`
  }

  // Acción para marcar como enviado y abrir WhatsApp / copiar enlace
  const handleMarcarEnviado = async (id: string, enviado: boolean = true) => {
    // Actualizar localmente de forma instantánea
    setList(prev => prev.map(item => {
      if (item.id === id) {
        return {
          ...item,
          enviado,
          numero_referencia: enviado ? 'enviado' : null
        }
      }
      return item
    }))

    try {
      await marcarComoEnviado(id, enviado)
    } catch (e) {
      console.error('Error al actualizar el estado de enviado en DB:', e)
    }
  }

  const handleShareWhatsApp = (item: Asistente) => {
    const ticketUrl = getTicketUrl(item.qr_token)
    const rawMessage = `¡Hola ${item.nombre}! Acá tenés tu entrada para Pecado & Perreo: ${ticketUrl} 🎫🔥`
    const encodedText = encodeURIComponent(rawMessage)
    const whatsappUrl = `https://api.whatsapp.com/send?text=${encodedText}`
    
    // Abrir WhatsApp en pestaña nueva
    window.open(whatsappUrl, '_blank')
    
    // Registrar como enviado
    handleMarcarEnviado(item.id, true)
  }

  const handleCopyLink = async (item: Asistente) => {
    const ticketUrl = getTicketUrl(item.qr_token)
    try {
      await navigator.clipboard.writeText(ticketUrl)
      setCopiedId(item.id)
      setTimeout(() => setCopiedId(null), 1500)
      
      // Registrar como enviado
      handleMarcarEnviado(item.id, true)
    } catch (err) {
      console.error('Error al copiar al portapapeles:', err)
    }
  }

  // Filtrar la lista
  const filteredList = useMemo(() => {
    return list.filter(item => {
      const matchesSearch = `${item.nombre} ${item.apellido}`.toLowerCase().includes(search.toLowerCase()) ||
                            item.dni.includes(search)
      
      const isItemShared = isEnviado(item)
      const matchesTab = activeTab === 'por_enviar' ? !isItemShared : isItemShared

      return matchesSearch && matchesTab
    })
  }, [list, search, activeTab])

  // Contadores
  const stats = useMemo(() => {
    const total = list.length
    const enviados = list.filter(isEnviado).length
    const porEnviar = total - enviados
    const porcentaje = total > 0 ? Math.round((enviados / total) * 100) : 0
    return { total, enviados, porEnviar, porcentaje }
  }, [list])

  return (
    <main className="min-h-screen bg-black text-white bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#2D0A4E] via-black to-black p-4 sm:p-8 select-none">
      <div className="max-w-3xl mx-auto">
        
        {/* HEADER DE GRUPO */}
        <div className="text-center mb-8 mt-4 animate-in fade-in duration-300">
          <span className="text-[10px] sm:text-xs font-black text-purple-400 uppercase tracking-widest border border-purple-500/30 px-3 py-1 rounded-full bg-purple-500/5">
            Panel de Distribución
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600 drop-shadow-[0_0_15px_rgba(168,85,247,0.4)] mt-3">
            Envento de {titular.nombre}
          </h1>
          <p className="text-gray-400 text-xs sm:text-sm mt-2 max-w-md mx-auto leading-relaxed">
            Acá tenés todas las entradas de tus invitados. Podés copiarlas o enviárselas directamente por WhatsApp una por una.
          </p>
        </div>

        {/* CONTADOR DE PROGRESO */}
        <div className="bg-[#161920]/80 border border-[#2D0A4E]/30 rounded-3xl p-6 mb-6 shadow-[0_0_30px_rgba(168,85,247,0.1)] relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-pink-500/5 rounded-full filter blur-2xl"></div>
          
          <div className="grid grid-cols-3 gap-2 text-center relative z-10 mb-4">
            <div>
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">Total Invitados</span>
              <span className="text-2xl font-black text-white mt-1 block">{stats.total}</span>
            </div>
            <div>
              <span className="text-[10px] font-bold text-purple-400 uppercase tracking-wider block">Por Enviar</span>
              <span className="text-2xl font-black text-pink-400 mt-1 block">{stats.porEnviar}</span>
            </div>
            <div>
              <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block">Enviadas</span>
              <span className="text-2xl font-black text-emerald-400 mt-1 block">{stats.enviados}</span>
            </div>
          </div>

          {/* Barra de progreso */}
          <div className="w-full bg-zinc-900 h-2.5 rounded-full overflow-hidden border border-zinc-800">
            <div 
              className="bg-gradient-to-r from-purple-500 to-pink-500 h-full rounded-full transition-all duration-500" 
              style={{ width: `${stats.porcentaje}%` }}
            />
          </div>
          <div className="flex justify-between items-center text-[10px] text-gray-400 mt-1.5 px-0.5">
            <span>Progreso de envío</span>
            <span className="font-bold text-purple-400">{stats.porcentaje}% Completado</span>
          </div>
        </div>

        {/* BUSCADOR Y TABS */}
        <div className="space-y-4 mb-6">
          {/* Input de Búsqueda */}
          <div className="relative">
            <input
              type="text"
              placeholder="Buscar invitado por nombre o DNI..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[#12141a]/90 border border-[#2D0A4E]/30 rounded-2xl py-4 pl-12 pr-4 text-white text-sm focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all placeholder-gray-600 shadow-inner"
            />
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            {search && (
              <button 
                onClick={() => setSearch('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white cursor-pointer"
              >
                ✖
              </button>
            )}
          </div>

          {/* TABS */}
          <div className="flex gap-2 bg-[#0c0e13] p-1 rounded-2xl border border-[#2D0A4E]/20">
            <button
              onClick={() => setActiveTab('por_enviar')}
              className={`flex-1 py-3.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-2 ${
                activeTab === 'por_enviar'
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Por Enviar ({stats.porEnviar})
            </button>
            <button
              onClick={() => setActiveTab('enviados')}
              className={`flex-1 py-3.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-2 ${
                activeTab === 'enviados'
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Enviados ({stats.enviados})
            </button>
          </div>
        </div>

        {/* LISTADO DE TARJETAS INVITADOS */}
        <div className="space-y-3 min-h-[250px] animate-in fade-in duration-300">
          {filteredList.map((item) => {
            const isTitular = item.titular_id === null
            const isCopied = copiedId === item.id
            const itemShared = isEnviado(item)

            return (
              <div 
                key={item.id}
                className="bg-[#12141a]/95 border border-[#2D0A4E]/20 hover:border-purple-500/40 p-4 sm:p-5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all duration-300 shadow-[0_4px_20px_rgba(0,0,0,0.2)]"
              >
                {/* Datos del Invitado */}
                <div className="flex items-start gap-3">
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-white font-black text-base">
                        {item.nombre.replace(/,+$/, '').trim()} {item.apellido.replace(/,+$/, '').trim()}
                      </span>
                      <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider border ${
                        isTitular 
                          ? 'bg-pink-500/10 text-pink-400 border-pink-500/30' 
                          : 'bg-purple-500/10 text-purple-300 border-purple-500/20'
                      }`}>
                        {isTitular ? 'Cumpleañero' : 'Invitado'}
                      </span>
                      {item.estado_pago === 'pendiente' && (
                        <span className="bg-amber-500/10 text-amber-400 border border-amber-500/20 px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider animate-pulse">
                          Pendiente
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-gray-500 mt-0.5">DNI: <span className="font-mono text-gray-400">{item.dni}</span></span>
                  </div>
                </div>

                {/* Acciones */}
                <div className="flex items-center gap-2 self-end sm:self-center">
                  
                  {/* Botón WhatsApp */}
                  <button
                    onClick={() => handleShareWhatsApp(item)}
                    className="flex-1 sm:flex-none bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2.5 px-4 rounded-xl flex items-center justify-center gap-1.5 text-xs transition-colors shadow-md active:scale-95 cursor-pointer"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.746.953 3.71 1.458 5.706 1.463h.008c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                    </svg>
                    WhatsApp
                  </button>

                  {/* Botón Copiar Link */}
                  <button
                    onClick={() => handleCopyLink(item)}
                    className={`flex-1 sm:flex-none border font-bold py-2.5 px-4 rounded-xl flex items-center justify-center gap-1.5 text-xs transition-all active:scale-95 cursor-pointer ${
                      isCopied
                        ? 'bg-purple-600 border-purple-500 text-white'
                        : 'border-[#2D0A4E]/40 hover:bg-[#2D0A4E]/20 text-gray-300'
                    }`}
                  >
                    {isCopied ? (
                      <>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                        </svg>
                        ¡Copiado!
                      </>
                    ) : (
                      <>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                        </svg>
                        Copiar Link
                      </>
                    )}
                  </button>

                  {/* Botón Deshacer/Marcar No Enviado */}
                  {itemShared && (
                    <button
                      onClick={() => handleMarcarEnviado(item.id, false)}
                      className="border border-red-500/30 hover:bg-red-500/10 text-red-400 p-2.5 rounded-xl transition-all cursor-pointer active:scale-95"
                      title="Marcar como pendiente de envío"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                      </svg>
                    </button>
                  )}

                </div>
              </div>
            )
          })}

          {filteredList.length === 0 && (
            <div className="flex flex-col items-center justify-center p-12 text-center bg-[#12141a]/40 border border-[#2D0A4E]/10 rounded-3xl">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-600 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0a2 2 0 01-2 2H6a2 2 0 01-2-2m16 0V9a2 2 0 00-2-2H6a2 2 0 00-2 2v2m16 4h-2a2 2 0 00-2 2v1a2 2 0 01-2 2H6a2 2 0 01-2-2v-1a2 2 0 00-2-2H2" />
              </svg>
              <h3 className="text-gray-400 font-bold text-sm">No se encontraron invitados</h3>
              <p className="text-gray-500 text-xs mt-1">Intentá buscando otro nombre o cambiá de pestaña.</p>
            </div>
          )}
        </div>

        {/* PIE DE PÁGINA */}
        <div className="text-center text-[10px] text-gray-600 mt-12 pb-6 border-t border-[#2D0A4E]/10 pt-4">
          <p>Pecado & Perreo © 2026</p>
          <p className="mt-1 font-mono text-purple-500/30">DISTRIBUTION_HUB_v1.5</p>
        </div>

      </div>
    </main>
  )
}
