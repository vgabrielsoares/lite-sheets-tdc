import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",

  // GitHub Pages usa o nome do repositório como base path
  // Descomentar e ajuste quando fizer deploy
  // basePath: '/lite-sheets-tdc',
  // assetPrefix: '/lite-sheets-tdc/',

  images: {
    unoptimized: true, // Necessário para export estático
  },

  // Configurações de TypeScript
  typescript: {
    // Não falhar o build em erros de tipo durante desenvolvimento
    ignoreBuildErrors: false,
  },
};

export default nextConfig;
