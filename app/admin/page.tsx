import Link from 'next/link'

export default function AdminHub() {
  return (
    <main className="min-h-screen bg-black text-white bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#2D0A4E] via-black to-black flex items-center justify-center p-4">
      <div className="max-w-xl w-full text-center space-y-12">
        <div>
          <h1 className="text-4xl sm:text-5xl font-extrabold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600 drop-shadow-[0_0_15px_rgba(168,85,247,0.5)] tracking-tight">
            Hub Administrativo
          </h1>
          <p className="text-gray-400 text-lg">
            Selecciona la herramienta a la que deseas acceder
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <Link href="/admin/dashboard" className="group flex flex-col items-center justify-center gap-4 bg-[#161920]/80 backdrop-blur-sm border border-[#2D0A4E] hover:border-purple-500 rounded-3xl p-8 hover:bg-[#1a1e26] transition-all duration-300 transform hover:-translate-y-2 hover:shadow-[0_10px_40px_rgba(168,85,247,0.3)]">
            <div className="w-20 h-20 rounded-full bg-purple-500/10 flex items-center justify-center border border-purple-500/30 group-hover:bg-purple-500/20 transition-colors">
              <span className="text-4xl">📊</span>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">Dashboard</h2>
              <p className="text-sm text-gray-400">Gestiona registros, pagos y base de datos</p>
            </div>
          </Link>

          <Link href="/admin/scanner" className="group flex flex-col items-center justify-center gap-4 bg-[#161920]/80 backdrop-blur-sm border border-[#2D0A4E] hover:border-emerald-500 rounded-3xl p-8 hover:bg-[#1a1e26] transition-all duration-300 transform hover:-translate-y-2 hover:shadow-[0_10px_40px_rgba(52,211,153,0.3)]">
            <div className="w-20 h-20 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/30 group-hover:bg-emerald-500/20 transition-colors">
              <span className="text-4xl">📸</span>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">Escáner QR</h2>
              <p className="text-sm text-gray-400">Control de acceso y validación en puerta</p>
            </div>
          </Link>
        </div>

        <div className="pt-8 text-sm text-gray-600 font-mono">
          Sistema Seguro • Pecado & Perreo
        </div>
      </div>
    </main>
  )
}
