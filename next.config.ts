import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // Autoriser les origines en développement
  allowedDevOrigins: ['192.168.100.9', 'localhost','distract-swab-culprit.ngrok-free.dev'],
  
  // Plus de rewrites — nginx gère déjà le reverse proxy
}

export default nextConfig