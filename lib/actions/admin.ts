'use server'

import { createAdminClient } from '@/lib/supabase/server'
import QRCode from 'qrcode'
import nodemailer from 'nodemailer'

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

    // Construir HTML de los tickets
    const ticketsHtml = ticketsData.map(ticket => `
      <div style="background: linear-gradient(135deg, #18052b 0%, #000000 100%); border: 1px dashed #a855f7; border-radius: 16px; padding: 24px 16px; margin-bottom: 24px;">
        <div style="margin-bottom: 20px;">
          <span style="background: linear-gradient(90deg, #9333ea 0%, #db2777 100%); color: #ffffff; padding: 6px 14px; border-radius: 20px; font-size: 13px; font-weight: 600; letter-spacing: 0.5px; display: inline-block;">
            ENTRADA #${ticket.orden_id} ${ticket.titular_id ? '(ACOMPAÑANTE)' : '(TITULAR)'}
          </span>
        </div>
        <div style="background-color: #ffffff; padding: 16px; border-radius: 16px; display: inline-block; margin: 16px 0;">
          <img src="cid:${ticket.cid}" alt="Código QR" style="width: 200px; height: 200px; display: block; border-radius: 8px;" />
        </div>
        <div style="border-top: 1px solid rgba(168,85,247,0.3); margin-top: 16px; padding-top: 16px;">
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
                    <img src="cid:logo" alt="Logo" style="height: 80px; margin-bottom: 24px;" />
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
          filename: 'PYP.png',
          path: process.cwd() + '/lib/actions/PYP.png',
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
  } catch (emailError) {
    console.error('Error enviando email:', emailError)
    return { success: false, error: 'Aprobado, pero falló el envío del correo.' }
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

export async function obtenerTodosLosAsistentes() {
  const supabase = await createAdminClient()
  const { data, error } = await supabase
    .from('asistentes')
    .select('*')
    .order('hora_ingreso', { ascending: false, nullsFirst: false }) // Priorizar a los que entraron recientemente

  if (error) return { success: false, error: error.message }
  return { success: true, data }
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
