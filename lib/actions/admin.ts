'use server'

import { createAdminClient } from '@/lib/supabase/server'
import QRCode from 'qrcode'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

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

  // 3. Enviar el Email vía Resend
  try {
    if (!process.env.RESEND_API_KEY) {
       console.log("No Resend API Key found. Skipping email sending.")
       return { success: true, warning: 'Aprobado, pero no se envió email porque falta la API Key' }
    }
    
    await resend.emails.send({
      from: 'Entradas Fiesta <onboarding@resend.dev>', // Usar tu dominio si tienes uno verificado en Resend
      to: asistente.email,
      subject: `¡Tu entrada confirmada! - Orden #${asistente.orden_id}`,
      html: `
        <div style="font-family: sans-serif; text-align: center; color: #333;">
          <h1 style="color: #000;">¡Hola ${asistente.nombre}!</h1>
          <p>Tu pago ha sido validado con éxito.</p>
          <div style="background-color: #f3f4f6; padding: 20px; border-radius: 10px; display: inline-block; margin: 20px 0;">
            <p style="font-size: 1.2rem; margin: 0 0 10px 0;">Orden <strong>#${asistente.orden_id}</strong></p>
            <img src="${qrBase64}" alt="Código QR" style="width: 250px; border-radius: 10px;" />
            <p style="font-size: 0.9rem; color: #666; margin-top: 10px;">Presenta este QR desde tu celular en la puerta</p>
          </div>
        </div>
      `
    })
    
    return { success: true }
  } catch (emailError) {
    console.error('Error enviando email:', emailError)
    return { success: false, error: 'Aprobado en base de datos, pero falló el envío del correo.' }
  }
}
