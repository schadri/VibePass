'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { loginAdmin } from '@/lib/actions/admin'
import { Eye, EyeOff } from 'lucide-react'

export default function AdminLogin() {
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await loginAdmin(password)
      if (res.success) {
        // Redirigir al admin hub u otra página que intentaba acceder
        router.push('/admin')
        router.refresh() // Forzar que middleware vuelva a ejecutar
      } else {
        setError(res.error || 'Error al iniciar sesión')
      }
    } catch (err) {
      setError('Ocurrió un error de conexión')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-black text-white bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#2D0A4E] via-black to-black flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-[#161920]/80 backdrop-blur-xl border border-[#2D0A4E] rounded-3xl p-8 shadow-[0_0_40px_rgba(168,85,247,0.15)] relative overflow-hidden">
        {/* Glow effect */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-purple-600 rounded-full mix-blend-multiply filter blur-[64px] opacity-20"></div>
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-pink-600 rounded-full mix-blend-multiply filter blur-[64px] opacity-20"></div>

        <div className="relative z-10">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-extrabold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600 drop-shadow-[0_0_10px_rgba(168,85,247,0.5)]">
              Acceso Restringido
            </h1>
            <p className="text-gray-400 text-sm">Ingresa la clave de administrador para continuar</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="relative group">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#0d0e12] border border-[#2D0A4E] rounded-xl px-4 py-4 pr-12 text-white text-center text-xl tracking-widest focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-colors placeholder-gray-600"
                autoFocus
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-purple-400 focus:outline-none transition-colors"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/50 text-red-400 text-sm text-center p-3 rounded-lg">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !password}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold py-4 rounded-xl hover:opacity-90 disabled:opacity-50 transition-all shadow-[0_0_20px_rgba(168,85,247,0.4)]"
            >
              {loading ? 'Verificando...' : 'Entrar al Sistema'}
            </button>
          </form>
        </div>
      </div>
    </main>
  )
}
