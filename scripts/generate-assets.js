#!/usr/bin/env node
'use strict';

const { Resvg } = require('@resvg/resvg-js');
const fs = require('fs');
const path = require('path');

const ASSETS_DIR = path.join(__dirname, '..', 'assets');

// ── SVG: Ícone completo (fundo verde arredondado + logo) ──────────────────────
const ICON_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <!-- Fundo verde arredondado -->
  <rect width="512" height="512" rx="115" fill="#2D6A4F"/>

  <!-- Círculos decorativos externos -->
  <circle cx="256" cy="256" r="218"
    fill="white" fill-opacity="0.07"
    stroke="white" stroke-opacity="0.15" stroke-width="2"/>
  <circle cx="256" cy="256" r="193"
    fill="white" fill-opacity="0.04"
    stroke="white" stroke-opacity="0.09" stroke-width="1.5"/>

  <!-- Círculo interno (logo bg) -->
  <circle cx="256" cy="256" r="152" fill="#52B788"/>

  <!-- Caule -->
  <path d="M 256,168 L 256,338"
    stroke="#1B4332" stroke-width="11" stroke-linecap="round" fill="none"/>

  <!-- Folha direita superior -->
  <path d="M 254,200 C 268,160 326,145 347,169
           C 368,193 349,234 311,240
           C 284,244 255,222 254,200 Z"
    fill="#1B4332"/>

  <!-- Folha esquerda inferior -->
  <path d="M 258,254 C 244,214 182,201 161,226
           C 140,251 162,286 201,287
           C 228,288 257,271 258,254 Z"
    fill="#1B4332"/>

  <!-- Folha esquerda superior (menor) -->
  <path d="M 256,179 C 244,147 197,135 178,156
           C 159,177 179,210 212,213
           C 235,215 255,196 256,179 Z"
    fill="#40916C"/>

  <!-- Coração rosa -->
  <g transform="translate(303,302)">
    <path d="M 0,-16 C 5,-26 22,-26 22,-9
             C 22,2 12,12 0,25
             C -12,12 -22,2 -22,-9
             C -22,-26 -5,-26 0,-16 Z"
      fill="#FF6B8A"/>
  </g>
</svg>
`;

// ── SVG: Logo sem fundo (para splash e foreground Android) ────────────────────
const LOGO_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <!-- Círculo decorativo externo -->
  <circle cx="256" cy="256" r="218"
    fill="white" fill-opacity="0.10"
    stroke="white" stroke-opacity="0.25" stroke-width="3"/>
  <!-- Círculo decorativo interno -->
  <circle cx="256" cy="256" r="193"
    fill="white" fill-opacity="0.05"
    stroke="white" stroke-opacity="0.12" stroke-width="2"/>

  <!-- Círculo principal -->
  <circle cx="256" cy="256" r="152" fill="#52B788"/>

  <!-- Caule -->
  <path d="M 256,168 L 256,338"
    stroke="#1B4332" stroke-width="11" stroke-linecap="round" fill="none"/>

  <!-- Folha direita superior -->
  <path d="M 254,200 C 268,160 326,145 347,169
           C 368,193 349,234 311,240
           C 284,244 255,222 254,200 Z"
    fill="#1B4332"/>

  <!-- Folha esquerda inferior -->
  <path d="M 258,254 C 244,214 182,201 161,226
           C 140,251 162,286 201,287
           C 228,288 257,271 258,254 Z"
    fill="#1B4332"/>

  <!-- Folha esquerda superior (menor) -->
  <path d="M 256,179 C 244,147 197,135 178,156
           C 159,177 179,210 212,213
           C 235,215 255,196 256,179 Z"
    fill="#40916C"/>

  <!-- Coração rosa -->
  <g transform="translate(303,302)">
    <path d="M 0,-16 C 5,-26 22,-26 22,-9
             C 22,2 12,12 0,25
             C -12,12 -22,2 -22,-9
             C -22,-26 -5,-26 0,-16 Z"
      fill="#FF6B8A"/>
  </g>
</svg>
`;

// ── SVG: Fundo sólido verde (Android adaptive background) ────────────────────
const BG_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <rect width="512" height="512" fill="#2D6A4F"/>
</svg>
`;

// ── SVG: Monocromático branco sobre transparente (Android monochrome) ─────────
const MONO_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <circle cx="256" cy="256" r="218"
    fill="white" fill-opacity="0.15"
    stroke="white" stroke-opacity="0.3" stroke-width="3"/>
  <circle cx="256" cy="256" r="193"
    fill="white" fill-opacity="0.08"
    stroke="white" stroke-opacity="0.18" stroke-width="2"/>
  <circle cx="256" cy="256" r="152" fill="white" fill-opacity="0.55"/>
  <path d="M 256,168 L 256,338"
    stroke="white" stroke-opacity="0.9" stroke-width="11" stroke-linecap="round" fill="none"/>
  <path d="M 254,200 C 268,160 326,145 347,169
           C 368,193 349,234 311,240
           C 284,244 255,222 254,200 Z"
    fill="white" fill-opacity="0.9"/>
  <path d="M 258,254 C 244,214 182,201 161,226
           C 140,251 162,286 201,287
           C 228,288 257,271 258,254 Z"
    fill="white" fill-opacity="0.9"/>
  <path d="M 256,179 C 244,147 197,135 178,156
           C 159,177 179,210 212,213
           C 235,215 255,196 256,179 Z"
    fill="white" fill-opacity="0.7"/>
  <g transform="translate(303,302)">
    <path d="M 0,-16 C 5,-26 22,-26 22,-9
             C 22,2 12,12 0,25
             C -12,12 -22,2 -22,-9
             C -22,-26 -5,-26 0,-16 Z"
      fill="white" fill-opacity="0.9"/>
  </g>
</svg>
`;

// ── Render helpers ────────────────────────────────────────────────────────────

function renderSvg(svgStr, width) {
  const resvg = new Resvg(svgStr, { fitTo: { mode: 'width', value: width } });
  return resvg.render().asPng();
}

function save(buffer, filename) {
  const filepath = path.join(ASSETS_DIR, filename);
  fs.writeFileSync(filepath, buffer);
  console.log(`  ✓  ${filename}`);
}

// ── Main ──────────────────────────────────────────────────────────────────────

function main() {
  console.log('\nGerando assets...\n');

  save(renderSvg(ICON_SVG, 1024),  'icon.png');
  save(renderSvg(ICON_SVG,   64),  'favicon.png');
  save(renderSvg(LOGO_SVG,  512),  'splash-icon.png');
  save(renderSvg(LOGO_SVG, 1024),  'android-icon-foreground.png');
  save(renderSvg(BG_SVG,   1024),  'android-icon-background.png');
  save(renderSvg(MONO_SVG, 1024),  'android-icon-monochrome.png');

  console.log('\nPronto! Reinicie o servidor Expo (pressione R no terminal).\n');
}

main();
