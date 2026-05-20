'use client'

import { useState, useEffect } from 'react'
import { actualizarFechaEvento } from '@/lib/actions/registro'

export function ConfigurarFechaBoton({ eventoId, fechaActual }: { eventoId?: string, fechaActual?: string | null }) {
  const [isOpen, setIsOpen] = useState(false)
  const [fecha, setFecha] = useState(fechaActual || '')
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState({ type: '', message: '' })

  useEffect(() => {
    if (isOpen) {
      setFecha(fechaActual || '')
    }
  }, [isOpen, fechaActual])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setStatus({ type: '', message: '' })

    try {
      if (!eventoId) throw new Error('No hay evento seleccionado')
      const result = await actualizarFechaEvento(eventoId, fecha || null)
      if (result.success) {
        setStatus({ type: 'success', message: '¡Fecha del evento guardada con éxito!' })
        setTimeout(() => {
          setIsOpen(false)
          setStatus({ type: '', message: '' })
          window.location.reload()
        }, 1500)
      } else {
        throw new Error(result.error || 'No se pudo guardar la fecha')
      }
    } catch (err: any) {
      setStatus({ type: 'error', message: err.message || 'Hubo un error inesperado' })
    } finally {
      setLoading(false)
    }
  }

  const handleClear = async () => {
    setLoading(true)
    setStatus({ type: '', message: '' })
    try {
      if (!eventoId) throw new Error('No hay evento seleccionado')
      const result = await actualizarFechaEvento(eventoId, null)
      if (result.success) {
        setFecha('')
        setStatus({ type: 'success', message: '¡Fecha del evento reiniciada a Próximamente!' })
        setTimeout(() => {
          setIsOpen(false)
          setStatus({ type: '', message: '' })
          window.location.reload()
        }, 1500)
      } else {
        throw new Error(result.error || 'No se pudo borrar la fecha')
      }
    } catch (err: any) {
      setStatus({ type: 'error', message: err.message || 'Hubo un error al borrar la fecha' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 bg-gradient-to-r from-[#2D0A4E] to-zinc-900 border border-purple-500/30 text-white font-bold py-2.5 px-5 rounded-full hover:scale-105 transition-all duration-300 shadow-[0_0_15px_rgba(168,85,247,0.15)] text-sm focus:outline-none"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4.5 w-4.5 text-[#e22a8e]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        Configurar Fecha
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in text-left">
          <div className="absolute inset-0" onClick={() => setIsOpen(false)} />

          <div className="relative w-full max-w-md p-6 sm:p-8 bg-zinc-950/95 border border-zinc-800 rounded-3xl shadow-[0_0_50px_rgba(226,42,142,0.25)] backdrop-blur-md animate-scale-in">
            {/* Close button */}
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 text-zinc-400 hover:text-white transition-colors p-2 rounded-full hover:bg-white/10"
              aria-label="Cerrar modal"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <h2 className="text-xl sm:text-2xl font-black text-white mb-6 uppercase tracking-wider bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-[#e22a8e] flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[#e22a8e]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Fecha del Evento
            </h2>

            {status.message && (
              <div className={`p-3 rounded-xl border text-center text-sm font-semibold mb-4 animate-scale-in ${
                status.type === 'success' 
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' 
                  : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
              }`}>
                {status.message}
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-6">
              <div>
                <label className="block text-xs font-black uppercase tracking-widest text-zinc-400 mb-2">Seleccionar Fecha</label>
                <div className="relative">
                  <input
                    type="date"
                    disabled={loading}
                    value={fecha}
                    onChange={(e) => setFecha(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 text-white font-bold p-4 rounded-xl focus:outline-none focus:border-[#e22a8e] transition-colors focus:shadow-[0_0_15px_rgba(226,42,142,0.15)] [color-scheme:dark]"
                  />
                </div>
                <p className="text-zinc-500 text-xs mt-2 leading-relaxed">
                  Si seleccionas una fecha, se mostrará en formato local (ej: "Viernes, 25 de Mayo") en la landing page. Si no configuras ninguna, se mostrará "Próximamente".
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-2 pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-[#e22a8e] hover:from-purple-500 hover:to-[#ef3b9f] text-white font-bold py-3.5 px-6 rounded-xl transition-all duration-300 hover:scale-[1.02] flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(226,42,142,0.2)] disabled:opacity-50 disabled:scale-100"
                >
                  {loading ? 'Guardando...' : 'Guardar Fecha'}
                </button>
                <button
                  type="button"
                  onClick={handleClear}
                  disabled={loading || !fecha}
                  className="sm:w-32 bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-zinc-300 font-bold py-3.5 px-4 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-30"
                >
                  Limpiar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
