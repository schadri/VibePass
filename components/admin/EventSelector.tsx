'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { crearEvento, cambiarEventoActivo } from '@/lib/actions/admin'
import { actualizarFechaEvento } from '@/lib/actions/registro'

interface EventSelectorProps {
  eventos: any[]
  eventoActivoId: string
}

export function EventSelector({ eventos: initialEventos, eventoActivoId }: EventSelectorProps) {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [eventos, setEventos] = useState(initialEventos)
  const [loading, setLoading] = useState<string | null>(null)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  // Estado para crear nuevo evento
  const [showCrear, setShowCrear] = useState(false)
  const [nuevoNombre, setNuevoNombre] = useState('')
  const [nuevoSimple, setNuevoSimple] = useState(5000)
  const [nuevoDoble, setNuevoDoble] = useState(8500)
  const [nuevoPuerta, setNuevoPuerta] = useState(10000)
  const [nuevoPromoPuerta, setNuevoPromoPuerta] = useState(9000)

  // Fecha editable por evento
  const [editingFechaId, setEditingFechaId] = useState<string | null>(null)
  const [editingFechaVal, setEditingFechaVal] = useState('')

  const eventoActual = eventos.find(e => e.id === eventoActivoId) || eventos.find(e => e.activo) || eventos[0]

  const handleVerEvento = (id: string) => {
    setIsOpen(false)
    router.push(`/admin/dashboard?eventoId=${id}`)
  }

  const handleActivar = async (id: string) => {
    setLoading(id)
    setMessage(null)
    const res = await cambiarEventoActivo(id)
    if (res.success) {
      setEventos(prev => prev.map(e => ({ ...e, activo: e.id === id })))
      setMessage({ type: 'success', text: '¡Evento activo cambiado con éxito!' })
      router.refresh()
    } else {
      setMessage({ type: 'error', text: res.error || 'Error al cambiar evento activo' })
    }
    setLoading(null)
  }

  const handleGuardarFecha = async (eventoId: string) => {
    setLoading(`fecha_${eventoId}`)
    const res = await actualizarFechaEvento(eventoId, editingFechaVal || null)
    if (res.success) {
      setEventos(prev => prev.map(e => e.id === eventoId ? { ...e, fecha_evento: editingFechaVal || null } : e))
      setEditingFechaId(null)
      setMessage({ type: 'success', text: 'Fecha guardada.' })
      router.refresh()
    } else {
      setMessage({ type: 'error', text: res.error || 'Error al guardar fecha' })
    }
    setLoading(null)
  }

  const handleCrear = async () => {
    if (!nuevoNombre.trim()) return
    setLoading('crear')
    setMessage(null)
    const res = await crearEvento(nuevoNombre, 'Próximamente', nuevoSimple, nuevoDoble, nuevoPuerta, nuevoPromoPuerta)
    if (res.success && res.id) {
      setShowCrear(false)
      setNuevoNombre('')
      setIsOpen(false)
      router.push(`/admin/dashboard?eventoId=${res.id}`)
      router.refresh()
    } else {
      setMessage({ type: 'error', text: res.error || 'Error al crear evento' })
    }
    setLoading(null)
  }

  const formatFecha = (fecha: string | null) => {
    if (!fecha || fecha.toLowerCase() === 'proximamente') return 'Sin fecha'
    try {
      const parts = fecha.split('-')
      if (parts.length === 3) {
        const date = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]))
        return date.toLocaleDateString('es-AR', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })
      }
      return fecha
    } catch { return fecha }
  }

  return (
    <>
      {/* TRIGGER BUTTON */}
      <button
        onClick={() => { setIsOpen(true); setMessage(null); setShowCrear(false) }}
        className="w-fit inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 hover:border-purple-500/40 hover:bg-purple-500/10 text-xs font-semibold text-zinc-400 hover:text-white transition-all duration-200"
      >
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
        <span className="truncate max-w-[140px]">{eventoActual?.nombre || 'Sin evento'}</span>
        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-zinc-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
        </svg>
      </button>

      {/* MODAL */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="absolute inset-0" onClick={() => setIsOpen(false)} />

          <div className="relative w-full max-w-lg bg-zinc-950/95 border border-zinc-800 rounded-3xl shadow-[0_0_60px_rgba(168,85,247,0.2)] backdrop-blur-md animate-in zoom-in-95 duration-200 overflow-hidden">

            {/* Header */}
            <div className="px-7 pt-7 pb-5 border-b border-zinc-800">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500 uppercase tracking-wider">
                    Gestión de Eventos
                  </h2>
                  <p className="text-zinc-500 text-xs mt-1">Seleccioná el evento activo de ventas o visualizá uno anterior.</p>
                </div>
                <button onClick={() => setIsOpen(false)} className="text-zinc-600 hover:text-white transition-colors p-2 rounded-full hover:bg-white/5">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="px-7 py-5 max-h-[65vh] overflow-y-auto space-y-3">

              {/* Feedback message */}
              {message && (
                <div className={`p-3 rounded-xl border text-center text-sm font-semibold animate-in fade-in ${
                  message.type === 'success'
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                    : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
                }`}>
                  {message.text}
                </div>
              )}

              {/* Lista de eventos */}
              {eventos.map((evento) => (
                <div
                  key={evento.id}
                  className={`relative rounded-2xl border p-4 transition-all duration-200 ${
                    evento.id === eventoActivoId
                      ? 'border-purple-500/40 bg-purple-500/5'
                      : 'border-zinc-800 bg-zinc-900/50 hover:border-zinc-700'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-white text-base truncate">{evento.nombre}</span>
                        {evento.activo && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                            ACTIVO
                          </span>
                        )}
                        {evento.id === eventoActivoId && !evento.activo && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-purple-500/15 border border-purple-500/30 text-purple-400">
                            Viendo
                          </span>
                        )}
                      </div>

                      {/* Fecha editable */}
                      {editingFechaId === evento.id ? (
                        <div className="flex items-center gap-2 mt-2">
                          <input
                            type="date"
                            value={editingFechaVal}
                            onChange={(e) => setEditingFechaVal(e.target.value)}
                            className="bg-zinc-800 border border-zinc-700 text-white text-xs rounded-lg px-3 py-1.5 focus:outline-none focus:border-purple-500 [color-scheme:dark]"
                            autoFocus
                          />
                          <button
                            onClick={() => handleGuardarFecha(evento.id)}
                            disabled={loading === `fecha_${evento.id}`}
                            className="text-xs bg-purple-600 hover:bg-purple-500 text-white font-bold px-3 py-1.5 rounded-lg transition-all disabled:opacity-50"
                          >
                            {loading === `fecha_${evento.id}` ? '...' : 'Guardar'}
                          </button>
                          <button
                            onClick={() => setEditingFechaId(null)}
                            className="text-xs text-zinc-500 hover:text-white transition-colors"
                          >
                            Cancelar
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => { setEditingFechaId(evento.id); setEditingFechaVal(evento.fecha_evento || '') }}
                          className="mt-1 flex items-center gap-1 text-xs text-zinc-500 hover:text-purple-400 transition-colors group"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <span className="group-hover:underline">{formatFecha(evento.fecha_evento)}</span>
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                          </svg>
                        </button>
                      )}
                    </div>

                    {/* Acciones */}
                    <div className="flex flex-col gap-2 shrink-0">
                      <button
                        onClick={() => handleVerEvento(evento.id)}
                        className="text-xs px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-300 hover:text-white font-semibold transition-all"
                      >
                        Ver
                      </button>
                      {!evento.activo && (
                        <button
                          onClick={() => handleActivar(evento.id)}
                          disabled={loading === evento.id}
                          className="text-xs px-3 py-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/40 border border-emerald-500/30 text-emerald-400 font-bold transition-all disabled:opacity-50"
                        >
                          {loading === evento.id ? '...' : 'Activar'}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {/* Crear nuevo evento */}
              {!showCrear ? (
                <button
                  onClick={() => setShowCrear(true)}
                  className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl border border-dashed border-pink-500/30 text-pink-400 hover:border-pink-500/60 hover:bg-pink-500/5 font-bold text-sm transition-all"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Crear Nuevo Evento
                </button>
              ) : (
                <div className="border border-pink-500/20 bg-pink-500/5 rounded-2xl p-5 space-y-4">
                  <h3 className="text-sm font-black text-pink-400 uppercase tracking-wider">Nuevo Evento</h3>
                  <div>
                    <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider block mb-1.5">Nombre del evento</label>
                    <input
                      type="text"
                      placeholder="Ej: Junio 2026"
                      value={nuevoNombre}
                      onChange={(e) => setNuevoNombre(e.target.value)}
                      autoFocus
                      className="w-full bg-zinc-900 border border-zinc-700 text-white font-bold px-4 py-3 rounded-xl focus:outline-none focus:border-pink-500 transition-colors placeholder-zinc-600"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { label: 'Simple ($)', value: nuevoSimple, setter: setNuevoSimple },
                      { label: 'Doble ($)', value: nuevoDoble, setter: setNuevoDoble },
                      { label: 'En Puerta ($)', value: nuevoPuerta, setter: setNuevoPuerta },
                      { label: 'Promo Puerta ($)', value: nuevoPromoPuerta, setter: setNuevoPromoPuerta },
                    ].map(({ label, value, setter }) => (
                      <div key={label}>
                        <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider block mb-1.5">{label}</label>
                        <input
                          type="number"
                          value={value}
                          onChange={(e) => setter(Number(e.target.value))}
                          className="w-full bg-zinc-900 border border-zinc-700 text-white font-bold px-4 py-2.5 rounded-xl focus:outline-none focus:border-pink-500 transition-colors text-sm"
                        />
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2 pt-1">
                    <button
                      onClick={handleCrear}
                      disabled={loading === 'crear' || !nuevoNombre.trim()}
                      className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-black py-3 rounded-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(168,85,247,0.3)]"
                    >
                      {loading === 'crear' ? 'Creando...' : '🎉 Crear y Activar'}
                    </button>
                    <button
                      onClick={() => setShowCrear(false)}
                      className="px-4 bg-zinc-900 border border-zinc-700 hover:bg-zinc-800 text-zinc-400 hover:text-white font-bold rounded-xl transition-all"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
