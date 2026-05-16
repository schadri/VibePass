'use server'

import { createAdminClient } from '@/lib/supabase/server'
import QRCode from 'qrcode'
import nodemailer from 'nodemailer'

export async function aprobarPago(asistenteId: string) {
  const supabase = await createAdminClient()

  // 1. Marcar como aprobado y obtener el qr_token
  const { data: asistente, error: updateError } = await supabase
    .from('asistentes')
    .update({ estado_pago: 'aprobado' })
    .eq('id', asistenteId)
    .select()
    .single()

  if (updateError) return { success: false, error: updateError.message }

  // 2. Generar QR en base64.
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
  const validacionUrl = `${baseUrl}/admin/scanner?token=${asistente.qr_token}`

  // Generamos la imagen
  const qrBase64 = await QRCode.toDataURL(validacionUrl, {
    width: 400,
    margin: 2,
    color: {
      dark: '#000000',
      light: '#ffffff'
    }
  })

  // 3. Enviar el Email vía Gmail (Nodemailer)
  try {
    const userEmail = process.env.GMAIL_USER
    const passEmail = process.env.GMAIL_APP_PASSWORD

    if (!userEmail || !passEmail) {
      console.log("No Gmail credentials found. Skipping email sending.")
      return { success: true, warning: 'Aprobado, pero no se envió email porque faltan las credenciales de Gmail en .env.local' }
    }

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: userEmail,
        pass: passEmail
      }
    })

    await transporter.sendMail({
      from: `"Entrada | Pecado & Perreo" <${userEmail}>`,
      to: asistente.email,
      subject: `¡Tu entrada confirmada! - Orden #${asistente.orden_id}`,
      html: `
        <table width="100%" bgcolor="#0d0e12" cellpadding="0" cellspacing="0" style="font-family: 'Google Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; text-align: center; margin: 0; padding: 40px 10px;">
          <tr>
            <td align="center">
              
              <!-- Contenedor Principal Card -->
              <table width="100%" align="center" cellpadding="0" cellspacing="0" style="max-width: 480px; background-color: #000000; border: 1px solid #6b21a8; border-radius: 24px; box-shadow: 0 0 30px rgba(168,85,247,0.3); margin: 0 auto; text-align: center;">
                <tr>
                  <td align="center" style="padding: 32px 20px;">
                    
                    <!-- Header / Logo -->
                    <div style="margin-bottom: 24px;">
                      <img src="cid:logo" alt="Pecado y Perreo Logo" style="height: 100px; width: auto; object-fit: contain; display: inline-block;" />
                    </div>

                    <!-- Título Principal -->
                    <h1 style="color: #ffffff; font-size: 24px; font-weight: 700; margin: 0 0 8px 0; letter-spacing: -0.5px;">
                      ¡Tu entrada está lista, ${asistente.nombre}!
                    </h1>
                    <p style="color: #9ca3af; font-size: 15px; margin: 0 0 32px 0; line-height: 1.5;">
                      Confirmamos tu pago con éxito. Ya formás parte de la experiencia.
                    </p>

                    <!-- ticket / Contenedor del QR -->
                    <div style="background: linear-gradient(135deg, #18052b 0%, #000000 100%); border: 1px dashed #a855f7; border-radius: 16px; padding: 24px 16px; margin-bottom: 24px;">
                      
                      <!-- Número de Orden Badge -->
                      <div style="margin-bottom: 20px;">
                        <span style="background: linear-gradient(90deg, #9333ea 0%, #db2777 100%); color: #ffffff; padding: 6px 14px; border-radius: 20px; font-size: 13px; font-weight: 600; letter-spacing: 0.5px; display: inline-block;">
                          ORDEN #${asistente.orden_id}
                        </span>
                      </div>

                      <!-- Imagen del QR -->
                      <div style="background-color: #ffffff; padding: 16px; border-radius: 16px; display: inline-block; margin: 16px 0;">
                        <img src="cid:qrcode" alt="Código QR de Acceso" style="width: 200px; height: 200px; display: block; border-radius: 8px;" />
                      </div>

                      <!-- Datos del Asistente del ticket -->
                      <div style="border-top: 1px solid rgba(168,85,247,0.3); margin-top: 16px; padding-top: 16px;">
                        <table width="100%" cellpadding="0" cellspacing="0" style="text-align: center;">
                          <tr>
                            <td align="center" style="color: #c084fc; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; padding-bottom: 4px; width: 50%;">Nombre</td>
                            <td align="center" style="color: #c084fc; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; padding-bottom: 4px; width: 50%;">Documento</td>
                          </tr>
                          <tr>
                            <td align="center" style="color: #ffffff; font-size: 15px; font-weight: 600;">${asistente.nombre} <br/> ${asistente.apellido}</td>
                            <td align="center" style="color: #ffffff; font-size: 15px; font-weight: 600;">${asistente.dni}</td>
                          </tr>
                        </table>
                      </div>

                    </div>

                    <!-- Instrucciones de Ingreso -->
                    <div style="background-color: rgba(168, 85, 247, 0.05); border: 1px solid rgba(168, 85, 247, 0.2); border-radius: 12px; padding: 16px;">
                      <p style="color: #e9d5ff; font-size: 13px; margin: 0; font-weight: 500; line-height: 1.5;">
                        💡 <strong>Información importante:</strong> Presentá este código QR directamente desde tu celular en la puerta. No compartas esta imagen.
                      </p>
                    </div>

                    <!-- Footer opcional -->
                    <p style="color: #4b5563; font-size: 12px; margin-top: 24px;">
                      Este es un correo automático, por favor no lo respondas.
                    </p>

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
        {
          filename: 'qrcode.png',
          content: qrBase64.split("base64,")[1],
          encoding: 'base64',
          cid: 'qrcode'
        }
      ]
    })

    return { success: true }
  } catch (emailError) {
    console.error('Error enviando email:', emailError)
    return { success: false, error: 'Aprobado en base de datos, pero falló el envío del correo.' }
  }
}

export async function borrarAsistente(asistenteId: string) {
  const supabase = await createAdminClient()

  const { error } = await supabase
    .from('asistentes')
    .delete()
    .eq('id', asistenteId)

  if (error) return { success: false, error: error.message }
  
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
