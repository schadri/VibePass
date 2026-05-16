import { createAdminClient } from '@/lib/supabase/server'
import { AprobarBoton } from '@/components/admin/AprobarBoton'
import { BorrarBoton } from '@/components/admin/BorrarBoton'

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

  return (
    <main className="min-h-screen bg-black text-white bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#2D0A4E] via-black to-black p-4 sm:p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl sm:text-4xl font-extrabold mb-8 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600 drop-shadow-[0_0_15px_rgba(168,85,247,0.5)]">
          Dashboard de Administración
        </h1>
        
        <div className="bg-[#161920]/80 backdrop-blur-sm border-0 lg:border border-[#2D0A4E] rounded-xl shadow-none lg:shadow-[0_0_30px_rgba(168,85,247,0.15)]">
          <table className="w-full text-left border-collapse block lg:table">
            <thead className="hidden lg:table-header-group">
              <tr className="bg-[#0d0e12] border-b border-[#2D0A4E]">
                <th className="p-4 font-semibold text-purple-400 text-xs sm:text-sm uppercase tracking-wider">Orden</th>
                <th className="p-4 font-semibold text-purple-400 text-xs sm:text-sm uppercase tracking-wider">Asistente</th>
                <th className="p-4 font-semibold text-purple-400 text-xs sm:text-sm uppercase tracking-wider">DNI</th>
                <th className="p-4 font-semibold text-purple-400 text-xs sm:text-sm uppercase tracking-wider">Estado</th>
                <th className="p-4 font-semibold text-purple-400 text-xs sm:text-sm uppercase tracking-wider">Ingreso</th>
                <th className="p-4 font-semibold text-purple-400 text-xs sm:text-sm uppercase tracking-wider text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="block lg:table-row-group">
              {asistentes?.map((a: any) => (
                <tr key={a.id} className="block lg:table-row bg-[#0d0e12] lg:bg-transparent border border-[#2D0A4E] lg:border-b lg:border-x-0 lg:border-t-0 rounded-xl lg:rounded-none mb-4 lg:mb-0 lg:hover:bg-[#1a1e26] shadow-lg lg:shadow-none transition-colors">
                  
                  {/* UNICA CELDA VISIBLE EN MOBILE (Actúa como tarjeta completa) */}
                  <td className="block lg:table-cell p-4 lg:p-4 border-b border-[#2D0A4E]/30 lg:border-none">
                    
                    {/* --- MOBILE VIEW --- */}
                    <div className="lg:hidden flex flex-col relative">
                      <input type="checkbox" id={`toggle-${a.id}`} className="peer hidden" />
                      
                      {/* Cabecera siempre visible */}
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-bold text-white text-lg leading-tight">{a.nombre} {a.apellido}</div>
                          <div className="font-mono text-purple-400 text-sm mt-1">#{a.orden_id}</div>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                            a.estado_pago === 'aprobado' 
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                              : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                          }`}>
                            {a.estado_pago}
                          </span>
                        </div>
                      </div>

                      {/* Contenido Colapsable */}
                      <div className="hidden peer-checked:flex flex-col gap-3 mt-4 pt-4 border-t border-[#2D0A4E]/30">
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-purple-400 text-xs uppercase tracking-wider">Email</span>
                          <span className="text-gray-300 text-sm truncate max-w-[200px]">{a.email}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-purple-400 text-xs uppercase tracking-wider">DNI</span>
                          <span className="text-gray-300 text-sm">{a.dni}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-purple-400 text-xs uppercase tracking-wider">Ingreso</span>
                          {a.ingresado ? (
                            <span className="text-emerald-400 font-bold flex items-center gap-2 text-sm">
                              Sí ({new Date(a.hora_ingreso).toLocaleTimeString()})
                            </span>
                          ) : (
                            <span className="text-gray-500 text-sm">No</span>
                          )}
                        </div>
                        
                        <div className="flex flex-col mt-2 pt-3 border-t border-[#2D0A4E]/30 gap-2">
                          <span className="font-bold text-purple-400 text-xs uppercase tracking-wider text-center mb-1">Acciones</span>
                          <div className="flex justify-center gap-2">
                            {a.estado_pago === 'pendiente' ? (
                              <AprobarBoton asistenteId={a.id} />
                            ) : (
                              <AprobarBoton asistenteId={a.id} isReenviar={true} />
                            )}
                            <BorrarBoton asistenteId={a.id} />
                          </div>
                        </div>
                      </div>

                      {/* Botones Toggle */}
                      <label htmlFor={`toggle-${a.id}`} className="w-full text-center mt-4 text-purple-400 font-bold text-xs uppercase tracking-wider cursor-pointer peer-checked:hidden block bg-[#2D0A4E]/20 py-2 rounded-lg border border-[#2D0A4E]/50">
                        Ver Detalles ▼
                      </label>
                      <label htmlFor={`toggle-${a.id}`} className="w-full text-center mt-4 text-purple-400 font-bold text-xs uppercase tracking-wider cursor-pointer hidden peer-checked:block bg-[#2D0A4E]/20 py-2 rounded-lg border border-[#2D0A4E]/50">
                        Ocultar ▲
                      </label>
                    </div>

                    {/* --- DESKTOP VIEW (Primera celda) --- */}
                    <div className="hidden lg:block font-mono text-gray-400 text-sm">#{a.orden_id}</div>
                  </td>

                  {/* RESTO DE LAS CELDAS SOLO VISIBLES EN DESKTOP */}
                  <td className="hidden lg:table-cell p-4 border-b border-[#2D0A4E]/30 lg:border-none">
                    <div className="font-bold text-white text-base leading-tight">{a.nombre} {a.apellido}</div>
                    <div className="text-sm text-gray-400">{a.email}</div>
                  </td>
                  <td className="hidden lg:table-cell p-4 border-b border-[#2D0A4E]/30 lg:border-none">
                    <span className="text-gray-300 text-sm">{a.dni}</span>
                  </td>
                  <td className="hidden lg:table-cell p-4 border-b border-[#2D0A4E]/30 lg:border-none">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                      a.estado_pago === 'aprobado' 
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-[0_0_10px_rgba(52,211,153,0.2)]' 
                        : 'bg-amber-500/10 text-amber-400 border-amber-500/20 shadow-[0_0_10px_rgba(251,191,36,0.2)]'
                    }`}>
                      {a.estado_pago}
                    </span>
                  </td>
                  <td className="hidden lg:table-cell p-4 border-b border-[#2D0A4E]/30 lg:border-none">
                    {a.ingresado ? (
                      <span className="text-emerald-400 font-bold flex items-center gap-2 text-sm">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                        Sí ({new Date(a.hora_ingreso).toLocaleTimeString()})
                      </span>
                    ) : (
                      <span className="text-gray-500 text-sm">No</span>
                    )}
                  </td>
                  <td className="hidden lg:table-cell p-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {a.estado_pago === 'pendiente' ? (
                        <AprobarBoton asistenteId={a.id} />
                      ) : (
                        <AprobarBoton asistenteId={a.id} isReenviar={true} />
                      )}
                      <BorrarBoton asistenteId={a.id} />
                    </div>
                  </td>
                </tr>
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
