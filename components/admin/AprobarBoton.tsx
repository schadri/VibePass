'use client'

import { useState } from 'react'
import { aprobarPago } from '@/lib/actions/admin'
import { useRouter } from 'next/navigation'

export function AprobarBoton({ asistenteId, isReenviar = false, isGrupo = false }: { asistenteId: string, isReenviar?: boolean, isGrupo?: boolean }) {
  const [loading, setLoading] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [feedback, setFeedback] = useState<{type: 'error' | 'warning' | 'success', msg: string} | null>(null)
  const router = useRouter()

  const handleAprobar = async () => {
    setLoading(true)
    setShowConfirm(false)
    try {
      const res = await aprobarPago(asistenteId)
      if (!res.success) {
        setFeedback({ type: 'error', msg: res.error || 'Error desconocido' })
      } else {
        if (res.warning) {
          setFeedback({ type: 'warning', msg: res.warning })
        }
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
        onClick={() => setShowConfirm(true)}
        disabled={loading}
        className={`font-bold py-2 px-4 rounded-xl transition-all text-xs active:scale-95 shadow-lg ${
          isReenviar 
            ? 'bg-purple-900/40 hover:bg-purple-900/60 text-purple-200 border border-purple-500/30' 
            : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-500/20'
        }`}
      >
        {loading ? '...' : (isReenviar ? (isGrupo ? 'Enviar via Mail' : 'Reenviar QR') : 'Aprobar Pago')}
      </button>

      {/* Modal de Confirmación */}
      {showConfirm && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setShowConfirm(false)}></div>
          <div className="relative bg-[#161920] border border-emerald-500/30 rounded-3xl p-6 w-full max-w-sm shadow-[0_0_50px_rgba(16,185,129,0.15)] animate-in zoom-in-95 duration-200">
            <div className="flex flex-col items-center text-center">
              <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 border ${isReenviar ? 'bg-purple-500/10 border-purple-500/20' : 'bg-emerald-500/10 border-emerald-500/20'}`}>
                {isReenviar ? (
                  <svg className="w-8 h-8 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                ) : (
                  <svg className="w-8 h-8 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
              <h3 className="text-xl font-bold text-white mb-2">
                {isReenviar ? (isGrupo ? 'Enviar Entradas' : 'Reenviar Entrada') : 'Confirmar Pago'}
              </h3>
              <p className="text-gray-400 text-sm mb-8 leading-relaxed">
                {isReenviar 
                  ? (isGrupo ? 'Se enviarán las entradas de todo el grupo al correo del titular.' : 'Se enviarán nuevamente los códigos QR al correo del titular.') 
                  : 'Al aprobar, se enviará automáticamente el correo con el QR de acceso.'}
              </p>
              <div className="flex flex-col w-full gap-3">
                <button
                  onClick={handleAprobar}
                  className={`w-full font-bold py-3 rounded-2xl transition-all shadow-lg ${isReenviar ? 'bg-purple-600 hover:bg-purple-700 text-white shadow-purple-600/20' : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20'}`}
                >
                  {isReenviar ? (isGrupo ? 'Si, Enviar' : 'Si, Reenviar') : 'Si, Aprobar Pago'}
                </button>
                <button onClick={() => setShowConfirm(false)} className="w-full text-gray-500 font-bold py-2 text-sm hover:text-white">Cancelar</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Feedback (Error/Warning) */}
      {feedback && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setFeedback(null)}></div>
          <div className="relative bg-[#1a1e26] border border-gray-700 rounded-3xl p-6 w-full max-w-xs shadow-2xl animate-in zoom-in-95">
            <div className="text-center">
              <div className={`w-12 h-12 mx-auto rounded-full flex items-center justify-center mb-4 ${feedback.type === 'error' ? 'bg-red-500/10 text-red-500' : 'bg-amber-500/10 text-amber-500'}`}>
                {feedback.type === 'error' ? (
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                ) : (
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                )}
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
