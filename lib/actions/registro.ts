'use server'

import { createClient } from '@/lib/supabase/server'

export async function registrarAsistente(formData: FormData) {
  const supabase = await createClient()

  const nombre = formData.get('nombre') as string
  const apellido = formData.get('apellido') as string
  const dni = formData.get('dni') as string
  const email = formData.get('email') as string
  const numero_referencia = formData.get('numero_referencia') as string

  if (!nombre || !apellido || !dni || !email) {
    return { error: 'Faltan campos obligatorios' }
  }

  const { data, error } = await supabase
    .from('asistentes')
    .insert({
      nombre,
      apellido,
      dni,
      email,
      numero_referencia: numero_referencia || null,
      estado_pago: 'pendiente'
    })
    .select('id, orden_id, nombre')
    .single()

  if (error) {
    // Si el DNI ya existe, el código de error único es 23505
    if (error.code === '23505') {
      return { error: 'Ya existe un registro con ese DNI o Email.' }
    }
    return { error: error.message }
  }

  return { success: true, ...data }
}
