'use client'

import { useState } from 'react'

interface ValorTotalBotonProps {
  total: number
  cantidadVendidas: number
  totalParcial: number
  cantidadTotal: number
}

export function ValorTotalBoton({ total, cantidadVendidas, totalParcial, cantidadTotal }: ValorTotalBotonProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold py-2.5 px-6 rounded-xl hover:opacity-90 transition-all shadow-[0_0_15px_rgba(16,185,129,0.3)] active:scale-[0.98] flex items-center gap-2 text-sm"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        Valor Total
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
          <div className="absolute inset-0" onClick={() => setIsOpen(false)} />
          
          <div className="relative w-full max-w-md p-6 sm:p-8 bg-[#161920]/95 border border-[#2D0A4E] rounded-3xl shadow-[0_0_50px_rgba(16,185,129,0.25)] backdrop-blur-md animate-scale-in text-center">
            <button 
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 text-zinc-400 hover:text-white transition-colors p-2 rounded-full hover:bg-white/10"
              aria-label="Cerrar modal"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <h3 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-600 mb-2 uppercase">
              Recaudación Total
            </h3>
            
            <p className="text-gray-400 text-sm mb-6">Calculado según los precios actuales</p>

            <div className="bg-[#0d0e12] border border-emerald-500/20 p-6 rounded-2xl mb-6 shadow-inner">
              <div className="text-5xl font-black text-emerald-400 drop-shadow-[0_0_15px_rgba(16,185,129,0.4)]">
                ${total.toLocaleString('es-AR')}
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <div className="flex justify-between items-center bg-[#1a1e26] p-4 rounded-xl border border-[#2D0A4E]">
                <span className="text-gray-400 font-bold uppercase tracking-wider text-xs">Entradas Pagas</span>
                <span className="text-white font-black text-xl">{cantidadVendidas}</span>
              </div>

              <div className="flex flex-col gap-2 p-4 rounded-xl border border-amber-500/20 bg-amber-500/5">
                <div className="flex justify-between items-center">
                  <span className="text-amber-500/80 font-bold uppercase tracking-wider text-[10px] pr-2">Proyección Total (Inc. Pendientes)</span>
                  <span className="text-amber-400 font-black text-lg">${totalParcial.toLocaleString('es-AR')}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 font-bold uppercase tracking-wider text-[10px]">Total de Entradas</span>
                  <span className="text-gray-300 font-black text-sm">{cantidadTotal}</span>
                </div>
              </div>
            </div>

            <button 
              onClick={() => setIsOpen(false)}
              className="w-full mt-6 bg-[#2D0A4E] text-white font-bold p-4 rounded-xl hover:bg-[#3d0d6e] transition-all"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </>
  )
}
