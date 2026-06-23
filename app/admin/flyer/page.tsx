"use client";

import { useState, useRef } from "react";
import * as htmlToImage from "html-to-image";
import { Download, RefreshCw, Image as ImageIcon } from "lucide-react";
import Image from "next/image";
import localFont from 'next/font/local';

const dinNextShadow = localFont({
  src: '../../../public/fonts/DINNextShadow-Black.ttf',
});

export default function FlyerGenerator() {
  const flyerRef = useRef<HTMLDivElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const [data, setData] = useState({
    title: "EVENTO URBANO Y2K",
    date: "SABADO 13 de JUNIO",
    timeLoc: "de 00:00 a 05:00 AM | av. Boedo 830",
    customText: "ANTICIPADAS\n1x $5000\n2x $8500\n\nPUERTA\n1x $10.000\n2x $18.000",
    showLogo: true,
    logoScale: "1",
    logoY: "0",
    titleScale: "1",
    titleY: "0",
    dateScale: "1",
    dateY: "0",
    timeLocScale: "1",
    timeLocY: "0",
    customTextScale: "1",
    customTextY: "0",
    iconLeftScale: "1",
    iconLeftY: "0",
    iconRightScale: "1",
    iconRightY: "0",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    const isCheckbox = e.target instanceof HTMLInputElement && e.target.type === "checkbox";
    const checked = isCheckbox ? (e.target as HTMLInputElement).checked : false;
    
    setData((prev) => ({
      ...prev,
      [name]: isCheckbox ? checked : value,
    }));
  };

  const renderControls = (scaleName: string, yName: string, scaleVal: string, yVal: string) => (
    <div className="flex gap-4 mt-2 bg-gray-900/50 p-2 rounded border border-gray-700/50">
      <div className="flex-1">
        <label className="text-[10px] text-gray-400 block mb-1">Tamaño: {scaleVal}x</label>
        <input type="range" name={scaleName} min="0.5" max="2" step="0.05" value={scaleVal} onChange={handleChange} className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-cyan-500" />
      </div>
      <div className="flex-1">
        <label className="text-[10px] text-gray-400 block mb-1">Posición Vertical: {yVal}px</label>
        <input type="range" name={yName} min="-150" max="150" step="5" value={yVal} onChange={handleChange} className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-cyan-500" />
      </div>
    </div>
  );

  const downloadFlyer = async () => {
    if (!flyerRef.current) return;
    try {
      setIsGenerating(true);
      const url = await htmlToImage.toPng(flyerRef.current, {
        pixelRatio: 2, // Mejor calidad
        backgroundColor: "#000000",
      });
      const link = document.createElement("a");
      link.download = `flyer-${data.date.replace(/\s+/g, "-")}.png`;
      link.href = url;
      link.click();
    } catch (error) {
      console.error("Error al generar flyer:", error);
      alert("Hubo un error al generar el flyer. Intenta nuevamente.");
    } finally {
      setIsGenerating(false);
    }
  };

  const neonStyle = {
    color: "#ff4da6", // Rosa un poco más claro para que resalte y se lea mejor
    textShadow: "0 0 3px #ff0066, 0 0 8px #ff0055", // Resplandor más ajustado (menos borroso/flúor)
    fontFamily: "Arial, Helvetica, sans-serif",
    fontWeight: 900,
    WebkitTextStroke: "1px black", // Fino delineado negro
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-cyan-400 flex items-center gap-3">
          <ImageIcon className="w-8 h-8" />
          Generador de Flyers
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Columna Izquierda: Formulario */}
          <div className="bg-gray-800 rounded-xl p-6 shadow-xl border border-gray-700">
            <h2 className="text-xl font-semibold mb-6 border-b border-gray-700 pb-2">Datos del Evento</h2>
            
            <div className="space-y-6">
              
              {/* Logo Settings */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <input
                    type="checkbox"
                    name="showLogo"
                    id="showLogo"
                    checked={data.showLogo}
                    onChange={handleChange}
                    className="w-4 h-4 rounded bg-gray-900 border-gray-600 text-cyan-500 focus:ring-cyan-500"
                  />
                  <label htmlFor="showLogo" className="text-sm font-medium text-gray-400">Mostrar Logo Central (Pecado & Perreo)</label>
                </div>
                {data.showLogo && renderControls("logoScale", "logoY", data.logoScale, data.logoY)}
              </div>

              {/* Title Settings */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Título Superior</label>
                <textarea
                  name="title"
                  value={data.title}
                  onChange={handleChange}
                  rows={2}
                  className="w-full bg-gray-900 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-cyan-500 resize-none"
                />
                {renderControls("titleScale", "titleY", data.titleScale, data.titleY)}
              </div>

              {/* Date/Time Settings */}
              <div className="p-4 bg-gray-800 border border-gray-700 rounded-lg space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Fecha (Ej: SABADO 13 de JUNIO)</label>
                  <input
                    type="text"
                    name="date"
                    value={data.date}
                    onChange={handleChange}
                    className="w-full bg-gray-900 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-cyan-500"
                  />
                  {renderControls("dateScale", "dateY", data.dateScale, data.dateY)}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Horario y Lugar</label>
                  <input
                    type="text"
                    name="timeLoc"
                    value={data.timeLoc}
                    onChange={handleChange}
                    className="w-full bg-gray-900 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-cyan-500"
                  />
                  {renderControls("timeLocScale", "timeLocY", data.timeLocScale, data.timeLocY)}
                </div>
              </div>

              <div className="pt-4 border-t border-gray-700 space-y-3">
                <h3 className="font-medium text-cyan-400">Texto Inferior</h3>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Escribe aquí los precios, información extra, etc.</label>
                  <textarea
                    name="customText"
                    value={data.customText}
                    onChange={handleChange}
                    rows={6}
                    className="w-full bg-gray-900 border border-gray-600 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
                {renderControls("customTextScale", "customTextY", data.customTextScale, data.customTextY)}
              </div>

              <div className="pt-4 border-t border-gray-700 space-y-3">
                <h3 className="font-medium text-cyan-400">Iconos Inferiores</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-400 mb-1">Icono Izquierdo (Boombox)</label>
                    {renderControls("iconLeftScale", "iconLeftY", data.iconLeftScale, data.iconLeftY)}
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-400 mb-1">Icono Derecho (Diamante)</label>
                    {renderControls("iconRightScale", "iconRightY", data.iconRightScale, data.iconRightY)}
                  </div>
                </div>
              </div>

              <button
                onClick={downloadFlyer}
                disabled={isGenerating}
                className="w-full mt-6 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-all disabled:opacity-50"
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    Generando...
                  </>
                ) : (
                  <>
                    <Download className="w-5 h-5" />
                    Descargar Flyer
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Columna Derecha: Vista Previa */}
          <div className="bg-black rounded-xl p-4 shadow-xl flex items-center justify-center relative overflow-hidden border border-gray-800">
            <div 
              className="absolute top-2 left-2 bg-gray-900/80 px-3 py-1 rounded text-xs font-semibold text-cyan-400 z-10 backdrop-blur-sm"
            >
              VISTA PREVIA
            </div>
            
            {/* Contenedor del Flyer */}
            <div 
              ref={flyerRef}
              className="relative bg-black w-[400px] h-[711px] overflow-hidden select-none border-[3px] border-cyan-400 rounded-3xl" 
              style={{ boxShadow: "0 0 15px #00ffff, inset 0 0 15px #00ffff" }}
            >
              {/* Imágenes generadas */}
              <div 
                className="absolute top-4 left-0 w-full h-[150px] opacity-90" 
                style={{ mixBlendMode: 'screen', filter: 'contrast(1.5) brightness(0.8)' }}
              >
                <img src="/top_tribal.png" alt="Tribal Top" className="w-full h-full object-contain" />
              </div>
              <div 
                className="absolute bottom-6 left-6 w-[70px] h-[70px] opacity-90" 
                style={{ mixBlendMode: 'screen', filter: 'contrast(1.5) brightness(0.8)', transform: `translateY(${data.iconLeftY}px) scale(${data.iconLeftScale})`, transition: 'transform 0.2s ease-out' }}
              >
                <img src="/boombox_icon.png" alt="Boombox Left" className="w-full h-full object-contain" />
              </div>

              <div 
                className="absolute bottom-6 right-6 w-[70px] h-[70px] opacity-90" 
                style={{ mixBlendMode: 'screen', filter: 'contrast(1.5) brightness(0.8)', transform: `translateY(${data.iconRightY}px) scale(${data.iconRightScale})`, transition: 'transform 0.2s ease-out' }}
              >
                <img src="/diamond_icon.png" alt="Diamond Right" className="w-full h-full object-contain" />
              </div>

              {/* Overlay de Textos */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pt-[140px] pb-[100px] z-20">
                
                {/* Logo Central */}
                <div 
                  className="flex items-center justify-center w-full mb-4 relative z-10 shrink-0"
                  style={{ transform: `translateY(${data.logoY}px) scale(${data.logoScale})`, transition: 'transform 0.2s ease-out' }}
                >
                  {data.showLogo && (
                    <div className="text-center">
                      <h1 className={`${dinNextShadow.className} text-[60px] font-black tracking-widest uppercase leading-none`}>
                        <span className="text-black [text-shadow:-1px_-1px_0_#ff3399,_1px_-1px_0_#ff3399,_-1px_1px_0_#ff3399,_1px_1px_0_#ff3399,_0_0_10px_rgba(255,51,153,0.8)]">Pecado</span>
                        <br />
                        <span className="text-black [text-shadow:-1px_-1px_0_#ff3399,_1px_-1px_0_#ff3399,_-1px_1px_0_#ff3399,_1px_1px_0_#ff3399,_0_0_10px_rgba(255,51,153,0.8)]">& Perreo</span>
                      </h1>
                    </div>
                  )}
                </div>

                {/* Título Superior */}
                <div style={{ transform: `translateY(${data.titleY}px) scale(${data.titleScale})`, transition: 'transform 0.2s ease-out' }}>
                  <h2 className={`${dinNextShadow.className} text-[40px] text-center uppercase tracking-widest px-4 leading-tight z-10 mb-4 text-black [text-shadow:-1px_-1px_0_#ff3399,_1px_-1px_0_#ff3399,_-1px_1px_0_#ff3399,_1px_1px_0_#ff3399,_0_0_10px_rgba(255,51,153,0.8)] whitespace-pre`}>
                    {data.title}
                  </h2>
                </div>

                <div 
                  className="w-full flex flex-col items-center shrink-0 mb-1"
                  style={{ transform: `translateY(${data.dateY}px) scale(${data.dateScale})`, transition: 'transform 0.2s ease-out' }}
                >
                  {/* Fecha */}
                  <h3 className="text-[28px] text-center uppercase tracking-wide leading-none z-10" style={neonStyle}>
                    {data.date}
                  </h3>
                </div>

                <div 
                  className="w-full flex flex-col items-center shrink-0 mb-4"
                  style={{ transform: `translateY(${data.timeLocY}px) scale(${data.timeLocScale})`, transition: 'transform 0.2s ease-out' }}
                >
                  {/* Horario y Lugar */}
                  <p className="text-[13px] text-center tracking-wide z-10" style={neonStyle}>
                    {data.timeLoc}
                  </p>
                </div>

                {/* Texto Inferior (Reemplaza a los precios divididos) */}
                <div 
                  className="w-full z-10 mt-2 text-center"
                  style={{ transform: `translateY(${data.customTextY}px) scale(${data.customTextScale})`, transition: 'transform 0.2s ease-out' }}
                >
                  <div className="whitespace-pre-wrap leading-tight text-[22px] tracking-wider font-bold" style={neonStyle}>
                    {data.customText}
                  </div>
                </div>

              </div>
            </div>
            
          </div>
        </div>
      </div>
    </div>
  );
}
