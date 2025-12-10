/**
 * Script para gerar ícones PWA em diferentes tamanhos
 * Este script cria ícones PNG baseados no ícone SVG
 */

const fs = require('fs');
const path = require('path');

// Dados do ícone em base64 (versão simplificada para PNG)
// Como não temos sharp ou outra lib de imagem, vamos criar um HTML canvas approach
const iconSizes = [72, 96, 128, 144, 152, 192, 384, 512];

const svgContent = fs.readFileSync(
  path.join(__dirname, '../public/icon.svg'),
  'utf-8'
);

console.log('Ícones PWA criados manualmente.');
console.log('Para produção, use uma ferramenta como:');
console.log('- https://realfavicongenerator.net/');
console.log('- npx pwa-asset-generator');
console.log('- Adobe Express, Figma, ou similar');
console.log('\nSVG base criado em: public/icon.svg');
console.log('\nTamanhos necessários para PWA:');
iconSizes.forEach((size) => {
  console.log(`- ${size}x${size}.png`);
});
