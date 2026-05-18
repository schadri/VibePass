import { createAdminClient } from '@/lib/supabase/server'
import localFont from 'next/font/local'
import QRCode from 'qrcode'
import { headers } from 'next/headers'
import Link from 'next/link'
import { TicketCliente } from '@/components/ticket/TicketCliente'

const dinNextShadow = localFont({
  src: '../../../public/fonts/DINNextShadow-Black.ttf',
})

interface TicketPageProps {
  params: Promise<{
    token: string
  }>
}

export default async function TicketPage({ params }: TicketPageProps) {
  const resolvedParams = await params
  const token = resolvedParams.token

  const supabase = await createAdminClient()

  // Buscar asistente por token de forma segura
  const { data: asistente, error } = await supabase
    .from('asistentes')
    .select('*')
    .eq('qr_token', token)
    .single()

  if (error || !asistente) {
    return (
      <div className="relative flex flex-col items-center justify-center min-h-screen p-4 text-center bg-[url('/fondo_cel.jpg')] md:bg-[url('/fondo_windscreen.jpg')] bg-cover bg-center bg-no-repeat overflow-hidden">
        <div className="absolute inset-0 bg-black/60 z-0" />
        
        <div className="bg-[#161920]/95 backdrop-blur-md border border-red-500/30 p-8 rounded-3xl shadow-[0_0_40px_rgba(239,68,68,0.15)] max-w-md w-full relative overflow-hidden text-center z-10">
          <div className="w-16 h-16 bg-red-500/10 border border-red-500/20 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-red-400 mb-2">Entrada no encontrada</h2>
          <p className="text-gray-400 text-sm mb-6 leading-relaxed">
            El enlace que ingresaste es inválido o la entrada fue dada de baja del sistema.
          </p>
          <Link 
            href="/" 
            className="inline-block bg-zinc-900 border border-zinc-800 text-white font-bold py-3 px-6 rounded-xl hover:bg-zinc-800 transition-colors w-full"
          >
            Ir a la web oficial
          </Link>
        </div>
      </div>
    )
  }

  // Generar QR si está aprobado
  let qrBase64 = ''
  const isAprobado = asistente.estado_pago === 'aprobado'

  if (isAprobado) {
    const headersList = await headers()
    const host = headersList.get('host') || 'localhost:3000'
    const protocol = host.startsWith('localhost') ? 'http' : 'https'
    const baseUrl = `${protocol}://${host}`
    const validacionUrl = `${baseUrl}/admin/scanner?token=${asistente.qr_token}`
    
    try {
      qrBase64 = await QRCode.toDataURL(validacionUrl, {
        width: 400,
        margin: 2,
        color: { dark: '#000000', light: '#ffffff' }
      })
    } catch (e) {
      console.error('Error generando QR en Server Component:', e)
    }
  }

  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen p-4 sm:p-6 text-center bg-[url('/fondo_cel.jpg')] md:bg-[url('/fondo_windscreen.jpg')] bg-cover bg-center bg-no-repeat overflow-hidden select-none">
      {/* Black semi-transparent overlay */}
      <div className="absolute inset-0 bg-black/55 z-0" />

      <div className="relative z-10 w-full max-w-sm sm:max-w-md animate-in fade-in duration-300">
        
        {/* LOGO SUPERIOR */}
        <div className="text-center mb-6">
          <h1 className={`${dinNextShadow.className} text-3xl sm:text-4xl font-black text-black leading-none uppercase tracking-widest [text-shadow:-1px_-1px_0_#e22a8e,_1px_-1px_0_#e22a8e,_-1px_1px_0_#e22a8e,_1px_1px_0_#e22a8e,_0_0_15px_rgba(226,42,142,0.5)]`}>
            Pecado & Perreo
          </h1>
          <p className="text-[10px] text-purple-400 font-extrabold uppercase tracking-widest mt-1">E X P E R I E N C E</p>
        </div>

        {/* COMPONENTE INTERACTIVO DE CLIENTE */}
        <TicketCliente asistente={asistente} qrBase64={qrBase64} />

        {/* PIE DE PÁGINA */}
        <div className="text-center text-[10px] text-gray-500 mt-8 pb-4">
          <p>Pecado & Perreo © 2026</p>
          <p className="mt-1 font-mono text-purple-500/30">SECURE_PASS_v2.5</p>
        </div>
      </div>
    </div>
  )
}
