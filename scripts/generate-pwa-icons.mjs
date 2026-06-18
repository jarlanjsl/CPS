/**
 * Gera ícones PWA a partir do SVG mestre.
 *
 * Uso: node scripts/generate-pwa-icons.mjs
 *
 * Requer: sharp (npm install -D sharp)
 */

import sharp from 'sharp';
import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');

const svgPath = join(root, 'public', 'logo-cps.svg');

if (!existsSync(svgPath)) {
  console.error(`Erro: SVG não encontrado em ${svgPath}`);
  process.exit(1);
}

const svgBuffer = readFileSync(svgPath);

const sizes = [192, 512];

for (const size of sizes) {
  const outputPath = join(root, 'public', `icon-${size}x${size}.png`);
  
  try {
    await sharp(svgBuffer)
      .resize(size, size)
      .png()
      .toFile(outputPath);
    
    console.log(`✅ Gerado: public/icon-${size}x${size}.png (${size}x${size})`);
  } catch (err) {
    console.error(`❌ Erro ao gerar icon-${size}x${size}.png:`, err);
    process.exit(1);
  }
}

console.log('\n🎉 Ícones PWA gerados com sucesso!');
console.log('Agora execute: npm run build');
