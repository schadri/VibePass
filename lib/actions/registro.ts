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

export async function obtenerPrecios() {
  const supabase = await createAdminClient()
  try {
    const { data, error } = await supabase
      .from('precios')
      .select('*')
      .eq('id', 'default')
      .single()

    if (error || !data) {
      // Fallback a los precios por defecto si hay un error o no existe el registro
      return { simple: 5000, doble: 8500, puerta: 10000, promo_puerta: 9000, ocultar_promo_puerta: false, fecha_evento: null }
    }
    return {
      simple: data.simple,
      doble: data.doble,
      puerta: data.puerta,
      promo_puerta: data.promo_puerta !== undefined ? data.promo_puerta : 9000,
      ocultar_promo_puerta: data.ocultar_promo_puerta !== undefined ? data.ocultar_promo_puerta : false,
      fecha_evento: data.fecha_evento || null
    }
  } catch (e) {
    return { simple: 5000, doble: 8500, puerta: 10000, promo_puerta: 9000, ocultar_promo_puerta: false, fecha_evento: null }
  }
}

export async function actualizarPrecios(simple: number, doble: number, puerta: number, promo_puerta: number, ocultar_promo_puerta: boolean) {
  const supabase = await createAdminClient()
  try {
    const { error } = await supabase
      .from('precios')
      .upsert({
        id: 'default',
        simple,
        doble,
        puerta,
        promo_puerta,
        ocultar_promo_puerta
      })

    if (error) throw error
    return { success: true }
  } catch (e: any) {
    return { success: false, error: e.message || 'Error al actualizar precios' }
  }
}

export async function actualizarFechaEvento(fecha: string | null) {
  const supabase = await createAdminClient()
  try {
    const { error } = await supabase
      .from('precios')
      .upsert({
        id: 'default',
        fecha_evento: fecha
      })

    if (error) throw error
    return { success: true }
  } catch (e: any) {
    return { success: false, error: e.message || 'Error al actualizar la fecha del evento' }
  }
}

export async function obtenerDatosOrden(ordenId: string) {
  const supabase = await createAdminClient()
  try {
    // 1. Buscar al titular por orden_id (titular_id es nulo)
    const { data: titular, error: errorTitular } = await supabase
      .from('asistentes')
      .select('id, nombre, apellido, email')
      .eq('orden_id', ordenId)
      .is('titular_id', null)
      .single()

    if (errorTitular || !titular) {
      return { error: 'Orden no encontrada' }
    }

    // 2. Buscar si tiene acompañantes vinculados
    const { data: acompanantes } = await supabase
      .from('asistentes')
      .select('id')
      .eq('titular_id', titular.id)

    const hasCompanion = !!(acompanantes && acompanantes.length > 0)

    // 3. Obtener los precios activos
    const precios = await obtenerPrecios()

    // 4. Calcular el total real basado en la base de datos
    const total = hasCompanion ? precios.doble : precios.simple

    return {
      success: true,
      nombre: titular.nombre,
      apellido: titular.apellido,
      email: titular.email,
      total,
      hasCompanion
    }
  } catch (e: any) {
    return { error: e.message || 'Error al obtener datos de la orden' }
  }
}
