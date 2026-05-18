import { createAdminClient } from '@/lib/supabase/server'
import { GrupoDashboardClient } from '@/components/grupo/GrupoDashboardClient'
import Link from 'next/link'

interface GrupoPageProps {
  params: Promise<{
    token: string
  }>
}

export const revalidate = 0 // Disable cache for this dynamic page

export default async function GrupoPage({ params }: GrupoPageProps) {
  const resolvedParams = await params
  const token = resolvedParams.token

  const supabase = await createAdminClient()

  // 1. Buscar al titular por token (debe ser titular, por ende titular_id es null)
  const { data: titular, error: errorTitular } = await supabase
    .from('asistentes')
    .select('*')
    .eq('qr_token', token)
    .is('titular_id', null)
    .single()

  if (errorTitular || !titular) {
    return (
      <div className="relative flex flex-col items-center justify-center min-h-screen p-4 text-center bg-[url('/fondo_cel.jpg')] md:bg-[url('/fondo_windscreen.jpg')] bg-cover bg-center bg-no-repeat overflow-hidden">
        <div className="absolute inset-0 bg-black/70 z-0" />
        
        <div className="bg-[#161920]/95 backdrop-blur-md border border-red-500/30 p-8 rounded-3xl shadow-[0_0_40px_rgba(239,68,68,0.15)] max-w-md w-full relative overflow-hidden text-center z-10">
          <div className="w-16 h-16 bg-red-500/10 border border-red-500/20 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-red-400 mb-2">Panel no encontrado</h2>
          <p className="text-gray-400 text-sm mb-6 leading-relaxed">
            El enlace del grupo o cumpleaños es inválido, o el anfitrión no cuenta con permisos de administrador asignados.
          </p>
          <Link 
            href="/" 
            className="inline-block bg-zinc-900 border border-zinc-800 text-white font-bold py-3 px-6 rounded-xl hover:bg-zinc-800 transition-colors w-full"
          >
            Volver a la web oficial
          </Link>
        </div>
      </div>
    )
  }

  // 2. Buscar todos los acompañantes de este titular
  const { data: acompanantes, error: errorAcomp } = await supabase
    .from('asistentes')
    .select('*')
    .eq('titular_id', titular.id)
    .order('nombre', { ascending: true })

  // Si no tiene acompañantes o tiene exactamente 1 (ej: promo 2x1), no cuenta con panel de grupo
  if (!acompanantes || acompanantes.length <= 1) {
    return (
      <div className="relative flex flex-col items-center justify-center min-h-screen p-4 text-center bg-[url('/fondo_cel.jpg')] md:bg-[url('/fondo_windscreen.jpg')] bg-cover bg-center bg-no-repeat overflow-hidden">
        <div className="absolute inset-0 bg-black/70 z-0" />
        
        <div className="bg-[#161920]/95 backdrop-blur-md border border-red-500/30 p-8 rounded-3xl shadow-[0_0_40px_rgba(239,68,68,0.15)] max-w-md w-full relative overflow-hidden text-center z-10">
          <div className="w-16 h-16 bg-red-500/10 border border-red-500/20 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-red-400 mb-2">Panel no disponible</h2>
          <p className="text-gray-400 text-sm mb-6 leading-relaxed">
            Las compras promocionales o individuales no cuentan con panel de grupo autogestionado.
          </p>
          <Link 
            href="/" 
            className="inline-block bg-zinc-900 border border-zinc-800 text-white font-bold py-3 px-6 rounded-xl hover:bg-zinc-800 transition-colors w-full"
          >
            Volver a la web oficial
          </Link>
        </div>
      </div>
    )
  }

  const listadoInvitados = [titular, ...acompanantes]

  return (
    <GrupoDashboardClient 
      titular={titular} 
      invitados={listadoInvitados} 
    />
  )
}
