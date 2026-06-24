import { NextResponse } from 'next/server'
import dns from 'dns'
import net from 'net'

function resolveDns(host: string): Promise<string[]> {
  return new Promise((resolve) => {
    dns.resolve(host, (err, addresses) => {
      if (err) {
        resolve([])
      } else {
        resolve(addresses)
      }
    })
  })
}

function testTcp(host: string, port: number): Promise<boolean> {
  return new Promise((resolve) => {
    const socket = new net.Socket()
    socket.setTimeout(3000)
    socket.on('connect', () => {
      socket.destroy()
      resolve(true)
    })
    socket.on('timeout', () => {
      socket.destroy()
      resolve(false)
    })
    socket.on('error', () => {
      socket.destroy()
      resolve(false)
    })
    socket.connect(port, host)
  })
}

export async function GET() {
  const host = 'smtp.gmail.com'
  const ips = await resolveDns(host)
  const port465 = await testTcp(host, 465)
  const port587 = await testTcp(host, 587)
  const port25 = await testTcp(host, 25)

  return NextResponse.json({
    host,
    ips,
    ports: {
      '465': port465,
      '587': port587,
      '25': port25
    }
  })
}
