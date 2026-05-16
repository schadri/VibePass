'use client'

import { useEffect, useRef, useState } from 'react'
import { Html5Qrcode } from 'html5-qrcode'
import { createClient } from '@/lib/supabase/client'
import { obtenerTodosLosAsistentes } from '@/lib/actions/admin'

export function ScannerEnVivo() {
  const [scanResult, setScanResult] = useState<{ type: 'success' | 'error', msg: string } | null>(null)
  const [todosLosAsistentes, setTodosLosAsistentes] = useState<any[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [cameraEnabled, setCameraEnabled] = useState(false)
  const [debugMsg, setDebugMsg] = useState('Esperando interacción...')
  
  const isProcessing = useRef(false)
  const supabase = createClient()
  const scannerRef = useRef<Html5Qrcode | null>(null)

  // Suscripción Realtime y carga inicial
  useEffect(() => {
    const cargarIniciales = async () => {
      const res = await obtenerTodosLosAsistentes()
      if (res.success && res.data) {
        setTodosLosAsistentes(res.data)
      }
    }
    cargarIniciales()

    // Suscripción a updates de cualquier asistente
    const channel = supabase.channel('realtime_asistentes')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'asistentes' },
        (payload) => {
          setTodosLosAsistentes(prev => {
            return prev.map(a => a.id === payload.new.id ? payload.new : a)
          })
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase])

  const startScanner = async () => {
    try {
      setDebugMsg('1. Verificando compatibilidad...')
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Navegador incompatible o sin HTTPS.')
      }

      setDebugMsg('2. Pidiendo permisos...')
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
      stream.getTracks().forEach(track => track.stop())

      setDebugMsg('3. Renderizando vista...')
      setCameraEnabled(true)

      setTimeout(async () => {
        try {
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

                // Actualizar la lista local inmediatamente (sin esperar al realtime)
                setTodosLosAsistentes(prev => {
                  return prev.map(a => 
                    a.qr_token === token 
                      ? { ...a, ingresado: true, hora_ingreso: new Date().toISOString() } 
                      : a
                  )
                })
              } catch (error: any) {
                setScanResult({ type: 'error', msg: error.message || 'Error de lectura' })
              } finally {
                setTimeout(() => {
                  setScanResult(null)
                  isProcessing.current = false
                }, 2000)
              }
            },
            (errorMessage) => {}
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

  useEffect(() => {
    return () => {
      if (scannerRef.current && scannerRef.current.isScanning) {
        scannerRef.current.stop().then(() => scannerRef.current?.clear()).catch(() => {})
      }
    }
  }, [])

  // Auto-iniciar la cámara al montar el componente
  useEffect(() => {
    // Pequeño delay para asegurar que el DOM esté listo
    const timer = setTimeout(() => {
      startScanner()
    }, 500)
    return () => clearTimeout(timer)
  }, [])

  // Filtrado de asistentes
  const filteredAsistentes = todosLosAsistentes.filter(a => {
    if (!searchQuery) return true
    const term = searchQuery.toLowerCase()
    return (
      a.nombre?.toLowerCase().includes(term) ||
      a.apellido?.toLowerCase().includes(term) ||
      a.dni?.toLowerCase().includes(term) ||
      a.orden_id?.toString().includes(term)
    )
  })

  return (
    <div className="flex flex-col h-screen bg-black text-white font-sans overflow-hidden relative">
      <div className="flex-1 relative flex flex-col items-center justify-center p-4 pb-28">
        <div className="absolute top-4 left-0 right-0 px-4 z-10 text-center">
          <span className="bg-gray-800 text-xs px-3 py-1 rounded-full border border-gray-700 font-mono text-gray-300">
            {debugMsg}
          </span>
        </div>
        
        <div id="reader" className={`w-full max-w-md mx-auto rounded-xl overflow-hidden border-4 border-[#2D0A4E] shadow-[0_0_40px_rgba(168,85,247,0.2)] bg-black text-black z-20 ${!cameraEnabled ? 'opacity-0 absolute -z-10' : 'opacity-100 transition-opacity duration-500'}`}></div>
        
        {scanResult && (
          <div className={`absolute inset-0 z-50 flex items-center justify-center p-6 bg-black bg-opacity-90 backdrop-blur-md transition-all duration-200`}>
             <div className={`w-full max-w-sm p-8 rounded-3xl shadow-2xl text-center transform scale-110 ${
                scanResult.type === 'success' ? 'bg-emerald-500' : 'bg-red-600'
             }`}>
                <h2 className="text-4xl font-black uppercase tracking-wider mb-2">
                  {scanResult.type === 'success' ? 'ÉXITO' : 'DENEGADO'}
                </h2>
                <p className="text-2xl font-bold">{scanResult.msg}</p>
             </div>
          </div>
        )}
      </div>

      {/* Bottom Drawer Desplegable */}
      <div 
        className={`absolute bottom-0 left-0 right-0 bg-[#161920]/95 backdrop-blur-xl border-t border-[#2D0A4E] rounded-t-3xl shadow-[0_-10px_40px_rgba(168,85,247,0.2)] transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] z-40 flex flex-col ${
          isDrawerOpen ? 'h-[85vh]' : 'h-[35vh]'
        }`}
      >
        {/* Manija para arrastrar/clickear */}
        <div 
          className="w-full flex justify-center py-4 cursor-pointer"
          onClick={() => setIsDrawerOpen(!isDrawerOpen)}
        >
          <div className="w-16 h-1.5 bg-gray-500 rounded-full"></div>
        </div>

        {/* Contenido del Drawer */}
        <div className="px-6 pb-6 flex-1 flex flex-col overflow-hidden">
          <div className="flex flex-col gap-4 mb-4">
            <div className="flex justify-between items-center cursor-pointer" onClick={() => setIsDrawerOpen(!isDrawerOpen)}>
              <h3 className="font-bold text-white text-lg flex items-center gap-2">
                👥 Asistentes ({filteredAsistentes.length})
              </h3>
              <span className="flex items-center gap-2 text-xs text-emerald-400 font-bold bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span> En vivo
              </span>
            </div>
            
            <input 
              type="text" 
              placeholder="Buscar por DNI, Nombre o #Orden..." 
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value)
                if (!isDrawerOpen) setIsDrawerOpen(true)
              }}
              onFocus={() => setIsDrawerOpen(true)}
              className="w-full bg-[#0d0e12] border border-[#2D0A4E] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-colors placeholder-gray-500 shadow-inner"
            />
          </div>

          <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
            <ul className="space-y-3 pb-6">
              {filteredAsistentes.length === 0 ? (
                <div className="text-center py-10">
                  <p className="text-gray-500 text-lg">No se encontraron asistentes.</p>
                </div>
              ) : (
                filteredAsistentes.map((asistente) => (
                  <li key={asistente.id} className="flex justify-between items-center bg-[#0d0e12] border border-[#262b36] p-4 rounded-xl hover:border-purple-500/50 transition-colors">
                    <div className="flex flex-col">
                      <span className="font-bold text-white text-lg">{asistente.nombre} {asistente.apellido}</span>
                      <span className="text-sm text-gray-400 flex items-center gap-2">
                        <span className="text-purple-400 font-mono">#{asistente.orden_id}</span>
                        <span>•</span>
                        <span>DNI: {asistente.dni}</span>
                      </span>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      {asistente.ingresado ? (
                        <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-3 py-1 rounded-full text-xs font-black tracking-wide shadow-[0_0_10px_rgba(52,211,153,0.15)]">
                          ADENTRO
                        </span>
                      ) : (
                        <span className="bg-gray-800 text-gray-400 border border-gray-700 px-3 py-1 rounded-full text-xs font-bold">
                          FUERA
                        </span>
                      )}
                      {asistente.ingresado && asistente.hora_ingreso && (
                        <span className="text-xs text-gray-500 font-mono">
                          {new Date(asistente.hora_ingreso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      )}
                    </div>
                  </li>
                ))
              )}
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
