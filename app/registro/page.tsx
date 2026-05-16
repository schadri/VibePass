import { RegistroForm } from '@/components/forms/RegistroForm'

export default function RegistroPage() {
  return (
    <main className="min-h-screen bg-gray-50 flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-2xl shadow-xl">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Registro para la Fiesta
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Completa tus datos para reservar tu entrada.
          </p>
        </div>
        <RegistroForm />
      </div>
    </main>
  )
}
