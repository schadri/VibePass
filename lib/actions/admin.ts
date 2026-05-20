'use server'

import { createAdminClient } from '@/lib/supabase/server'
import QRCode from 'qrcode'
import nodemailer from 'nodemailer'
import path from 'path'

export async function aprobarPago(asistenteId: string) {
  const supabase = await createAdminClient()

  // 1. Obtener datos del asistente para saber si es titular o acompañante
  const { data: asistente } = await supabase
    .from('asistentes')
    .select('id, titular_id')
    .eq('id', asistenteId)
    .single()

  if (!asistente) return { success: false, error: 'Asistente no encontrado' }

  // El ID que usaremos para buscar a todo el grupo es el del titular
  const mainId = asistente.titular_id || asistente.id

  // 2. Marcar como aprobado al titular y a todos sus acompañantes vinculados
  const { error: updateError } = await supabase
    .from('asistentes')
    .update({ estado_pago: 'aprobado' })
    .or(`id.eq.${mainId},titular_id.eq.${mainId}`)

  if (updateError) return { success: false, error: updateError.message }

  // 3. Obtener a todos los asistentes vinculados a esta orden (titular + acompañantes)
  const { data: asistentes, error: fetchError } = await supabase
    .from('asistentes')
    .select('*')
    .or(`id.eq.${mainId},titular_id.eq.${mainId}`)
    .order('titular_id', { ascending: true, nullsFirst: true }) // Titular primero

  if (fetchError || !asistentes || asistentes.length === 0) {
    return { success: false, error: 'No se encontraron los asistentes para enviar el email.' }
  }

  const titular = asistentes.find(a => !a.titular_id) || asistentes[0]
  // Detectar automáticamente la URL del sitio (Vercel lo provee en VERCEL_URL)
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL 
    ? (process.env.NEXT_PUBLIC_SITE_URL.startsWith('http') ? process.env.NEXT_PUBLIC_SITE_URL : `https://${process.env.NEXT_PUBLIC_SITE_URL}`)
    : (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000')

  // 3. Generar QRs para cada asistente
  const ticketsData = await Promise.all(asistentes.map(async (asistente, index) => {
    const validacionUrl = `${baseUrl}/admin/scanner?token=${asistente.qr_token}`
    const qrBase64 = await QRCode.toDataURL(validacionUrl, {
      width: 400,
      margin: 2,
      color: { dark: '#000000', light: '#ffffff' }
    })
    return {
      ...asistente,
      qrBase64,
      cid: `qrcode_${index}`
    }
  }))

  // 4. Enviar el Email vía Gmail (Nodemailer)
  try {
    const userEmail = process.env.GMAIL_USER
    const passEmail = process.env.GMAIL_APP_PASSWORD

    if (!userEmail || !passEmail) {
      return { success: true, warning: 'Aprobado, pero no se envió email porque faltan las credenciales.' }
    }

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user: userEmail, pass: passEmail }
    })

    // Construir HTML de los tickets con botones individuales de descarga y whatsapp
    const ticketsHtml = ticketsData.map(ticket => `
      <div style="background: linear-gradient(135deg, #18052b 0%, #000000 100%); border: 1px dashed #e22a8e; border-radius: 16px; padding: 24px 16px; margin-bottom: 24px; max-width: 380px; margin-left: auto; margin-right: auto; text-align: center;">
        <div style="margin-bottom: 20px;">
          <span style="background: linear-gradient(90deg, #9333ea 0%, #db2777 100%); color: #ffffff; padding: 6px 14px; border-radius: 20px; font-size: 13px; font-weight: 600; letter-spacing: 0.5px; display: inline-block;">
            ENTRADA #${ticket.orden_id} ${ticket.titular_id ? '(ACOMPAÑANTE)' : '(TITULAR)'}
          </span>
        </div>
        <div style="background-color: #ffffff; padding: 16px; border-radius: 16px; display: inline-block; margin: 16px 0;">
          <img src="cid:${ticket.cid}" alt="Código QR" style="width: 200px; height: 200px; display: block; border-radius: 8px;" />
        </div>
        <div style="border-top: 1px solid rgba(168,85,247,0.3); margin-top: 16px; padding-top: 16px; margin-bottom: 16px;">
          <table width="100%" cellpadding="0" cellspacing="0" style="text-align: center;">
            <tr>
              <td align="center" style="color: #c084fc; font-size: 11px; text-transform: uppercase; padding-bottom: 4px; width: 50%;">Nombre</td>
              <td align="center" style="color: #c084fc; font-size: 11px; text-transform: uppercase; padding-bottom: 4px; width: 50%;">DNI</td>
            </tr>
            <tr>
              <td align="center" style="color: #ffffff; font-size: 15px; font-weight: 600;">${ticket.nombre} ${ticket.apellido}</td>
              <td align="center" style="color: #ffffff; font-size: 15px; font-weight: 600;">${ticket.dni}</td>
            </tr>
          </table>
        </div>
        <!-- BOTONES DE CONTROL DENTRO DEL CORREO -->
        <div style="margin-top: 18px; padding-top: 12px; border-top: 1px solid rgba(226, 42, 142, 0.15);">
          <a href="${baseUrl}/ticket/${ticket.qr_token}" target="_blank" style="display: block; background: linear-gradient(90deg, #9333ea 0%, #db2777 100%); color: #ffffff; text-decoration: none; font-size: 12px; font-weight: 700; text-transform: uppercase; padding: 12px 16px; border-radius: 12px; text-align: center; margin-bottom: 8px; font-family: sans-serif; letter-spacing: 0.5px;">
            Descargar Entrada
          </a>
          <a href="https://api.whatsapp.com/send?text=${encodeURIComponent(`¡Hola! Acá te comparto tu entrada para Pecado & Perreo: ${baseUrl}/ticket/${ticket.qr_token} 🎫🔥`)}" target="_blank" style="display: block; background-color: #10b981; color: #ffffff; text-decoration: none; font-size: 12px; font-weight: 700; text-transform: uppercase; padding: 12px 16px; border-radius: 12px; text-align: center; font-family: sans-serif; letter-spacing: 0.5px;">
            Compartir WhatsApp
          </a>
        </div>
      </div>
    `).join('')

    await transporter.sendMail({
      from: `"Entrada | Pecado & Perreo" <${userEmail}>`,
      to: titular.email,
      subject: `¡Tus entradas confirmadas! - Orden #${titular.orden_id}`,
      html: `
        <table width="100%" bgcolor="#0d0e12" cellpadding="0" cellspacing="0" style="font-family: sans-serif; text-align: center; padding: 40px 10px;">
          <tr>
            <td align="center">
              <table width="100%" style="max-width: 480px; background-color: #000000; border: 1px solid #6b21a8; border-radius: 24px; padding: 32px 20px;">
                <tr>
                  <td align="center">
                    <img src="cid:logo" alt="Pecado & Perreo" style="height: 75px; display: block; margin: 0 auto 24px auto;" />
                    <h1 style="color: #ffffff; font-size: 22px; font-weight: 700; margin-bottom: 8px;">¡Tus entradas están listas!</h1>
                    <p style="color: #9ca3af; font-size: 14px; margin-bottom: 32px;">Confirmamos tu pago con éxito. Aquí tenés los accesos para la experiencia.</p>
                    
                    ${ticketsHtml}

                    <div style="background-color: rgba(168, 85, 247, 0.05); border: 1px solid rgba(168, 85, 247, 0.2); border-radius: 12px; padding: 16px; margin-top: 20px;">
                      <p style="color: #e9d5ff; font-size: 12px; line-height: 1.5;">
                        💡 <strong>Info:</strong> Presentá estos QR desde tu celular en puerta. Cada persona debe tener su QR.
                      </p>
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      `,
      attachments: [
        {
          filename: 'logo_mail.png',
          path: path.join(process.cwd(), 'public', 'logo_mail.png'),
          cid: 'logo'
        },
        ...ticketsData.map(ticket => ({
          filename: `qrcode_${ticket.id}.png`,
          content: ticket.qrBase64.split("base64,")[1],
          encoding: 'base64',
          cid: ticket.cid
        }))
      ]
    })

    return { success: true }
  } catch (emailError: any) {
    console.error('Error enviando email:', emailError)
    return { success: false, error: `Aprobado, pero falló el correo: ${emailError.message || 'Error desconocido'}` }
  }
}

