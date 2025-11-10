import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // TEMPORARIAMENTE DESABILITADO: output 'export' para resolver problemas de build
  // Para um app PWA offline-first com Redux e IndexedDB, precisamos de SPA puro
  // Será reconfigurado quando pronto para deploy no GitHub Pages
  // output: 'export',

  // Permite rotas dinâmicas
  trailingSlash: true,

  images: {
    unoptimized: true,
  },

  typescript: {
    ignoreBuildErrors: false,
  },
};

export default nextConfig;
