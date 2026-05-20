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

  // Obtener el evento activo
  const eventoActivo = await obtenerEventoActivo()
  if (!eventoActivo.id) {
    return { error: 'No hay ningún evento activo configurado.' }
  }

  // 1. Insertar al Titular
  const { data: titular, error: errorTitular } = await supabase
    .from('asistentes')
    .insert({
      nombre,
      apellido,
      dni,
      email,
      estado_pago: 'pendiente',
      evento_id: eventoActivo.id
    })
    .select('id, orden_id, nombre, apellido')
    .single()

  if (errorTitular) {
    if (errorTitular.code === '23505') {
      return { error: 'Ya existe un registro con ese DNI o Email en este evento.' }
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
          titular_id: titular.id,
          evento_id: eventoActivo.id
        })
    }
  }

  return { success: true, ...titular }
}

export async function obtenerEventoActivo() {
  const supabase = await createAdminClient()
  try {
    const { data, error } = await supabase
      .from('eventos')
      .select('*')
      .eq('activo', true)
      .limit(1)
      .single()

    if (error || !data) {
      return { id: null, nombre: 'VibePass', simple: 5000, doble: 8500, puerta: 10000, promo_puerta: 9000, ocultar_promo_puerta: false, fecha_evento: null }
    }
    return data
  } catch (e) {
    return { id: null, nombre: 'VibePass', simple: 5000, doble: 8500, puerta: 10000, promo_puerta: 9000, ocultar_promo_puerta: false, fecha_evento: null }
  }
}

export async function obtenerEventoPorId(eventoId: string) {
  const supabase = await createAdminClient()
  try {
    const { data, error } = await supabase
      .from('eventos')
      .select('*')
      .eq('id', eventoId)
      .single()
    if (error || !data) {
      return { id: null, nombre: 'VibePass', simple: 5000, doble: 8500, puerta: 10000, promo_puerta: 9000, ocultar_promo_puerta: false, fecha_evento: null }
    }
    return data
  } catch (e) {
    return { id: null, nombre: 'VibePass', simple: 5000, doble: 8500, puerta: 10000, promo_puerta: 9000, ocultar_promo_puerta: false, fecha_evento: null }
  }
}

// Mantenemos obtenerPrecios (como alias de evento activo) para no romper componentes que lo usaban sin id por defecto.
export async function obtenerPrecios() {
  return await obtenerEventoActivo()
}

export async function actualizarPrecios(eventoId: string, simple: number, doble: number, puerta: number, promo_puerta: number, ocultar_promo_puerta: boolean) {
  const supabase = await createAdminClient()
  try {
    const { error } = await supabase
      .from('eventos')
      .update({
        simple,
        doble,
        puerta,
        promo_puerta,
        ocultar_promo_puerta
      })
      .eq('id', eventoId)

    if (error) throw error
    return { success: true }
  } catch (e: any) {
    return { success: false, error: e.message || 'Error al actualizar precios' }
  }
}

export async function actualizarFechaEvento(eventoId: string, fecha: string | null) {
  const supabase = await createAdminClient()
  try {
    const { error } = await supabase
      .from('eventos')
      .update({
        fecha_evento: fecha
      })
      .eq('id', eventoId)

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
      .select('id, nombre, apellido, email, evento_id')
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

    // 3. Obtener los precios del evento de esta orden
    const evento = await obtenerEventoPorId(titular.evento_id)

    // 4. Calcular el total real basado en la base de datos
    const total = hasCompanion ? evento.doble : evento.simple

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
