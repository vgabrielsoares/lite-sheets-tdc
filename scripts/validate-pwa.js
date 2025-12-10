/**
 * Script de Validação do PWA Manifest
 * Verifica se o manifest.json está correto e completo
 */

const fs = require('fs');
const path = require('path');

const manifestPath = path.join(__dirname, '../public/manifest.json');
const publicPath = path.join(__dirname, '../public');

console.log('🔍 Validando PWA Manifest...\n');

// 1. Verificar se manifest existe
if (!fs.existsSync(manifestPath)) {
  console.error('❌ Erro: manifest.json não encontrado em public/');
  process.exit(1);
}

// 2. Ler e parsear manifest
let manifest;
try {
  const manifestContent = fs.readFileSync(manifestPath, 'utf-8');
  manifest = JSON.parse(manifestContent);
  console.log('✅ Manifest.json é um JSON válido');
} catch (error) {
  console.error('❌ Erro ao parsear manifest.json:', error.message);
  process.exit(1);
}

// 3. Validar campos obrigatórios
const requiredFields = ['name', 'short_name', 'start_url', 'display', 'icons'];
let hasErrors = false;

console.log('\n📋 Verificando campos obrigatórios:');
requiredFields.forEach((field) => {
  if (manifest[field]) {
    console.log(`  ✅ ${field}`);
  } else {
    console.log(`  ❌ ${field} - AUSENTE`);
    hasErrors = true;
  }
});

// 4. Validar ícones
console.log('\n🎨 Verificando ícones:');
const iconSizes = [
  '72x72',
  '96x96',
  '128x128',
  '144x144',
  '152x152',
  '192x192',
  '384x384',
  '512x512',
];
const iconFiles = {};

// Verificar ícones no manifest
if (manifest.icons && Array.isArray(manifest.icons)) {
  manifest.icons.forEach((icon) => {
    console.log(`  📄 Manifest declara: ${icon.src} (${icon.sizes})`);
  });
} else {
  console.log('  ❌ Nenhum ícone definido no manifest');
  hasErrors = true;
}

// Verificar ícones físicos
console.log('\n📁 Verificando arquivos de ícone em public/:');
iconSizes.forEach((size) => {
  const iconPath = path.join(publicPath, `icon-${size}.png`);
  const exists = fs.existsSync(iconPath);
  iconFiles[size] = exists;

  if (exists) {
    const stats = fs.statSync(iconPath);
    console.log(`  ✅ icon-${size}.png (${(stats.size / 1024).toFixed(2)} KB)`);
  } else {
    console.log(`  ⚠️  icon-${size}.png - NÃO ENCONTRADO`);
  }
});

// Verificar ícone SVG
const svgPath = path.join(publicPath, 'icon.svg');
if (fs.existsSync(svgPath)) {
  console.log('  ✅ icon.svg (escalável)');
} else {
  console.log('  ❌ icon.svg - NÃO ENCONTRADO');
}

// 5. Validar campos importantes
console.log('\n⚙️  Verificando configurações:');

if (manifest.display === 'standalone' || manifest.display === 'fullscreen') {
  console.log(`  ✅ display: "${manifest.display}"`);
} else {
  console.log(
    `  ⚠️  display: "${manifest.display}" - Recomendado: "standalone"`
  );
}

if (manifest.theme_color) {
  console.log(`  ✅ theme_color: "${manifest.theme_color}"`);
} else {
  console.log('  ⚠️  theme_color não definido');
}

if (manifest.background_color) {
  console.log(`  ✅ background_color: "${manifest.background_color}"`);
} else {
  console.log('  ⚠️  background_color não definido');
}

if (manifest.description) {
  console.log(
    `  ✅ description: "${manifest.description.substring(0, 50)}..."`
  );
} else {
  console.log('  ⚠️  description não definido');
}

// 6. Verificar tamanho do short_name
if (manifest.short_name && manifest.short_name.length <= 12) {
  console.log(
    `  ✅ short_name tem ${manifest.short_name.length} caracteres (ideal <= 12)`
  );
} else if (manifest.short_name) {
  console.log(
    `  ⚠️  short_name tem ${manifest.short_name.length} caracteres (recomendado <= 12)`
  );
}

// 7. Verificar ícones obrigatórios
console.log('\n🎯 Verificando ícones obrigatórios para PWA:');
const mandatoryIcons = ['192x192', '512x512'];
mandatoryIcons.forEach((size) => {
  if (iconFiles[size]) {
    console.log(`  ✅ Ícone ${size} presente`);
  } else {
    console.log(`  ❌ Ícone ${size} AUSENTE - OBRIGATÓRIO PARA PWA`);
    hasErrors = true;
  }
});

// 8. Resumo final
console.log('\n' + '='.repeat(50));
if (hasErrors) {
  console.log('❌ VALIDAÇÃO FALHOU - Corrija os erros acima');
  console.log(
    '\n💡 Dica: Use o arquivo public/generate-icons.html para gerar os ícones PNG'
  );
  process.exit(1);
} else {
  const missingIcons = iconSizes.filter((size) => !iconFiles[size]);
  if (missingIcons.length > 0) {
    console.log('⚠️  VALIDAÇÃO OK COM AVISOS');
    console.log(
      `\n⚠️  ${missingIcons.length} ícones opcionais ausentes: ${missingIcons.join(', ')}`
    );
    console.log(
      '\n💡 Recomendação: Gere todos os ícones usando public/generate-icons.html'
    );
    console.log(
      '   Os ícones 192x192 e 512x512 são obrigatórios e estão presentes.'
    );
  } else {
    console.log('✅ VALIDAÇÃO COMPLETA - Manifest PWA está correto!');
  }
}

console.log('='.repeat(50));

// 9. Próximos passos
console.log('\n📚 Próximos passos:');
console.log('  1. Gerar ícones PNG usando public/generate-icons.html');
console.log(
  '  2. Testar instalabilidade no Chrome (DevTools > Application > Manifest)'
);
console.log('  3. Executar Lighthouse PWA audit');
console.log('  4. Implementar Service Worker (Issue 8.2)');
console.log('\n📖 Documentação completa em: PWA_CHECKLIST.md\n');
