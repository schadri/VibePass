'use server'

import { createAdminClient } from '@/lib/supabase/server'

export async function registrarAsistente(formData: FormData) {
  const supabase = await createAdminClient()

  const nombre = formData.get('nombre') as string
  const apellido = formData.get('apellido') as string
  const dni = formData.get('dni') as string
  const email = formData.get('email') as string
  const es2x1 = formData.get('es_2x1') === 'on'

  if (!nombre || !apellido || !dni || !email) {
    return { error: 'Faltan campos obligatorios' }
  }

  // 1. Insertar al Titular
  const { data: titular, error: errorTitular } = await supabase
    .from('asistentes')
    .insert({
      nombre,
      apellido,
      dni,
      email,
      estado_pago: 'pendiente'
    })
    .select('id, orden_id, nombre, apellido')
    .single()

  if (errorTitular) {
    if (errorTitular.code === '23505') {
      return { error: 'Ya existe un registro con ese DNI o Email.' }
    }
    return { error: errorTitular.message }
  }

  // 2. Si es 2x1, insertar al Acompañante vinculado
  if (es2x1) {
    const acompNombre = formData.get('acompanante_nombre') as string
    const acompApellido = formData.get('acompanante_apellido') as string
    const acompDni = formData.get('acompanante_dni') as string

    if (acompNombre && acompApellido && acompDni) {
      await supabase
        .from('asistentes')
        .insert({
          nombre: acompNombre,
          apellido: acompApellido,
          dni: acompDni,
          email: email, // Mismo email para recibir ambos QR
          estado_pago: 'pendiente',
          titular_id: titular.id
        })
    }
  }

  return { success: true, ...titular }
}
