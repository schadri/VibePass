import Link from 'next/link'

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 sm:p-24 bg-black text-white bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#2D0A4E] via-black to-black">
      <div className="text-center w-full max-w-3xl">
        <img 
          src="/PYP.png" 
          alt="Pecado & Perreo" 
          className="w-[280px] sm:w-[360px] md:w-[480px] h-auto mx-auto mb-8 drop-shadow-[0_0_20px_rgba(168,85,247,0.6)] object-contain" 
        />
        <p className="text-xl mb-12 font-semibold tracking-wide bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600 drop-shadow-[0_0_8px_rgba(168,85,247,0.4)]">
          Asegura tu entrada antes de que se agoten.
        </p>
        
        <Link 
          href="/registro"
          className="inline-block bg-purple-600 text-white font-bold py-4 px-10 rounded-full text-lg hover:bg-purple-500 hover:scale-105 hover:shadow-[0_0_30px_rgba(168,85,247,0.6)] transition-all duration-300"
        >
          Comprar Entrada
        </Link>
      </div>
    </main>
  )
}
