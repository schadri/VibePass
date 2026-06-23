import { NextResponse } from 'next/server'
import { Client } from 'pg'
import dns from 'dns'
import net from 'net'

function resolveDns(host: string): Promise<string[]> {
  return new Promise((resolve) => {
    dns.resolve(host, (err, addresses) => {
      if (err) {
        resolve([])
      } else {
        resolve(addresses)
      }
    })
  })
}

function testTcp(host: string, port: number): Promise<boolean> {
  return new Promise((resolve) => {
    const socket = new net.Socket()
    socket.setTimeout(2000)
    socket.on('connect', () => {
      socket.destroy()
      resolve(true)
    })
    socket.on('timeout', () => {
      socket.destroy()
      resolve(false)
    })
    socket.on('error', () => {
      socket.destroy()
      resolve(false)
    })
    socket.connect(port, host)
  })
}

export async function GET() {
  const candidates = [
    'pc8sscs04kscc4scg88ck0g8',
    'xo4g0gsooook08k4cgccsksk',
    'supabase-db',
    'supabase-db-pc8sscs04kscc4scg88ck0g8',
    'pc8sscs04kscc4scg88ck0g8-supabase-db',
    'pc8sscs04kscc4scg88ck0g8_supabase-db',
    'localhost',
    '127.0.0.1',
    'host.docker.internal'
  ]

  const results: any[] = []

  for (const host of candidates) {
    const ips = await resolveDns(host)
    const portOpen = await testTcp(host, 5432)
    results.push({
      host,
      ips,
      portOpen
    })
  }

  return NextResponse.json({
    success: true,
    results
  })
}

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get('Authorization')
    const correctPassword = process.env.ADMIN_PASSWORD || 'P&P2026'

    if (authHeader !== correctPassword) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const { queries, host, port } = await req.json()
    if (!Array.isArray(queries)) {
      return NextResponse.json({ success: false, error: 'Invalid payload: queries must be an array' }, { status: 400 })
    }

    const targetHost = host || process.env.SUPABASE_DB_HOST || 'pc8sscs04kscc4scg88ck0g8'
    const targetPassword = process.env.SUPABASE_DB_PASSWORD || 'cuKbJefMPpl9e0rW2i8ruRk4ek3RwXgx'
    const targetPort = parseInt(port || process.env.SUPABASE_DB_PORT || '5432', 10)

    const client = new Client({
      host: targetHost,
      port: targetPort,
      user: 'postgres',
      password: targetPassword,
      database: 'postgres',
      connectionTimeoutMillis: 5000,
      ssl: { rejectUnauthorized: false }
    })

    await client.connect()

    const results = []
    
    await client.query('BEGIN')
    try {
      for (const q of queries) {
        const res = await client.query(q.sql, q.params || [])
        results.push({
          rowCount: res.rowCount,
          rows: res.rows
        })
      }
      await client.query('COMMIT')
    } catch (txErr: any) {
      await client.query('ROLLBACK')
      throw txErr
    } finally {
      await client.end()
    }

    return NextResponse.json({
      success: true,
      results
    })

  } catch (err: any) {
    return NextResponse.json({
      success: false,
      error: err.message || 'Query execution failed'
    }, { status: 500 })
  }
}
