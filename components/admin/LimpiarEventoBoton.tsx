'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { limpiarEvento } from '@/lib/actions/admin'

interface LimpiarEventoBotonProps {
  eventoId?: string
  eventoNombre?: string
}

export function LimpiarEventoBoton({ eventoId, eventoNombre }: LimpiarEventoBotonProps) {
  const router = useRouter()
  const [step, setStep] = useState<0 | 1 | 2>(0) // 0=cerrado 1=primera confirmación 2=segunda confirmación
  const [confirmText, setConfirmText] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const PALABRA_CLAVE = 'LIMPIAR'

  const handleClose = () => {
    setStep(0)
    setConfirmText('')
    setError('')
  }

  const handleFinalConfirm = async () => {
    if (confirmText.trim().toUpperCase() !== PALABRA_CLAVE) {
      setError(`Debés escribir exactamente "${PALABRA_CLAVE}" para confirmar.`)
      return
    }
    if (!eventoId) {
      setError('No hay evento seleccionado.')
      return
    }

    setLoading(true)
    setError('')
    try {
      const res = await limpiarEvento(eventoId)
      if (res.success) {
        handleClose()
        router.refresh()
      } else {
        setError(res.error || 'Error al limpiar el evento.')
      }
    } catch (e) {
      setError('Error de conexión con el servidor.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <button
        onClick={() => setStep(1)}
        disabled={!eventoId}
        className="flex items-center gap-2 bg-red-500/10 border border-red-500/30 text-red-400 font-bold py-2.5 px-5 rounded-full hover:bg-red-500/20 hover:border-red-500/50 hover:scale-105 transition-all duration-300 text-sm disabled:opacity-30 disabled:cursor-not-allowed disabled:scale-100"
        title={!eventoId ? 'Seleccioná un evento primero' : 'Limpiar todas las entradas de este evento'}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
        Limpiar Evento
      </button>

      {/* PASO 1: Primera confirmación */}
      {step === 1 && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative bg-[#161920] border border-red-500/30 rounded-3xl p-8 w-full max-w-sm shadow-[0_0_50px_rgba(239,68,68,0.2)] animate-in zoom-in-95 duration-200">
            
            {/* Ícono */}
            <div className="flex flex-col items-center text-center">
              <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mb-5 border border-red-500/20">
                <svg className="w-10 h-10 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                </svg>
              </div>

              <h3 className="text-2xl font-black text-white mb-2">¿Estás seguro?</h3>
              <p className="text-gray-400 text-sm leading-relaxed mb-2">
                Estás a punto de eliminar <span className="font-bold text-white">todas las entradas</span> del evento:
              </p>
              <p className="text-red-400 font-bold text-base mb-6 bg-red-500/10 border border-red-500/20 px-4 py-2 rounded-xl">
                &ldquo;{eventoNombre || eventoId}&rdquo;
              </p>
              <p className="text-gray-500 text-xs mb-8">
                Esta acción <span className="text-red-400 font-bold">no se puede deshacer</span>. Todos los QR de este evento dejarán de funcionar.
              </p>

              <div className="flex flex-col w-full gap-3">
                <button
                  onClick={() => setStep(2)}
                  className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3.5 rounded-2xl transition-all shadow-lg shadow-red-600/20"
                >
                  Sí, quiero limpiar el evento
                </button>
                <button
                  onClick={handleClose}
                  className="w-full text-gray-500 font-bold py-2 text-sm hover:text-white transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PASO 2: Segunda confirmación escribiendo la palabra clave */}
      {step === 2 && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative bg-[#161920] border border-red-500/40 rounded-3xl p-8 w-full max-w-sm shadow-[0_0_60px_rgba(239,68,68,0.3)] animate-in zoom-in-95 duration-200">
            
            <div className="flex flex-col items-center text-center">
              <div className="w-20 h-20 bg-red-600/20 rounded-full flex items-center justify-center mb-5 border-2 border-red-500/40">
                <svg className="w-10 h-10 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </div>

              <h3 className="text-2xl font-black text-red-400 mb-2">Confirmación Final</h3>
              <p className="text-gray-400 text-sm leading-relaxed mb-6">
                Para confirmar, escribí <span className="font-black text-white tracking-widest bg-white/10 px-2 py-0.5 rounded">{PALABRA_CLAVE}</span> en el campo de abajo.
              </p>

              <input
                type="text"
                value={confirmText}
                onChange={(e) => { setConfirmText(e.target.value); setError('') }}
                placeholder={PALABRA_CLAVE}
                autoFocus
                className="w-full bg-zinc-900 border border-zinc-700 text-white font-bold text-center text-lg tracking-widest p-4 rounded-xl focus:outline-none focus:border-red-500 transition-colors mb-3 placeholder-zinc-600"
              />

              {error && (
                <p className="text-red-400 text-xs mb-3">{error}</p>
              )}

              <div className="flex flex-col w-full gap-3">
                <button
                  onClick={handleFinalConfirm}
                  disabled={loading || confirmText.trim().toUpperCase() !== PALABRA_CLAVE}
                  className="w-full bg-red-700 hover:bg-red-600 disabled:opacity-40 disabled:cursor-not-allowed text-white font-black py-3.5 rounded-2xl transition-all shadow-lg shadow-red-700/30 tracking-wider uppercase"
                >
                  {loading ? 'Eliminando...' : '🗑️ Borrar Todo'}
                </button>
                <button
                  onClick={handleClose}
                  disabled={loading}
                  className="w-full text-gray-500 font-bold py-2 text-sm hover:text-white transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