export async function borrarAsistente(asistenteId: string, borrarAcompanantes: boolean = false) {
  const supabase = await createAdminClient()

  if (borrarAcompanantes) {
    // Borrar al titular y por CASCADE se borrarían los acompañantes si la DB está configurada así.
    // Para estar seguros de la lógica pedida, borramos explícitamente ambos casos.
    const { error } = await supabase
      .from('asistentes')
      .delete()
      .or(`id.eq.${asistenteId},titular_id.eq.${asistenteId}`)
    
    if (error) return { success: false, error: error.message }
  } else {
    // Solo borrar al anfitrión. Pero antes, desvincular a los acompañantes 
    // para que no se borren en cascada y queden como independientes.
    await supabase
      .from('asistentes')
      .update({ titular_id: null })
      .eq('titular_id', asistenteId)

    const { error } = await supabase
      .from('asistentes')
      .delete()
      .eq('id', asistenteId)

    if (error) return { success: false, error: error.message }
  }

  return { success: true }
}

export async function obtenerUltimosIngresos() {
  const supabase = await createAdminClient()
  const { data, error } = await supabase
    .from('asistentes')
    .select('*')
    .eq('ingresado', true)
    .order('hora_ingreso', { ascending: false })
    .limit(15)

  if (error) return { success: false, error: error.message }
  return { success: true, data }
}

