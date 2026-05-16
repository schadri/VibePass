'use client'

import { useEffect, useRef, useState } from 'react'
import { Html5Qrcode } from 'html5-qrcode'
import { createClient } from '@/lib/supabase/client'

export function ScannerEnVivo() {
  const [scanResult, setScanResult] = useState<{ type: 'success' | 'error', msg: string } | null>(null)
  const [ingresosRecientes, setIngresosRecientes] = useState<any[]>([])
  const [cameraEnabled, setCameraEnabled] = useState(false)
  const [debugMsg, setDebugMsg] = useState('Esperando interacción...')
  
  const isProcessing = useRef(false)
  const supabase = createClient()
  const scannerRef = useRef<Html5Qrcode | null>(null)

  // Suscripción Realtime
  useEffect(() => {
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
      supabase.removeChannel(channel)
    }
  }, [supabase])

  const startScanner = async () => {
    try {
      setDebugMsg('1. Verificando compatibilidad del navegador...')
      
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Navegador incompatible o conexión no segura (Falta HTTPS).')
      }

      setDebugMsg('2. Pidiendo permisos de cámara...')
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
      
      // Detener el stream nativo para que html5-qrcode lo tome libremente
      stream.getTracks().forEach(track => track.stop())

      setDebugMsg('3. Permisos otorgados. Renderizando vista...')
      setCameraEnabled(true)

      // Pequeño delay para asegurar que React haya dibujado el <div id="reader">
      setTimeout(async () => {
        try {
          setDebugMsg('4. Inicializando lector QR...')
          const html5QrCode = new Html5Qrcode('reader')
          scannerRef.current = html5QrCode

          await html5QrCode.start(
            { facingMode: "environment" },
            { fps: 10, qrbox: { width: 250, height: 250 } },
            async (decodedText) => {
              if (isProcessing.current) return
              isProcessing.current = true

              try {
                let token = decodedText
                try {
                  const url = new URL(decodedText)
                  token = url.searchParams.get('token') || decodedText
                } catch (e) { /* no es URL */ }

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
            (errorMessage) => {
              // Ignore background scan errors (when it doesn't see a QR code)
            }
          )
          setDebugMsg('¡Cámara lista y escaneando!')
        } catch (qrError: any) {
          setDebugMsg(`Error al iniciar lector: ${qrError.message}`)
        }
      }, 300)

    } catch (error: any) {
      setDebugMsg(`ERROR CRÍTICO: ${error.name} - ${error.message}`)
    }
  }

  // Limpieza al desmontar
  useEffect(() => {
    return () => {
      if (scannerRef.current && scannerRef.current.isScanning) {
        scannerRef.current.stop().then(() => scannerRef.current?.clear()).catch(() => {})
      }
    }
  }, [])

  return (
    <div className="flex flex-col h-screen bg-black text-white font-sans overflow-hidden relative">
      <div className="flex-1 relative flex flex-col items-center justify-center p-4">
        
        {/* Panel de Debugging visible en pantalla */}
        <div className="absolute top-4 left-0 right-0 px-4 z-10 text-center">
          <span className="bg-gray-800 text-xs px-3 py-1 rounded-full border border-gray-700 font-mono text-gray-300">
            {debugMsg}
          </span>
        </div>
        
        {!cameraEnabled ? (
          <button 
            onClick={startScanner}
            className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-xl py-6 px-12 rounded-full shadow-[0_0_20px_rgba(37,99,235,0.5)] transition-all transform hover:scale-105 active:scale-95 z-20"
          >
            📸 Activar Cámara
          </button>
        ) : (
          <div id="reader" className="w-full max-w-md mx-auto rounded-xl overflow-hidden border-2 border-gray-800 bg-white text-black z-20"></div>
        )}
        
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
            ingresosRecientes.map((asistente) => (
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
