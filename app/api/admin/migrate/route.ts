import { NextResponse } from 'next/server'
import { Client } from 'pg'

export async function GET() {
  const dbPassword = process.env.SUPABASE_DB_PASSWORD || 'BgtRct5A3lV2XnTV'
  const dbHost = process.env.SUPABASE_DB_HOST || 'db.hegyqzhzrwavwlnfcehb.supabase.co'
  const dbUser = 'postgres'
  const dbName = 'postgres'
  const dbPort = parseInt(process.env.SUPABASE_DB_PORT || '5432', 10)

  const client = new Client({
    host: dbHost,
    port: dbPort,
    user: dbUser,
    password: dbPassword,
    database: dbName,
    ssl: {
      rejectUnauthorized: false
    }
  })

  try {
    await client.connect()
    
    // Run migrations
    await client.query(`
      ALTER TABLE precios 
      ADD COLUMN IF NOT EXISTS promo_puerta INTEGER DEFAULT 9000;
    `)
    
    await client.query(`
      ALTER TABLE precios 
      ADD COLUMN IF NOT EXISTS ocultar_promo_puerta BOOLEAN DEFAULT false;
    `)

    // Update existing row
    await client.query(`
      UPDATE precios 
      SET promo_puerta = 9000 
      WHERE id = 'default' AND (promo_puerta IS NULL OR promo_puerta = 0);
    `)

    // Verify row
    const res = await client.query("SELECT * FROM precios WHERE id = 'default'")
    
    await client.end()

    return NextResponse.json({
      success: true,
      message: 'Migration ran successfully',
      data: res.rows[0]
    })
  } catch (err: any) {
    try {
      await client.end()
    } catch (_) {}
    return NextResponse.json({
      success: false,
      error: err.message || 'Migration failed'
    }, { status: 500 })
  }
}
