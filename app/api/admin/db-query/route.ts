import { NextResponse } from 'next/server'
import { Client } from 'pg'

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get('Authorization')
    const correctPassword = process.env.ADMIN_PASSWORD || 'P&P2026'

    if (authHeader !== correctPassword) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const { queries } = await req.json()
    if (!Array.isArray(queries)) {
      return NextResponse.json({ success: false, error: 'Invalid payload: queries must be an array' }, { status: 400 })
    }

    const targetHost = process.env.SUPABASE_DB_HOST || 'xo4g0gsooook08k4cgccsksk'
    const targetPassword = process.env.SUPABASE_DB_PASSWORD || 'cuKbJefMPpl9e0rW2i8ruRk4ek3RwXgx'
    const targetPort = parseInt(process.env.SUPABASE_DB_PORT || '5432', 10)

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
    
    // Execute all queries in a single transaction
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
