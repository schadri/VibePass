import { NextResponse } from 'next/server'

export async function GET() {
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''
  const dbHost = process.env.SUPABASE_DB_HOST || ''
  const dbPass = process.env.SUPABASE_DB_PASSWORD || ''

  return NextResponse.json({
    dbHost: {
      value: dbHost,
      length: dbHost.length
    },
    dbPass: {
      length: dbPass.length,
      prefix: dbPass.substring(0, 4) + '...'
    },
    anonKey: {
      length: anonKey.length,
      prefix: anonKey.substring(0, 20) + '...',
      suffix: '...' + anonKey.substring(anonKey.length - 20),
      isPlaceholder: anonKey.includes('COPIAR'),
      isOldKey: anonKey.includes('hegyqzhzrwavwlnfcehb')
    },
    serviceKey: {
      length: serviceKey.length,
      prefix: serviceKey.substring(0, 20) + '...',
      suffix: '...' + serviceKey.substring(serviceKey.length - 20),
      isPlaceholder: serviceKey.includes('COPIAR'),
      isOldKey: serviceKey.includes('hegyqzhzrwavwlnfcehb')
    }
  })
}
