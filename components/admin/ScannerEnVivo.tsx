'use client'

import { useEffect, useRef, useState } from 'react'
import { Html5QrcodeScanner } from 'html5-qrcode'
import { createClient } from '@/lib/supabase/client'

export function ScannerEnVivo() {
  const [scanResult, setScanResult] = useState<{ type: 'success' | 'error', msg: string } | null>(null)
  const [ingresosRecientes, setIngresosRecientes] = useState<any[]>([])
  const isProcessing = useRef(false)
  const supabase = createClient()

  useEffect(() => {
    const scanner = new Html5QrcodeScanner(
      'reader',
      { fps: 10, qrbox: { width: 250, height: 250 }, aspectRatio: 1.0 },
      false
    )

    scanner.render(
      async (decodedText) => {
        if (isProcessing.current) return
        isProcessing.current = true

        try {
          let token = decodedText
          try {
            const url = new URL(decodedText)
            token = url.searchParams.get('token') || decodedText
          } catch (e) {
            // Not a URL, use raw text
          }

          if (!token) throw new Error("Formato de QR irreconocible")

          const res = await fetch('/api/admin/validar', {
            method: 'POST',
            body: JSON.stringify({ token }),
            headers: { 'Content-Type': 'application/json' }
          })
          const data = await res.json()

          if (!res.ok) throw new Error(data.error)

          setScanResult({ type: 'success', msg: `¡Adelante ${data.nombre}!` })
        } catch (error: any) {
          setScanResult({ type: 'error', msg: error.message || 'Error de lectura' })
        } finally {
          setTimeout(() => {
            setScanResult(null)
            isProcessing.current = false
          }, 2000)
        }
      },
      (error) => { /* Ignorar errores continuos cuando no hay QR */ }
    )

    const channel = supabase.channel('realtime_ingresos')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'asistentes', filter: 'ingresado=eq.true' },
        (payload) => {
          setIngresosRecientes(prev => [payload.new, ...prev].slice(0, 15))
        }
      )
      .subscribe()

    return () => {
      scanner.clear()
      supabase.removeChannel(channel)
    }
  }, [])

  return (
    <div className="flex flex-col h-screen bg-black text-white font-sans overflow-hidden relative">
      <div className="flex-1 relative flex items-center justify-center p-4">
        <div id="reader" className="w-full max-w-md mx-auto rounded-xl overflow-hidden border-2 border-gray-800 bg-white"></div>
        
        {scanResult && (
          <div className={`absolute inset-0 z-50 flex items-center justify-center p-6 bg-black bg-opacity-80 backdrop-blur-sm transition-all duration-200`}>
             <div className={`w-full max-w-sm p-8 rounded-3xl shadow-2xl text-center transform scale-110 ${
                scanResult.type === 'success' ? 'bg-green-500' : 'bg-red-600'
             }`}>
                <h2 className="text-4xl font-black uppercase tracking-wider mb-2">
                  {scanResult.type === 'success' ? 'ÉXITO' : 'DENEGADO'}
                </h2>
                <p className="text-2xl font-bold">{scanResult.msg}</p>
             </div>
          </div>
        )}
      </div>

      <div className="h-64 bg-gray-900 border-t border-gray-800 p-4 overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest">Últimos Ingresos</h3>
          <span className="flex items-center gap-2 text-xs text-green-400">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span> En vivo
          </span>
        </div>
        
        <ul className="space-y-3">
          {ingresosRecientes.length === 0 ? (
            <p className="text-gray-600 text-center text-sm">Esperando ingresos...</p>
          ) : (
            ingresosRecientes.map((asistente, i) => (
              <li key={asistente.id} className="flex justify-between items-center bg-gray-800 p-3 rounded-lg">
                <div className="flex flex-col">
                  <span className="font-bold">{asistente.nombre} {asistente.apellido}</span>
                  <span className="text-xs text-gray-400">Orden #{asistente.orden_id}</span>
                </div>
                <span className="text-sm font-mono text-gray-300">
                  {new Date(asistente.hora_ingreso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </span>
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  )
}
