import { RegistroForm } from '@/components/forms/RegistroForm'

export default function RegistroPage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-black bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#2D0A4E] via-black to-black">
      <div className="max-w-md w-full space-y-8 bg-[#161920] border border-[#2D0A4E] p-8 rounded-3xl shadow-[0_0_40px_rgba(168,85,247,0.15)] relative overflow-hidden">
        {/* Decorative glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-b-full blur-[2px]"></div>
        
        <div>
          <h2 className="mt-2 text-center text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
            Asegurá tu lugar
          </h2>
          <p className="mt-3 text-center text-sm text-gray-400">
            Completá tus datos para recibir tu entrada.
          </p>
        </div>
        <RegistroForm />
      </div>
    </main>
  )
}
