import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  try {
    const { token } = await request.json()
    if (!token) return NextResponse.json({ error: 'Token faltante' }, { status: 400 })

    const supabase = await createClient()

    const { data: asistente, error } = await supabase
      .from('asistentes')
      .select('id, nombre, apellido, estado_pago, ingresado, hora_ingreso')
      .eq('qr_token', token)
      .single()

    if (error || !asistente) {
      return NextResponse.json({ error: 'QR Inválido o Entrada no existe' }, { status: 404 })
    }

    if (asistente.estado_pago === 'pendiente') {
      return NextResponse.json({ error: 'Entrada NO PAGADA / PENDIENTE' }, { status: 403 })
    }

    if (asistente.ingresado) {
      const hora = new Date(asistente.hora_ingreso).toLocaleTimeString()
      return NextResponse.json({ error: `¡YA INGRESÓ a las ${hora}!` }, { status: 409 })
    }

    const { error: updateError } = await supabase
      .from('asistentes')
      .update({ ingresado: true, hora_ingreso: new Date().toISOString() })
      .eq('id', asistente.id)

    if (updateError) {
      return NextResponse.json({ error: 'Error interno guardando ingreso' }, { status: 500 })
    }

    return NextResponse.json({ success: true, nombre: asistente.nombre })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Error en servidor' }, { status: 500 })
  }
}
