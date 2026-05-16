'use client'

import dynamic from 'next/dynamic'

const ScannerEnVivo = dynamic(
  () => import('@/components/admin/ScannerEnVivo').then((mod) => mod.ScannerEnVivo),
  { ssr: false, loading: () => <div className="h-screen w-full bg-black flex items-center justify-center text-white">Cargando escáner...</div> }
)

export default function ScannerPage() {
  return <ScannerEnVivo />
}
