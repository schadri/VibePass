'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { cargarEventoMasivo } from '@/lib/actions/admin'

interface Comprador {
  id: string
  nombre: string
  apellido: string
  orden_id: string
  email: string
}

interface CargarEventoBotonProps {
  compradores: Comprador[]
}

export function CargarEventoBoton({ compradores }: CargarEventoBotonProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [tab, setTab] = useState<'existente' | 'nuevo'>('existente')
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const router = useRouter()

  // Form State
  const [compradorId, setCompradorId] = useState('')
  const [buyerNombre, setBuyerNombre] = useState('')
  const [buyerApellido, setBuyerApellido] = useState('')
  const [buyerDni, setBuyerDni] = useState('')
  const [buyerEmail, setBuyerEmail] = useState('')
  const [estadoPago, setEstadoPago] = useState<'pendiente' | 'aprobado'>('pendiente')
  const [invitadosText, setInvitadosText] = useState('')

  const handleClose = () => {
    setIsOpen(false)
    setMessage(null)
    setCompradorId('')
    setBuyerNombre('')
    setBuyerApellido('')
    setBuyerDni('')
    setBuyerEmail('')
    setEstadoPago('pendiente')
    setInvitadosText('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    if (tab === 'existente' && !compradorId) {
      setMessage({ type: 'error', text: 'Por favor, selecciona un comprador existente.' })
      setLoading(false)
      return
    }

    if (!invitadosText.trim()) {
      setMessage({ type: 'error', text: 'Por favor, ingresa al menos un invitado en la lista.' })
      setLoading(false)
      return
    }

    try {
      const res = await cargarEventoMasivo({
        compradorExistenteId: tab === 'existente' ? compradorId : undefined,
        buyerNombre: tab === 'nuevo' ? buyerNombre : undefined,
        buyerApellido: tab === 'nuevo' ? buyerApellido : undefined,
        buyerDni: tab === 'nuevo' ? buyerDni : undefined,
        buyerEmail: tab === 'nuevo' ? buyerEmail : undefined,
        estadoPago: tab === 'nuevo' ? estadoPago : undefined,
        invitadosText
      })

      if (res.success) {
        setMessage({ type: 'success', text: '¡Evento masivo cargado con éxito!' })
        router.refresh()
        setTimeout(() => {
          handleClose()
        }, 1500)
      } else {
        setMessage({ type: 'error', text: res.error || 'Error desconocido al cargar evento.' })
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: 'Error de conexión con el servidor.' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="bg-gradient-to-r from-purple-800 to-indigo-900 border border-purple-500/30 text-white font-bold py-2.5 px-6 rounded-xl hover:opacity-90 transition-all shadow-[0_0_15px_rgba(168,85,247,0.2)] active:scale-[0.98] flex items-center gap-2 text-sm cursor-pointer"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4.5 w-4.5 text-purple-300 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
        Cargar Cumple / Grupo
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
          {/* Backdrop Click */}
          <div className="absolute inset-0" onClick={() => !loading && handleClose()} />

          {/* Modal Box */}
          <div className="relative w-full max-w-lg p-6 sm:p-8 bg-[#161920]/95 border border-[#2D0A4E] rounded-3xl shadow-[0_0_55px_rgba(168,85,247,0.3)] backdrop-blur-md animate-scale-in text-left max-h-[90vh] overflow-y-auto">
            
            {/* Close Button */}
            <button
              onClick={handleClose}
              disabled={loading}
              className="absolute top-4 right-4 text-zinc-400 hover:text-white transition-colors p-2 rounded-full hover:bg-white/10 cursor-pointer disabled:opacity-50"
              aria-label="Cerrar modal"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <h3 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600 mb-6 text-center uppercase tracking-wider">
              Carga Masiva de Grupo
            </h3>

            {message && (
              <div className={`p-4 rounded-xl text-center text-sm mb-4 border font-semibold ${
                message.type === 'error'
                  ? 'bg-red-500/10 border-red-500/30 text-red-400 animate-shake'
                  : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 animate-pulse'
              }`}>
                {message.text}
              </div>
            )}

            {/* TABS */}
            <div className="flex gap-2 mb-6 bg-[#0d0e12] p-1 rounded-xl border border-[#2D0A4E]/30">
              <button
                type="button"
                onClick={() => !loading && setTab('existente')}
                className={`flex-1 py-2.5 rounded-lg text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                  tab === 'existente'
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Vincular a Comprador
              </button>
              <button
                type="button"
                onClick={() => !loading && setTab('nuevo')}
                className={`flex-1 py-2.5 rounded-lg text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                  tab === 'nuevo'
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Crear Nuevo Comprador
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* TAB 1: EXISTENTE */}
              {tab === 'existente' && (
                <div className="flex flex-col gap-1.5 animate-in fade-in duration-200">
                  <label className="text-xs font-bold text-purple-400 uppercase tracking-wider ml-2">Seleccionar Comprador / Anfitrión</label>
                  <select
                    value={compradorId}
                    onChange={(e) => setCompradorId(e.target.value)}
                    required
                    className="p-4 bg-[#1f242e] border border-[#374151] rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none text-white transition-all text-sm"
                  >
                    <option value="" disabled>-- Elegir comprador de la lista --</option>
                    {compradores.map((c) => (
                      <option key={c.id} value={c.id}>
                        #{c.orden_id} - {c.nombre} {c.apellido} ({c.email})
                      </option>
                    ))}
                  </select>
                  <p className="text-[10px] text-gray-500 ml-2">Los invitados ingresados heredarán el email y el estado de pago de este comprador.</p>
                </div>
              )}

              {/* TAB 2: NUEVO COMPRADOR */}
              {tab === 'nuevo' && (
                <div className="space-y-3 animate-in fade-in duration-200">
                  <div className="bg-[#1a1e26]/50 p-4 rounded-2xl border border-[#2D0A4E]/30 space-y-3">
                    <span className="text-xs font-black text-pink-400 uppercase tracking-widest block mb-1">Datos del Anfitrión (Titular)</span>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <input
                        type="text"
                        placeholder="Nombre Anfitrión"
                        value={buyerNombre}
                        onChange={(e) => setBuyerNombre(e.target.value)}
                        required={tab === 'nuevo'}
                        className="p-3 bg-[#1f242e] border border-[#374151] rounded-xl outline-none text-white text-sm"
                      />
                      <input
                        type="text"
                        placeholder="Apellido Anfitrión"
                        value={buyerApellido}
                        onChange={(e) => setBuyerApellido(e.target.value)}
                        required={tab === 'nuevo'}
                        className="p-3 bg-[#1f242e] border border-[#374151] rounded-xl outline-none text-white text-sm"
                      />
                    </div>

                    <input
                      type="text"
                      placeholder="DNI / Pasaporte"
                      value={buyerDni}
                      onChange={(e) => setBuyerDni(e.target.value)}
                      required={tab === 'nuevo'}
                      className="w-full p-3 bg-[#1f242e] border border-[#374151] rounded-xl outline-none text-white text-sm"
                    />

                    <input
                      type="email"
                      placeholder="Email Anfitrión"
                      value={buyerEmail}
                      onChange={(e) => setBuyerEmail(e.target.value)}
                      required={tab === 'nuevo'}
                      className="w-full p-3 bg-[#1f242e] border border-[#374151] rounded-xl outline-none text-white text-sm"
                    />

                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-bold text-purple-400 uppercase tracking-wider ml-1">Estado de Pago del Grupo</label>
                      <select
                        value={estadoPago}
                        onChange={(e) => setEstadoPago(e.target.value as any)}
                        className="p-3 bg-[#1f242e] border border-[#374151] rounded-xl outline-none text-white text-sm"
                      >
                        <option value="pendiente">Pendiente</option>
                        <option value="aprobado">Aprobado (Entradas listas)</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* LISTA DE INVITADOS (TEXTAREA) */}
              <div className="flex flex-col gap-1.5 mt-2">
                <label className="text-xs font-bold text-purple-400 uppercase tracking-wider ml-2 flex justify-between">
                  <span>Lista de Invitados</span>
                  <span className="text-[10px] text-gray-500 font-normal">Uno por línea</span>
                </label>
                <textarea
                  rows={6}
                  placeholder={`Ejemplo:\nJuan Perez, 12345678\nMaria Gomez - 87654321\nCarlos Lopez 11223344`}
                  value={invitadosText}
                  onChange={(e) => setInvitadosText(e.target.value)}
                  required
                  className="p-4 bg-[#1f242e] border border-[#374151] rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none text-white transition-all text-xs font-mono placeholder-gray-600 leading-relaxed resize-none"
                />
                <p className="text-[10px] text-gray-500 ml-2">Formatos válidos por línea: <code className="text-pink-400">Nombre Apellido, DNI</code> o <code className="text-pink-400">Nombre Apellido DNI</code>. Si no tiene DNI, poné solo su nombre.</p>
              </div>

              {/* SUBMIT */}
              <button
                type="submit"
                disabled={loading}
                className="w-full mt-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold p-4 rounded-xl hover:opacity-90 disabled:opacity-50 transition-all shadow-[0_0_20px_rgba(168,85,247,0.4)] active:scale-[0.98] cursor-pointer text-sm uppercase tracking-wider"
              >
                {loading ? 'Cargando Invitados...' : 'Procesar Carga Masiva'}
              </button>

            </form>
          </div>
        </div>
      )}
    </>
  )
}
