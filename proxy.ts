import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function proxy(request: NextRequest) {
  // Solo interceptar rutas bajo /admin
  if (request.nextUrl.pathname.startsWith('/admin')) {
    // Si la ruta es exactamente /admin/login, dejar pasar para no crear un bucle infinito
    if (request.nextUrl.pathname === '/admin/login') {
      return NextResponse.next()
    }

    // Verificar si existe la cookie de sesión del administrador
    const adminSession = request.cookies.get('admin_session')

    // Si no existe la cookie o no tiene el valor correcto, redirigir al login
    if (!adminSession || adminSession.value !== 'authenticated') {
      const url = new URL('/admin/login', request.url)
      return NextResponse.redirect(url)
    }
  }

  return NextResponse.next()
}

// Configurar el matcher para que solo se ejecute en rutas /admin
export const config = {
  matcher: '/admin/:path*',
}
