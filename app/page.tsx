'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import localFont from 'next/font/local'
import { obtenerPrecios } from '@/lib/actions/registro'

const dinNextShadow = localFont({
  src: '../public/fonts/DINNextShadow-Black.ttf',
})

function formatFecha(fechaStr: string | null) {
  if (!fechaStr || fechaStr.toLowerCase() === 'proximamente' || fechaStr.trim() === '') {
    return 'Próximamente'
  }
  try {
    const parts = fechaStr.split('-')
    if (parts.length === 3) {
      const date = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]))
      return date.toLocaleDateString('es-AR', {
        weekday: 'long',
        day: 'numeric',
        month: 'long'
      }).replace(/^\w/, (c) => c.toUpperCase())
    }
    return fechaStr
  } catch (e) {
    return fechaStr
  }
}

export default function Home() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [precios, setPrecios] = useState({ simple: 5000, doble: 8500, puerta: 10000, fecha_evento: null as string | null })

  useEffect(() => {
    obtenerPrecios().then(setPrecios)
  }, [])

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center p-6 sm:p-24 text-white bg-[url('/fondo_cel.jpg')] md:bg-[url('/fondo_windscreen.jpg')] bg-cover bg-center bg-no-repeat overflow-hidden">
      {/* Black semi-transparent overlay */}
      <div className="absolute inset-0 bg-black/50" />

      <div className="relative text-center w-full max-w-3xl z-10">
        {/* Próximo Evento Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 mb-6 backdrop-blur-sm shadow-[0_0_15px_rgba(226,42,142,0.1)]">
          <span className="w-2 h-2 rounded-full bg-[#e22a8e] animate-pulse"></span>
          <span className="text-xs sm:text-sm font-bold uppercase tracking-widest text-zinc-300">
            Próximo evento: <span className="text-[#e22a8e] font-extrabold">{formatFecha(precios.fecha_evento)}</span>
          </span>
        </div>

        <h1 className={`${dinNextShadow.className} text-5xl sm:text-7xl md:text-8xl font-black mb-8 tracking-widest uppercase leading-tight`}>
          <span className="text-black [text-shadow:-1.5px_-1.5px_0_#e22a8e,_1.5px_-1.5px_0_#e22a8e,_-1.5px_1.5px_0_#e22a8e,_1.5px_1.5px_0_#e22a8e,_0_0_15px_rgba(226,42,142,0.7)]">Pecado</span>
          <br />
          <span className="text-black [text-shadow:-1.5px_-1.5px_0_#e22a8e,_1.5px_-1.5px_0_#e22a8e,_-1.5px_1.5px_0_#e22a8e,_1.5px_1.5px_0_#e22a8e,_0_0_15px_rgba(226,42,142,0.7)]">& Perreo</span>
        </h1>
        <p className="text-xl mb-12 font-semibold tracking-wide bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600 drop-shadow-[0_0_8px_rgba(168,85,247,0.4)]">
          Asegura tu entrada antes de que se agoten.
        </p>
        
        <Link 
          href="/registro"
          className="inline-block bg-[#e22a8e] text-black font-bold py-4 px-10 rounded-full text-lg hover:bg-[#ef3b9f] hover:scale-105 hover:shadow-[0_0_30px_rgba(226,42,142,0.6)] transition-all duration-300"
        >
          Comprar Entrada
        </Link>

        {/* Modal Trigger Text */}
        <button 
          onClick={() => setIsModalOpen(true)}
          className="mt-6 block mx-auto text-pink-400 hover:text-pink-300 underline underline-offset-4 cursor-pointer transition-colors duration-300 font-semibold text-sm sm:text-base tracking-wide focus:outline-none"
        >
          Valor de las entradas
        </button>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
          {/* Backdrop Click to Close */}
          <div className="absolute inset-0" onClick={() => setIsModalOpen(false)} />
          
          {/* Modal content */}
          <div className="relative w-full max-w-md p-6 sm:p-8 bg-zinc-950/95 border border-zinc-800 rounded-3xl shadow-[0_0_50px_rgba(226,42,142,0.25)] backdrop-blur-md animate-scale-in text-left">
            {/* Close Button */}
            <button 
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-zinc-400 hover:text-white transition-colors p-2 rounded-full hover:bg-white/10"
              aria-label="Cerrar modal"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Title */}
            <h2 className={`${dinNextShadow.className} text-3xl sm:text-4xl text-white mb-6 tracking-wider text-center uppercase [text-shadow:0_0_10px_rgba(226,42,142,0.3)]`}>
              Valor de las entradas
            </h2>

            {/* Price Items */}
            <div className="space-y-4">
              <div className="flex justify-between items-center p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-pink-500/30 transition-all duration-300 group">
                <span className="text-zinc-300 group-hover:text-white transition-colors font-medium">Valor de la entrada</span>
                <span className="text-pink-400 font-bold text-lg">${precios.simple.toLocaleString('es-AR')}</span>
              </div>
              
              <div className="flex justify-between items-center p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-pink-500/30 transition-all duration-300 group">
                <span className="text-zinc-300 group-hover:text-white transition-colors font-medium">Valor 2 entradas</span>
                <span className="text-pink-400 font-bold text-lg">${precios.doble.toLocaleString('es-AR')}</span>
              </div>
              
              <div className="flex justify-between items-center p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-pink-500/30 transition-all duration-300 group">
                <span className="text-zinc-300 group-hover:text-white transition-colors font-medium">Entrada en puerta</span>
                <span className="text-pink-400 font-bold text-lg">${precios.puerta.toLocaleString('es-AR')}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
