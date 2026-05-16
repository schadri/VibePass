import Link from 'next/link'

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-black text-white">
      <h1 className="text-5xl font-extrabold tracking-tight lg:text-6xl mb-8">
        La Fiesta del Año
      </h1>
      <p className="text-xl text-gray-300 mb-12">
        Asegura tu entrada antes de que se agoten.
      </p>
      
      <Link 
        href="/registro"
        className="bg-white text-black font-bold py-4 px-8 rounded-full text-lg hover:bg-gray-200 transition-colors"
      >
        Comprar Entrada
      </Link>
    </main>
  )
}
