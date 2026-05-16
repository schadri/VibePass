import { createClient } from '@/lib/supabase/server'
import { AprobarBoton } from '@/components/admin/AprobarBoton'

export const revalidate = 0 // Disable cache for this page

export default async function DashboardPage() {
  const supabase = await createClient()

  const { data: asistentes, error } = await supabase
    .from('asistentes')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    return <div className="p-8 text-red-500">Error cargando asistentes: {error.message}</div>
  }

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Dashboard de Administración</h1>
      
      <div className="overflow-x-auto bg-white rounded-lg shadow">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-100 border-b">
              <th className="p-4 font-semibold text-gray-600">Orden</th>
              <th className="p-4 font-semibold text-gray-600">Asistente</th>
              <th className="p-4 font-semibold text-gray-600">DNI</th>
              <th className="p-4 font-semibold text-gray-600">Referencia</th>
              <th className="p-4 font-semibold text-gray-600">Estado Pago</th>
              <th className="p-4 font-semibold text-gray-600">Ingreso</th>
              <th className="p-4 font-semibold text-gray-600">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {asistentes?.map((a: any) => (
              <tr key={a.id} className="border-b hover:bg-gray-50">
                <td className="p-4 font-mono">#{a.orden_id}</td>
                <td className="p-4">
                  <div className="font-bold">{a.nombre} {a.apellido}</div>
                  <div className="text-sm text-gray-500">{a.email}</div>
                </td>
                <td className="p-4">{a.dni}</td>
                <td className="p-4">{a.numero_referencia || '-'}</td>
                <td className="p-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                    a.estado_pago === 'aprobado' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {a.estado_pago}
                  </span>
                </td>
                <td className="p-4">
                  {a.ingresado ? (
                    <span className="text-green-600 font-bold">Sí ({new Date(a.hora_ingreso).toLocaleTimeString()})</span>
                  ) : (
                    <span className="text-gray-400">No</span>
                  )}
                </td>
                <td className="p-4">
                  {a.estado_pago === 'pendiente' && (
                    <AprobarBoton asistenteId={a.id} />
                  )}
                </td>
              </tr>
            ))}
            {asistentes?.length === 0 && (
              <tr>
                <td colSpan={7} className="p-8 text-center text-gray-500">No hay asistentes registrados.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
