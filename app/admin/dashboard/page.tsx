import React from 'react'
import { createAdminClient } from '@/lib/supabase/server'
import { AprobarBoton } from '@/components/admin/AprobarBoton'
import { BorrarBoton } from '@/components/admin/BorrarBoton'
import { CambiarPreciosBoton } from '@/components/admin/CambiarPreciosBoton'
import { ConfigurarFechaBoton } from '@/components/admin/ConfigurarFechaBoton'
import { CargarEventoBoton } from '@/components/admin/CargarEventoBoton'
import { CompartirGrupoBoton } from '@/components/admin/CompartirGrupoBoton'

export const revalidate = 0 // Disable cache for this page

export default async function DashboardPage() {
  const supabase = await createAdminClient()

  const { data: asistentes, error } = await supabase
    .from('asistentes')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    return <div className="p-8 text-red-500">Error cargando asistentes: {error.message}</div>
  }

  // Filtrar compradores existentes (los que no tienen titular_id)
  const compradores = (asistentes || [])
    .filter(a => !a.titular_id)
    .map(a => ({
      id: a.id,
      nombre: a.nombre,
      apellido: a.apellido,
      orden_id: String(a.orden_id),
      email: a.email || ''
    }))

  return (
    <main className="min-h-screen bg-black text-white bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#2D0A4E] via-black to-black p-4 sm:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <h1 className="text-3xl sm:text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600 drop-shadow-[0_0_15px_rgba(168,85,247,0.5)]">
            Dashboard de Administración
          </h1>
          <div className="flex items-center gap-3 flex-wrap">
            <CargarEventoBoton compradores={compradores} />
            <ConfigurarFechaBoton />
            <CambiarPreciosBoton />
          </div>
        </div>
        
        <div className="bg-[#161920]/80 backdrop-blur-sm border-0 lg:border border-[#2D0A4E] rounded-xl shadow-none lg:shadow-[0_0_30px_rgba(168,85,247,0.15)]">
          <table className="w-full text-left border-collapse block lg:table">
            <thead className="hidden lg:table-header-group">
              <tr className="bg-[#0d0e12] border-b border-[#2D0A4E]">
                <th className="p-4 font-semibold text-purple-400 text-xs sm:text-sm uppercase tracking-wider">Orden</th>
                <th className="p-4 font-semibold text-purple-400 text-xs sm:text-sm uppercase tracking-wider">Asistente</th>
                <th className="p-4 font-semibold text-purple-400 text-xs sm:text-sm uppercase tracking-wider">DNI</th>
                <th className="p-4 font-semibold text-purple-400 text-xs sm:text-sm uppercase tracking-wider">Entrada</th>
                <th className="p-4 font-semibold text-purple-400 text-xs sm:text-sm uppercase tracking-wider">Estado</th>
                <th className="p-4 font-semibold text-purple-400 text-xs sm:text-sm uppercase tracking-wider">Ingreso</th>
                <th className="p-4 font-semibold text-purple-400 text-xs sm:text-sm uppercase tracking-wider text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="block lg:table-row-group">
              {asistentes?.filter(a => !a.titular_id).map((t: any) => (
                <React.Fragment key={t.id}>
                  {/* FILA ANFITRIÓN (TITULAR) */}
                  <tr className="block lg:table-row bg-[#0d0e12] lg:bg-transparent border border-[#2D0A4E] lg:border-b lg:border-x-0 lg:border-t-0 rounded-xl lg:rounded-none mb-4 lg:mb-0 lg:hover:bg-[#1a1e26] shadow-lg lg:shadow-none transition-colors">
                    
                    {/* Celda Mobile/Orden */}
                    <td className="block lg:table-cell p-4 lg:p-4 border-b border-[#2D0A4E]/30 lg:border-none">
                      <div className="lg:hidden flex flex-col relative">
                        <input type="checkbox" id={`toggle-${t.id}`} className="peer hidden" />
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="font-bold text-white text-lg leading-tight flex items-center gap-2 flex-wrap">
                              {t.nombre} {t.apellido}
                              <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider border ${
                                asistentes.some(ac => ac.titular_id === t.id)
                                  ? 'bg-pink-500/10 text-pink-400 border-pink-500/20'
                                  : 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                              }`}>
                                {asistentes.some(ac => ac.titular_id === t.id) ? 'Doble' : 'Simple'}
                              </span>
                            </div>
                            <div className="font-mono text-purple-400 text-sm mt-1">#{t.orden_id}</div>
                          </div>
                          <div className="flex flex-col items-end gap-2">
                            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                              t.estado_pago === 'aprobado' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                            }`}>
                              {t.estado_pago}
                            </span>
                          </div>
                        </div>
                        <div className="hidden peer-checked:flex flex-col gap-3 mt-4 pt-4 border-t border-[#2D0A4E]/30">
                          <div className="flex justify-between items-center"><span className="font-bold text-purple-400 text-xs uppercase tracking-wider">Email</span><span className="text-gray-300 text-sm truncate max-w-[200px]">{t.email}</span></div>
                          <div className="flex justify-between items-center"><span className="font-bold text-purple-400 text-xs uppercase tracking-wider">DNI</span><span className="text-gray-300 text-sm">{t.dni}</span></div>
                          {asistentes.filter(ac => ac.titular_id === t.id).length > 1 && (
                            <div className="flex justify-between items-center border-b border-[#2D0A4E]/10 pb-2">
                              <span className="font-bold text-purple-400 text-xs uppercase tracking-wider">Panel Cumpleaños</span>
                              <CompartirGrupoBoton nombre={t.nombre} apellido={t.apellido} qrToken={t.qr_token} />
                            </div>
                          )}
                          <div className="flex flex-col mt-2 pt-3 border-t border-[#2D0A4E]/30 gap-2 font-semibold">
                            <span className="font-bold text-purple-400 text-xs uppercase tracking-wider text-center mb-1">Acciones</span>
                            <div className="flex justify-center gap-2">
                              {t.estado_pago === 'pendiente' ? <AprobarBoton asistenteId={t.id} /> : <AprobarBoton asistenteId={t.id} isReenviar={true} />}
                              <BorrarBoton asistenteId={t.id} hasCompanion={asistentes.some(ac => ac.titular_id === t.id)} />
                            </div>
                          </div>
                        </div>
                        <label htmlFor={`toggle-${t.id}`} className="w-full text-center mt-4 text-purple-400 font-bold text-[10px] uppercase cursor-pointer peer-checked:hidden block bg-[#2D0A4E]/10 py-1.5 rounded-lg border border-[#2D0A4E]/30">Ver Detalles ▼</label>
                        <label htmlFor={`toggle-${t.id}`} className="w-full text-center mt-4 text-purple-400 font-bold text-[10px] uppercase cursor-pointer hidden peer-checked:block bg-[#2D0A4E]/10 py-1.5 rounded-lg border border-[#2D0A4E]/30">Ocultar ▲</label>
                      </div>
                      <div className="hidden lg:block font-mono text-gray-400 text-sm">#{t.orden_id}</div>
                    </td>

                    <td className="hidden lg:table-cell p-4 border-b border-[#2D0A4E]/30 lg:border-none">
                      <div className="font-bold text-white text-base leading-tight">{t.nombre} {t.apellido}</div>
                      <div className="text-sm text-gray-400">{t.email}</div>
                    </td>
                    <td className="hidden lg:table-cell p-4 border-b border-[#2D0A4E]/30 lg:border-none"><span className="text-gray-300 text-sm">{t.dni}</span></td>
                    <td className="hidden lg:table-cell p-4 border-b border-[#2D0A4E]/30 lg:border-none">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                        asistentes.some(ac => ac.titular_id === t.id)
                          ? 'bg-pink-500/10 text-pink-400 border-pink-500/20'
                          : 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                      }`}>
                        {asistentes.some(ac => ac.titular_id === t.id) ? 'Doble' : 'Simple'}
                      </span>
                    </td>
                    <td className="hidden lg:table-cell p-4 border-b border-[#2D0A4E]/30 lg:border-none">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                        t.estado_pago === 'aprobado' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                      }`}>
                        {t.estado_pago}
                      </span>
                    </td>
                    <td className="hidden lg:table-cell p-4 border-b border-[#2D0A4E]/30 lg:border-none">
                      {t.ingresado ? <span className="text-emerald-400 font-bold flex items-center gap-2 text-sm"><span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>Sí ({new Date(t.hora_ingreso).toLocaleTimeString()})</span> : <span className="text-gray-500 text-sm">No</span>}
                    </td>
                    <td className="hidden lg:table-cell p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {asistentes.filter(ac => ac.titular_id === t.id).length > 1 && (
                          <CompartirGrupoBoton nombre={t.nombre} apellido={t.apellido} qrToken={t.qr_token} />
                        )}
                        {t.estado_pago === 'pendiente' ? <AprobarBoton asistenteId={t.id} /> : <AprobarBoton asistenteId={t.id} isReenviar={true} />}
                        <BorrarBoton asistenteId={t.id} hasCompanion={asistentes.some(ac => ac.titular_id === t.id)} />
                      </div>
                    </td>
                  </tr>

                  {/* FILAS ACOMPAÑANTES */}
                  {asistentes?.filter(ac => ac.titular_id === t.id).map((ac: any) => (
                    <tr key={ac.id} className="block lg:table-row bg-[#0d0e12]/40 lg:bg-[#111318]/30 border-x border-b border-[#2D0A4E]/20 lg:border-b lg:border-x-0 lg:border-t-0 mb-4 lg:mb-0 opacity-80">
                      
                      <td className="block lg:table-cell p-3 lg:p-4 lg:pl-12 border-b border-[#2D0A4E]/10 lg:border-none">
                        <div className="lg:hidden flex justify-between items-center pl-4 border-l-2 border-purple-500/30">
                          <div className="flex items-center gap-2">
                            <span className="text-purple-500 font-bold">↳</span>
                            <div className="font-bold text-gray-400 text-sm">{ac.nombre} {ac.apellido}</div>
                          </div>
                          <span className="text-[9px] bg-pink-500/10 text-pink-500/60 px-1.5 py-0.5 rounded border border-pink-500/20 font-bold uppercase tracking-tighter">Acompañante</span>
                        </div>
                        <div className="hidden lg:block font-mono text-gray-600 text-xs pl-4">↳ #{ac.orden_id}</div>
                      </td>

                      <td className="hidden lg:table-cell p-4 border-b border-[#2D0A4E]/10 lg:border-none">
                        <div className="flex items-center gap-2">
                          <span className="text-gray-600 text-lg">↳</span>
                          <div className="font-bold text-gray-400 text-sm">{ac.nombre} {ac.apellido}</div>
                          <span className="text-[8px] bg-pink-500/5 text-pink-500/40 px-1 py-0 rounded border border-pink-500/10 font-bold uppercase tracking-tighter">Invitado</span>
                        </div>
                      </td>
                      <td className="hidden lg:table-cell p-4 border-b border-[#2D0A4E]/10 lg:border-none"><span className="text-gray-500 text-xs">{ac.dni}</span></td>
                      <td className="hidden lg:table-cell p-4 border-b border-[#2D0A4E]/10 lg:border-none">
                        <span className="text-pink-500/40 text-[10px] font-bold uppercase tracking-wider">Doble</span>
                      </td>
                      <td className="hidden lg:table-cell p-4 border-b border-[#2D0A4E]/10 lg:border-none">
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase border ${
                          ac.estado_pago === 'aprobado' ? 'text-emerald-500/40 border-emerald-500/10' : 'text-amber-500/40 border-amber-500/10'
                        }`}>
                          {ac.estado_pago}
                        </span>
                      </td>
                      <td className="hidden lg:table-cell p-4 border-b border-[#2D0A4E]/10 lg:border-none">
                        {ac.ingresado ? <span className="text-emerald-500/50 text-xs flex items-center gap-1">Sí</span> : <span className="text-gray-600 text-xs text-center">No</span>}
                      </td>
                      <td className="hidden lg:table-cell p-4 text-right">
                        <div className="flex items-center justify-end gap-2 scale-90 origin-right">
                          <BorrarBoton asistenteId={ac.id} />
                        </div>
                      </td>
                    </tr>
                  ))}
                </React.Fragment>
              ))}
              {asistentes?.length === 0 && (
                <tr className="block lg:table-row">
                  <td colSpan={7} className="block lg:table-cell p-12 text-center text-gray-500 text-lg">No hay asistentes registrados aún.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  )
}
