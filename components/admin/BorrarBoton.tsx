'use client'

import { useState } from 'react'
import { borrarAsistente } from '@/lib/actions/admin'
import { useRouter } from 'next/navigation'

export function BorrarBoton({ asistenteId, hasCompanion }: { asistenteId: string, hasCompanion?: boolean }) {
  const [loading, setLoading] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [feedback, setFeedback] = useState<{type: 'error' | 'success', msg: string} | null>(null)
  const router = useRouter()

  const executeDelete = async (borrarAcompanantes: boolean) => {
    setLoading(true)
    setShowModal(false)
    try {
      const res = await borrarAsistente(asistenteId, borrarAcompanantes)
      if (!res.success) {
        setFeedback({ type: 'error', msg: res.error || 'Error desconocido' })
      } else {
        router.refresh()
      }
    } catch (error) {
      setFeedback({ type: 'error', msg: 'Error de conexión con el servidor' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        disabled={loading}
        className="bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/30 font-bold py-2 px-4 rounded-xl transition-all text-xs disabled:opacity-50 active:scale-95"
      >
        {loading ? '...' : 'Borrar'}
      </button>

      {/* Modal Estético */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/80 backdrop-blur-md"
            onClick={() => !loading && setShowModal(false)}
          ></div>

          {/* Card */}
          <div className="relative bg-[#161920] border border-purple-500/30 rounded-3xl p-6 w-full max-w-sm shadow-[0_0_50px_rgba(168,85,247,0.2)] animate-in zoom-in-95 duration-200">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mb-4 border border-red-500/20">
                <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </div>
              
              <h3 className="text-xl font-bold text-white mb-2">
                {hasCompanion ? 'Eliminar Anfitrión' : '¿Eliminar asistente?'}
              </h3>
              
              <p className="text-gray-400 text-sm mb-8 leading-relaxed">
                {hasCompanion 
                  ? 'Este asistente es un anfitrión (Promo 2x1). ¿Deseas borrar también a su acompañante o solo al anfitrión?' 
                  : 'Esta acción no se puede deshacer y el código QR dejará de ser válido permanentemente.'}
              </p>

              <div className="flex flex-col w-full gap-3">
                {hasCompanion ? (
                  <>
                    <button
                      onClick={() => executeDelete(true)}
                      className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-2xl transition-all shadow-lg shadow-red-600/20"
                    >
                      Borrar AMBOS
                    </button>
                    <button
                      onClick={() => executeDelete(false)}
                      className="w-full bg-[#1f242e] hover:bg-[#2a313d] text-white border border-[#374151] font-bold py-3 rounded-2xl transition-all"
                    >
                      Solo Anfitrión
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => executeDelete(false)}
                    className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-2xl transition-all shadow-lg shadow-red-600/20"
                  >
                    Confirmar Eliminación
                  </button>
                )}
                
                <button
                  onClick={() => setShowModal(false)}
                  className="w-full text-gray-500 font-bold py-2 text-sm hover:text-white transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Feedback (Error) */}
      {feedback && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setFeedback(null)}></div>
          <div className="relative bg-[#1a1e26] border border-gray-700 rounded-3xl p-6 w-full max-w-xs shadow-2xl animate-in zoom-in-95">
            <div className="text-center">
              <div className="w-12 h-12 mx-auto rounded-full flex items-center justify-center mb-4 bg-red-500/10 text-red-500">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </div>
              <p className="text-white text-sm font-medium mb-6">{feedback.msg}</p>
              <button onClick={() => setFeedback(null)} className="w-full bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 rounded-xl text-xs transition-all">Entendido</button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