export async function obtenerTodosLosAsistentes(eventoId?: string) {
  const supabase = await createAdminClient()
  let query = supabase.from('asistentes').select('*')
  
  if (eventoId) {
    query = query.eq('evento_id', eventoId)
  }
  
  const { data, error } = await query.order('hora_ingreso', { ascending: false, nullsFirst: false })

  if (error) return { success: false, error: error.message }
  return { success: true, data }
}

export async function obtenerTodosLosEventos() {
  const supabase = await createAdminClient()
  const { data, error } = await supabase
    .from('eventos')
    .select('id, nombre, fecha_evento, activo, created_at')
    .order('created_at', { ascending: false })

  if (error) return { success: false, error: error.message }
  return { success: true, data }
}

export async function crearEvento(nombre: string, fecha_evento: string, simple: number, doble: number, puerta: number, promo_puerta: number) {
  const supabase = await createAdminClient()
  
  // Desactivar todos primero
  await supabase.from('eventos').update({ activo: false }).neq('id', '00000000-0000-0000-0000-000000000000')
  
  // Insertar nuevo con activo = true
  const { data, error } = await supabase.from('eventos').insert({ 
    nombre, 
    fecha_evento, 
    simple, 
    doble, 
    puerta, 
    promo_puerta, 
    activo: true 
  }).select('id').single()
  
  if (error) return { success: false, error: error.message }
  return { success: true, id: data?.id }
}

export async function cambiarEventoActivo(eventoId: string) {
  const supabase = await createAdminClient()
  
  // Desactivar todos
  await supabase.from('eventos').update({ activo: false }).neq('id', '00000000-0000-0000-0000-000000000000')
  
  // Activar el seleccionado
  const { error } = await supabase.from('eventos').update({ activo: true }).eq('id', eventoId)
  
  if (error) return { success: false, error: error.message }
  return { success: true }
}

export async function limpiarEvento(eventoId: string) {
  const supabase = await createAdminClient()

  // Borrar todos los asistentes del evento (los acompañantes se borran por cascade o porque también tienen el evento_id)
  const { error } = await supabase
    .from('asistentes')
    .delete()
    .eq('evento_id', eventoId)

  if (error) return { success: false, error: error.message }
  return { success: true }
}

import { cookies } from 'next/headers'

export async function loginAdmin(password: string) {
  const correctPassword = process.env.ADMIN_PASSWORD
  
  if (!correctPassword) {
    return { success: false, error: 'La contraseña de administrador no está configurada en el servidor.' }
  }

  if (password === correctPassword) {
    // Crear una sesión simple con cookie válida por 12 horas
    const cookieStore = await cookies()
    cookieStore.set('admin_session', 'authenticated', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 12 // 12 horas
    })
    return { success: true }
  }

  return { success: false, error: 'Contraseña incorrecta' }
}

