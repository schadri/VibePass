import { NextResponse } from 'next/server'
import { Client } from 'pg'

export async function GET() {
  const sourceDbUri = 'postgresql://postgres:BgtRct5A3lV2XnTV@db.hegyqzhzrwavwlnfcehb.supabase.co:5432/postgres'
  
  const targetHost = process.env.SUPABASE_DB_HOST || 'pc8sscs04kscc4scg88ck0g8'
  const targetPassword = process.env.SUPABASE_DB_PASSWORD || 'cuKbJefMPpl9e0rW2i8ruRk4ek3RwXgx'
  const targetPort = parseInt(process.env.SUPABASE_DB_PORT || '5432', 10)
  
  console.log(`Target database connection details: Host=${targetHost}, Port=${targetPort}`)

  const sourceClient = new Client({
    connectionString: sourceDbUri,
    connectionTimeoutMillis: 5000,
    ssl: { rejectUnauthorized: false }
  })

  const targetClient = new Client({
    host: targetHost,
    port: targetPort,
    user: 'postgres',
    password: targetPassword,
    database: 'postgres',
    connectionTimeoutMillis: 5000,
    ssl: false
  })

  try {
    console.log('Connecting to source database...')
    try {
      await sourceClient.connect()
      console.log('Connected to source database successfully.')
    } catch (sourceErr: any) {
      console.error('Failed to connect to source database:', sourceErr.message)
      throw new Error(`Source connection failed: ${sourceErr.message}`)
    }

    console.log('Connecting to target database...')
    try {
      await targetClient.connect()
      console.log('Connected to target database successfully.')
    } catch (targetErr: any) {
      console.error('Failed to connect to target database:', targetErr.message)
      throw new Error(`Target connection failed: ${targetErr.message}`)
    }

    // 1. Enable uuid-ossp extension
    await targetClient.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp";')

    // 2. Create custom enum type if not exists
    const enumCheck = await targetClient.query(`
      SELECT 1 FROM pg_type WHERE typname = 'estado_pago_enum'
    `)
    if (enumCheck.rowCount === 0) {
      await targetClient.query(`
        CREATE TYPE estado_pago_enum AS ENUM ('pendiente', 'aprobado');
      `)
    }

    // 3. Create sequence
    await targetClient.query('CREATE SEQUENCE IF NOT EXISTS asistentes_orden_id_seq;')

    // 4. Create Tables
    await targetClient.query(`
      CREATE TABLE IF NOT EXISTS eventos (
        id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        nombre text NOT NULL,
        fecha_evento text,
        simple integer NOT NULL DEFAULT 5000,
        doble integer NOT NULL DEFAULT 8500,
        puerta integer NOT NULL DEFAULT 10000,
        promo_puerta integer NOT NULL DEFAULT 9000,
        ocultar_promo_puerta boolean NOT NULL DEFAULT false,
        activo boolean NOT NULL DEFAULT false,
        created_at timestamp with time zone DEFAULT now()
      );
    `)

    await targetClient.query(`
      CREATE TABLE IF NOT EXISTS precios (
        id text PRIMARY KEY DEFAULT 'default'::text,
        simple integer DEFAULT 5000,
        doble integer DEFAULT 8500,
        puerta integer DEFAULT 10000,
        fecha_evento text,
        promo_puerta integer DEFAULT 9000,
        ocultar_promo_puerta boolean DEFAULT false
      );
    `)

    await targetClient.query(`
      CREATE TABLE IF NOT EXISTS asistentes (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        orden_id integer NOT NULL DEFAULT nextval('asistentes_orden_id_seq'::regclass),
        nombre text NOT NULL,
        apellido text NOT NULL,
        dni text NOT NULL UNIQUE,
        email text NOT NULL,
        numero_referencia text,
        estado_pago estado_pago_enum DEFAULT 'pendiente'::estado_pago_enum,
        qr_token uuid UNIQUE DEFAULT gen_random_uuid(),
        ingresado boolean DEFAULT false,
        hora_ingreso timestamp with time zone,
        created_at timestamp with time zone DEFAULT now(),
        titular_id uuid REFERENCES asistentes(id),
        enviado boolean DEFAULT false,
        evento_id uuid REFERENCES eventos(id)
      );
    `)

    // Disable triggers/foreign key checks temporarily for bulk load
    await targetClient.query('ALTER TABLE asistentes DISABLE TRIGGER ALL;')
    await targetClient.query('ALTER TABLE eventos DISABLE TRIGGER ALL;')
    await targetClient.query('ALTER TABLE precios DISABLE TRIGGER ALL;')

    // Clear target tables to prevent duplicates if run multiple times
    await targetClient.query('TRUNCATE TABLE asistentes CASCADE;')
    await targetClient.query('TRUNCATE TABLE eventos CASCADE;')
    await targetClient.query('TRUNCATE TABLE precios CASCADE;')

    // 5. Migrate Eventos
    const eventosSource = await sourceClient.query('SELECT * FROM eventos')
    for (const r of eventosSource.rows) {
      await targetClient.query(`
        INSERT INTO eventos (id, nombre, fecha_evento, simple, doble, puerta, promo_puerta, ocultar_promo_puerta, activo, created_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      `, [r.id, r.nombre, r.fecha_evento, r.simple, r.doble, r.puerta, r.promo_puerta, r.ocultar_promo_puerta, r.activo, r.created_at])
    }

    // 6. Migrate Precios
    const preciosSource = await sourceClient.query('SELECT * FROM precios')
    for (const r of preciosSource.rows) {
      await targetClient.query(`
        INSERT INTO precios (id, simple, doble, puerta, fecha_evento, promo_puerta, ocultar_promo_puerta)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
      `, [r.id, r.simple, r.doble, r.puerta, r.fecha_evento, r.promo_puerta, r.ocultar_promo_puerta])
    }

    // 7. Migrate Asistentes
    const asistentesSource = await sourceClient.query('SELECT * FROM asistentes')
    for (const r of asistentesSource.rows) {
      await targetClient.query(`
        INSERT INTO asistentes (id, orden_id, nombre, apellido, dni, email, numero_referencia, estado_pago, qr_token, ingresado, hora_ingreso, created_at, titular_id, enviado, evento_id)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
      `, [r.id, r.orden_id, r.nombre, r.apellido, r.dni, r.email, r.numero_referencia, r.estado_pago, r.qr_token, r.ingresado, r.hora_ingreso, r.created_at, r.titular_id, r.enviado, r.evento_id])
    }

    // Re-enable triggers
    await targetClient.query('ALTER TABLE asistentes ENABLE TRIGGER ALL;')
    await targetClient.query('ALTER TABLE eventos ENABLE TRIGGER ALL;')
    await targetClient.query('ALTER TABLE precios ENABLE TRIGGER ALL;')

    // 8. Sync Sequence values
    const seqValRes = await sourceClient.query("SELECT last_value, is_called FROM asistentes_orden_id_seq")
    if (seqValRes.rows.length > 0) {
      const { last_value, is_called } = seqValRes.rows[0]
      await targetClient.query(`SELECT setval('asistentes_orden_id_seq', $1, $2)`, [last_value, is_called])
    }

    await sourceClient.end()
    await targetClient.end()

    return NextResponse.json({
      success: true,
      message: 'Database tables and data successfully migrated',
      migrated: {
        eventos: eventosSource.rowCount,
        precios: preciosSource.rowCount,
        asistentes: asistentesSource.rowCount
      }
    })

  } catch (err: any) {
    try { sourceClient.end() } catch(_) {}
    try { targetClient.end() } catch(_) {}
    return NextResponse.json({
      success: false,
      error: err.message || 'Migration failed'
    }, { status: 500 })
  }
}
