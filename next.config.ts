import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Permitir la IP de la red local y túneles (ngrok/localtunnel)
  allowedDevOrigins: ['192.168.0.5', 'localhost', 'some-wasps-post.loca.lt', '*.ngrok-free.app']
} as any;

export default nextConfig;
