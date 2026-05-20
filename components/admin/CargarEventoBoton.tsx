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
  eventoId?: string
}

export function CargarEventoBoton({ compradores, eventoId }: CargarEventoBotonProps) {
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
  const [parsedInvitados, setParsedInvitados] = useState<Array<{ nombre: string; apellido: string; dni: string }>>([])

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
    setParsedInvitados([])
  }

  // Procesar el texto pegado en la caja y añadirlo a la lista de previsualización
  const handlePreview = () => {
    if (!invitadosText.trim()) return
    const lines = invitadosText.split('\n')
    const parsed: Array<{ nombre: string; apellido: string; dni: string }> = []

    for (let line of lines) {
      line = line.trim()
      if (!line) continue

      // Limpieza de introducciones comunes de WhatsApp
      line = line.replace(/^(lista\s*(cumple|grupo|invitados)?\s*[\-\–\—]?\s*)+/i, '')

      let nombre = ''
      let apellido = ''
      let dni = ''

      // RegExp calibrada idéntica al servidor
      const match = line.match(/^\s*(?:\d+[\.\)\-]?\s*)?(.+?)\s*(?:[\-\–\—]?\s*)?(?:dni|pasaporte|documento|pass|lc|le|ci)?\s*(?:n[o°º]|\.|\:)?\s*([a-zA-Z0-9\.]+)\s*$/i)

      if (match) {
        const fullName = match[1].trim()
        dni = match[2].trim()
        const nameParts = fullName.split(/\s+/)
        nombre = (nameParts[0] || '').replace(/,+$/, '').trim()
        apellido = (nameParts.slice(1).join(' ') || '').replace(/,+$/, '').trim()
      } else {
        const cleanedFallbackLine = line.replace(/^\s*(?:\d+[\.\)\-]?\s*)/, '').trim()
        const nameParts = cleanedFallbackLine.split(/\s+/)
        nombre = (nameParts[0] || '').replace(/,+$/, '').trim()
        apellido = (nameParts.slice(1).join(' ') || '').replace(/,+$/, '').trim()
        dni = 'S/D'
      }

      parsed.push({ nombre, apellido, dni })
    }

    setParsedInvitados([...parsedInvitados, ...parsed])
    setInvitadosText('') // Limpiar caja una vez procesado
  }

  const handleEditRow = (index: number, field: 'nombre' | 'apellido' | 'dni', value: string) => {
    const updated = [...parsedInvitados]
    updated[index] = {
      ...updated[index],
      [field]: value
    }
    setParsedInvitados(updated)
  }

  const handleRemoveRow = (index: number) => {
    setParsedInvitados(parsedInvitados.filter((_, i) => i !== index))
  }

  const handleClearAll = () => {
    setParsedInvitados([])
    setInvitadosText('')
  }

  const handleAddEmptyRow = () => {
    setParsedInvitados([...parsedInvitados, { nombre: '', apellido: '', dni: '' }])
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
    
    if (!eventoId) {
      setMessage({ type: 'error', text: 'Error: No hay evento seleccionado.' })
      setLoading(false)
      return
    }

    // Auto-añadir lo que esté en el textarea si la lista está vacía
    let listToSave = [...parsedInvitados]
    if (invitadosText.trim() && listToSave.length === 0) {
      const lines = invitadosText.split('\n')
      for (let line of lines) {
        line = line.trim()
        if (!line) continue
        line = line.replace(/^(lista\s*(cumple|grupo|invitados)?\s*[\-\–\—]?\s*)+/i, '')
        let nombre = ''
        let apellido = ''
        let dni = ''
        const match = line.match(/^\s*(?:\d+[\.\)\-]?\s*)?(.+?)\s*(?:[\-\–\—]?\s*)?(?:dni|pasaporte|documento|pass|lc|le|ci)?\s*(?:n[o°º]|\.|\:)?\s*([a-zA-Z0-9\.]+)\s*$/i)
        if (match) {
          const fullName = match[1].trim()
          dni = match[2].trim()
          const nameParts = fullName.split(/\s+/)
          nombre = (nameParts[0] || '').replace(/,+$/, '').trim()
          apellido = (nameParts.slice(1).join(' ') || '').replace(/,+$/, '').trim()
        } else {
          const cleanedFallbackLine = line.replace(/^\s*(?:\d+[\.\)\-]?\s*)/, '').trim()
          const nameParts = cleanedFallbackLine.split(/\s+/)
          nombre = (nameParts[0] || '').replace(/,+$/, '').trim()
          apellido = (nameParts.slice(1).join(' ') || '').replace(/,+$/, '').trim()
          dni = 'S/D'
        }
        listToSave.push({ nombre, apellido, dni })
      }
    }

    if (listToSave.length === 0) {
      setMessage({ type: 'error', text: 'Por favor, ingresa al menos un invitado en la lista.' })
      setLoading(false)
      return
    }

    // Validar nombres vacíos
    if (listToSave.some(inv => !inv.nombre.trim())) {
      setMessage({ type: 'error', text: 'Todos los invitados en la previsualización deben tener al menos un nombre.' })
      setLoading(false)
      return
    }

    // Convertir de nuevo a texto string para enviar al servidor
    const formattedText = listToSave.map(inv => `${inv.nombre} ${inv.apellido}, ${inv.dni}`).join('\n')

    try {
      const res = await cargarEventoMasivo({
        compradorExistenteId: tab === 'existente' ? compradorId : undefined,
        buyerNombre: tab === 'nuevo' ? buyerNombre : undefined,
        buyerApellido: tab === 'nuevo' ? buyerApellido : undefined,
        buyerDni: tab === 'nuevo' ? buyerDni : undefined,
        buyerEmail: tab === 'nuevo' ? buyerEmail : undefined,
        estadoPago: tab === 'nuevo' ? estadoPago : undefined,
        invitadosText: formattedText,
        eventoId: eventoId
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
          <div className="relative w-full max-w-2xl p-6 sm:p-8 bg-[#161920]/95 border border-[#2D0A4E] rounded-3xl shadow-[0_0_55px_rgba(168,85,247,0.3)] backdrop-blur-md animate-scale-in text-left max-h-[95vh] overflow-y-auto">
            
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
                  <span>Pegar Lista de Invitados (WhatsApp)</span>
                  <span className="text-[10px] text-gray-500 font-normal">Uno por línea</span>
                </label>
                <textarea
                  rows={4}
                  placeholder={`Pegá la lista de WhatsApp acá. Ejemplo:\n1. Carlos Perez - DNI 12.345.678\n2. Quintana Paola - DNI 31569486`}
                  value={invitadosText}
                  onChange={(e) => setInvitadosText(e.target.value)}
                  className="p-4 bg-[#1f242e] border border-[#374151] rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none text-white transition-all text-xs font-mono placeholder-gray-600 leading-relaxed resize-none"
                />
                
                <div className="flex gap-2.5 mt-1.5">
                  <button
                    type="button"
                    onClick={handlePreview}
                    disabled={!invitadosText.trim()}
                    className="flex-1 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-black rounded-xl hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-xs uppercase tracking-wider cursor-pointer shadow-lg shadow-purple-950/20"
                  >
                    Añadir y Previsualizar
                  </button>
                  <button
                    type="button"
                    onClick={handleClearAll}
                    className="px-4 py-3 bg-zinc-800 hover:bg-zinc-700 text-gray-300 font-black rounded-xl transition-all text-xs uppercase tracking-wider cursor-pointer"
                  >
                    Limpiar Todo
                  </button>
                </div>
                <p className="text-[9px] text-gray-500 ml-2 mt-1">
                  💡 Hacé clic en <strong>Añadir y Previsualizar</strong> para verificar, corregir y editar los nombres y documentos antes de guardarlos definitivamente.
                </p>
              </div>

              {/* TABLA DE PREVISUALIZACIÓN EDITABLE */}
              {parsedInvitados.length > 0 && (
                <div className="space-y-3 mt-4 border-t border-[#2D0A4E]/30 pt-4 animate-in fade-in duration-200">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-black text-pink-400 uppercase tracking-widest block">
                      Lista para Cargar ({parsedInvitados.length} Invitados)
                    </span>
                    <button
                      type="button"
                      onClick={handleClearAll}
                      className="text-[10px] font-black uppercase tracking-wider text-red-400 hover:text-red-300 transition-colors cursor-pointer"
                    >
                      Vaciar Lista
                    </button>
                  </div>

                  <div className="max-h-60 overflow-y-auto pr-1 space-y-2">
                    {parsedInvitados.map((inv, index) => (
                      <div key={index} className="flex gap-2 items-center bg-[#101216]/60 p-2 rounded-xl border border-zinc-800/80 animate-in fade-in duration-150">
                        <input
                          type="text"
                          value={inv.nombre}
                          onChange={(e) => handleEditRow(index, 'nombre', e.target.value)}
                          placeholder="Nombre"
                          required
                          className="flex-1 min-w-0 p-2 bg-[#1f242e] border border-[#374151] rounded-lg text-white text-xs outline-none focus:ring-1 focus:ring-purple-500"
                        />
                        <input
                          type="text"
                          value={inv.apellido}
                          onChange={(e) => handleEditRow(index, 'apellido', e.target.value)}
                          placeholder="Apellido"
                          className="flex-1 min-w-0 p-2 bg-[#1f242e] border border-[#374151] rounded-lg text-white text-xs outline-none focus:ring-1 focus:ring-purple-500"
                        />
                        <input
                          type="text"
                          value={inv.dni}
                          onChange={(e) => handleEditRow(index, 'dni', e.target.value)}
                          placeholder="DNI / Pasaporte"
                          className="w-28 min-w-0 p-2 bg-[#1f242e] border border-[#374151] rounded-lg text-white text-xs font-mono outline-none focus:ring-1 focus:ring-purple-500"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveRow(index)}
                          className="p-2 text-red-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer"
                          title="Eliminar invitado"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={handleAddEmptyRow}
                    className="w-full py-2 bg-[#101216]/80 hover:bg-[#1f242e] text-purple-400 hover:text-purple-300 font-bold rounded-xl border border-dashed border-purple-500/30 transition-all text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                    </svg>
                    + Añadir Fila Manual
                  </button>
                </div>
              )}

              {/* SUBMIT */}
              <button
                type="submit"
                disabled={loading}
                className="w-full mt-6 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold p-4 rounded-xl hover:opacity-90 disabled:opacity-50 transition-all shadow-[0_0_20px_rgba(168,85,247,0.4)] active:scale-[0.98] cursor-pointer text-sm uppercase tracking-wider"
              >
                {loading ? 'Cargando Invitados...' : 'Confirmar y Guardar Grupo'}
              </button>

            </form>
          </div>
        </div>
      )}
    </>
  )
}
