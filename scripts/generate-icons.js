// Script untuk generate icon PWA 192x192 dan 512x512
const sharp = require("sharp");
const path = require("path");

const svgIcon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <!-- Background -->
  <rect width="512" height="512" rx="96" fill="#080b11"/>
  
  <!-- Glow effect -->
  <defs>
    <radialGradient id="glow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#10b981" stop-opacity="0.3"/>
      <stop offset="100%" stop-color="#10b981" stop-opacity="0"/>
    </radialGradient>
    <filter id="blur">
      <feGaussianBlur stdDeviation="8"/>
    </filter>
  </defs>
  
  <!-- Glow circle -->
  <circle cx="256" cy="260" r="160" fill="url(#glow)"/>
  
  <!-- Candlestick chart bars -->
  <!-- Bar 1 - bearish -->
  <rect x="108" y="200" width="36" height="100" rx="6" fill="#ef4444" opacity="0.85"/>
  <rect x="122" y="180" width="8" height="30" rx="2" fill="#ef4444" opacity="0.7"/>
  <rect x="122" y="300" width="8" height="25" rx="2" fill="#ef4444" opacity="0.7"/>
  
  <!-- Bar 2 - bullish -->
  <rect x="166" y="170" width="36" height="120" rx="6" fill="#10b981" opacity="0.9"/>
  <rect x="180" y="145" width="8" height="32" rx="2" fill="#10b981" opacity="0.75"/>
  <rect x="180" y="290" width="8" height="28" rx="2" fill="#10b981" opacity="0.75"/>
  
  <!-- Bar 3 - bearish small -->
  <rect x="224" y="210" width="36" height="70" rx="6" fill="#ef4444" opacity="0.75"/>
  <rect x="238" y="192" width="8" height="24" rx="2" fill="#ef4444" opacity="0.6"/>
  <rect x="238" y="280" width="8" height="22" rx="2" fill="#ef4444" opacity="0.6"/>
  
  <!-- Bar 4 - large bullish (highlighted) -->
  <rect x="282" y="145" width="44" height="155" rx="7" fill="#10b981"/>
  <rect x="299" y="112" width="10" height="40" rx="2" fill="#10b981" opacity="0.9"/>
  <rect x="299" y="300" width="10" height="35" rx="2" fill="#10b981" opacity="0.9"/>
  
  <!-- Bar 5 - small bullish -->
  <rect x="348" y="185" width="36" height="90" rx="6" fill="#10b981" opacity="0.8"/>
  <rect x="362" y="162" width="8" height="30" rx="2" fill="#10b981" opacity="0.65"/>
  <rect x="362" y="275" width="8" height="26" rx="2" fill="#10b981" opacity="0.65"/>
  
  <!-- Trend line (upward arrow) -->
  <polyline points="130,340 200,290 260,310 340,200 400,160" 
    fill="none" stroke="#10b981" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" opacity="0.6"/>
  
  <!-- Up arrow at trend line end -->
  <polygon points="400,140 390,168 412,168" fill="#10b981" opacity="0.8"/>
  
  <!-- Bottom line -->
  <line x1="95" y1="370" x2="417" y2="370" stroke="#1e293b" stroke-width="3"/>
</svg>`;

async function generateIcons() {
  const svgBuffer = Buffer.from(svgIcon);
  const publicDir = path.join(__dirname, "..", "public");

  // Generate 192x192
  await sharp(svgBuffer)
    .resize(192, 192)
    .png()
    .toFile(path.join(publicDir, "icon-192.png"));
  console.log("✅ icon-192.png generated");

  // Generate 512x512
  await sharp(svgBuffer)
    .resize(512, 512)
    .png()
    .toFile(path.join(publicDir, "icon-512.png"));
  console.log("✅ icon-512.png generated");

  // Generate favicon (32x32)
  await sharp(svgBuffer)
    .resize(32, 32)
    .png()
    .toFile(path.join(publicDir, "favicon.png"));
  console.log("✅ favicon.png generated");

  console.log("\n🎉 Semua ikon PWA berhasil dibuat di folder /public/");
}

generateIcons().catch(console.error);