export async function cargarEventoMasivo({
  compradorExistenteId,
  buyerNombre,
  buyerApellido,
  buyerDni,
  buyerEmail,
  estadoPago = 'pendiente',
  invitadosText,
  eventoId
}: {
  compradorExistenteId?: string
  buyerNombre?: string
  buyerApellido?: string
  buyerDni?: string
  buyerEmail?: string
  estadoPago?: 'pendiente' | 'aprobado'
  invitadosText: string
  eventoId: string
}) {
  const supabase = await createAdminClient()

  let titularId = compradorExistenteId
  let email = buyerEmail || ''
  let estado = estadoPago

  // 1. Obtener/Crear al Titular
  if (compradorExistenteId) {
    // Si se asocia a un comprador existente, buscar su email y estado de pago
    const { data: existente, error: fetchError } = await supabase
      .from('asistentes')
      .select('email, estado_pago')
      .eq('id', compradorExistenteId)
      .single()

    if (fetchError || !existente) {
      return { success: false, error: 'Comprador existente no encontrado.' }
    }
    email = existente.email
    estado = existente.estado_pago
  } else {
    // Crear nuevo comprador (Titular)
    if (!buyerNombre || !buyerApellido || !buyerDni || !buyerEmail) {
      return { success: false, error: 'Faltan campos obligatorios para el nuevo comprador.' }
    }

    const { data: nuevoTitular, error: insertError } = await supabase
      .from('asistentes')
      .insert({
        nombre: buyerNombre,
        apellido: buyerApellido,
        dni: buyerDni,
        email: buyerEmail,
        estado_pago: estadoPago,
        evento_id: eventoId
      })
      .select('id')
      .single()

    if (insertError) {
      if (insertError.code === '23505') {
        return { success: false, error: 'Ya existe un registro con ese DNI o Email para el comprador.' }
      }
      return { success: false, error: insertError.message }
    }
    titularId = nuevoTitular.id
    email = buyerEmail
  }

  // 2. Procesar la lista de invitados
  const lines = invitadosText.split('\n')
  const asistentesAInsertar = []

  for (let line of lines) {
    line = line.trim()
    if (!line) continue

    // Limpieza de introducciones comunes como "Lista Cumple - ", "Lista de invitados - ", etc.
    line = line.replace(/^(lista\s*(cumple|grupo|invitados)?\s*[\-\–\—]?\s*)+/i, '')

    let nombre = ''
    let apellido = ''
    let dni = ''

    // RegExp premium calibrada para WhatsApp que maneja:
    // - Numeración opcional al principio (ej: "1. ", "25) ", "2.	")
    // - Nombre completo (incluyendo espacios)
    // - Separadores opcionales (guiones normales -, em-dash –, en-dash —, etc.)
    // - Término de tipo de documento opcional (dni, pasaporte, documento, ci, pass, lc, le, etc.)
    // - Indicador de número opcional (N°, Nº, no., :, etc.)
    // - El número de DNI o Pasaporte propiamente dicho (que puede incluir puntos de formato, ej: 33.373.409)
    const match = line.match(/^\s*(?:\d+[\.\)\-]?\s*)?(.+?)\s*(?:[\-\–\—]?\s*)?(?:dni|pasaporte|documento|pass|lc|le|ci)?\s*(?:n[o°º]|\.|\:)?\s*([a-zA-Z0-9\.]+)\s*$/i)

    if (match) {
      const fullName = match[1].trim()
      dni = match[2].trim()

      const nameParts = fullName.split(/\s+/)
      nombre = (nameParts[0] || '').replace(/,+$/, '').trim()
      apellido = (nameParts.slice(1).join(' ') || '').replace(/,+$/, '').trim()
    } else {
      // Fallback seguro en caso de que no tenga DNI (ej: "Carlos Perez" solo)
      // Primero limpiamos numeración inicial si existe
      const cleanedFallbackLine = line.replace(/^\s*(?:\d+[\.\)\-]?\s*)/, '').trim()
      const nameParts = cleanedFallbackLine.split(/\s+/)
      nombre = (nameParts[0] || '').replace(/,+$/, '').trim()
      apellido = (nameParts.slice(1).join(' ') || '').replace(/,+$/, '').trim()
      dni = 'S/D'
    }

    asistentesAInsertar.push({
      nombre,
      apellido,
      dni,
      email,
      estado_pago: estado,
      titular_id: titularId,
      evento_id: eventoId
    })
  }

  if (asistentesAInsertar.length > 0) {
    const { error: insertAsistentesError } = await supabase
      .from('asistentes')
      .insert(asistentesAInsertar)

    if (insertAsistentesError) {
      return { success: false, error: 'Error cargando los invitados: ' + insertAsistentesError.message }
    }
  }

  return { success: true }
}

export async function marcarComoEnviado(id: string, enviado: boolean = true) {
  const supabase = await createAdminClient()

  // Intentar actualizar usando la columna 'enviado'
  const { error } = await supabase
    .from('asistentes')
    .update({ enviado })
    .eq('id', id)

  if (error) {
    // Si da error (probablemente porque no existe la columna 'enviado'), usar plan B 'numero_referencia'
    const { error: fallbackError } = await supabase
      .from('asistentes')
      .update({ numero_referencia: enviado ? 'enviado' : null })
      .eq('id', id)

    if (fallbackError) {
      return { success: false, error: fallbackError.message }
    }
  }

  return { success: true }
}
