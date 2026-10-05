const fs = require('fs');

// News18 Lokmat Logo SVG
const news18LokmatSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 180" width="100%" height="100%">
  <rect width="320" height="180" rx="16" fill="#B71C1C"/>
  <g transform="translate(60, 26)">
    <rect x="0" y="0" width="125" height="52" rx="6" fill="#0D47A1"/>
    <text x="62" y="36" fill="#FFFFFF" font-family="Arial, sans-serif" font-size="24" font-weight="900" text-anchor="middle">NEWS</text>
    <rect x="130" y="0" width="65" height="52" rx="6" fill="#FFFFFF"/>
    <text x="162" y="38" fill="#B71C1C" font-family="Arial, sans-serif" font-size="32" font-weight="900" text-anchor="middle">18</text>
  </g>
  <text x="160" y="132" fill="#FFFFFF" font-family="'Noto Sans Devanagari', 'Mukta', Arial, sans-serif" font-size="34" font-weight="900" text-anchor="middle" letter-spacing="2">लोकमत</text>
  <rect x="35" y="148" width="250" height="4" rx="2" fill="#FFD54F"/>
</svg>`;
fs.writeFileSync('public/assets/images/news/news18_lokmat.svg', news18LokmatSvg);

// Lokshahi News Logo SVG
const lokshahiSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 180" width="100%" height="100%">
  <defs>
    <linearGradient id="lokGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#E65100"/>
      <stop offset="100%" stop-color="#FF6F00"/>
    </linearGradient>
  </defs>
  <rect width="320" height="180" rx="16" fill="url(#lokGrad)"/>
  <circle cx="160" cy="55" r="30" fill="#FFFFFF" opacity="0.2"/>
  <path d="M160 32 L166 48 L182 48 L170 58 L174 74 L160 64 L146 74 L150 58 L138 48 L154 48 Z" fill="#FFD54F"/>
  <text x="160" y="122" fill="#FFFFFF" font-family="'Noto Sans Devanagari', 'Mukta', Arial, sans-serif" font-size="32" font-weight="900" text-anchor="middle" letter-spacing="1">लोकशाही</text>
  <rect x="105" y="136" width="110" height="22" rx="4" fill="#212121"/>
  <text x="160" y="152" fill="#FFFFFF" font-family="Arial, sans-serif" font-size="13" font-weight="bold" text-anchor="middle" letter-spacing="3">NEWS</text>
</svg>`;
fs.writeFileSync('public/assets/images/news/lokshahi.svg', lokshahiSvg);

// Tarun Bharat News Logo SVG
const tarunBharatSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 180" width="100%" height="100%">
  <defs>
    <linearGradient id="tbGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#880E4F"/>
      <stop offset="100%" stop-color="#AD1457"/>
    </linearGradient>
  </defs>
  <rect width="320" height="180" rx="16" fill="url(#tbGrad)"/>
  <circle cx="160" cy="50" r="26" fill="#FFD54F" opacity="0.9"/>
  <path d="M160 32 Q168 45 160 62 Q152 45 160 32 Z" fill="#C2185B"/>
  <text x="160" y="116" fill="#FFFFFF" font-family="'Noto Sans Devanagari', 'Mukta', Arial, sans-serif" font-size="30" font-weight="900" text-anchor="middle" letter-spacing="1">तरुण भारत</text>
  <text x="160" y="148" fill="#FFD54F" font-family="'Noto Sans Devanagari', 'Mukta', Arial, sans-serif" font-size="17" font-weight="700" text-anchor="middle" letter-spacing="2">न्यूज नेटवर्क</text>
</svg>`;
fs.writeFileSync('public/assets/images/news/tarun_bharat.svg', tarunBharatSvg);

// ABP Majha Logo SVG
const abpMajhaSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 180" width="100%" height="100%">
  <rect width="320" height="180" rx="16" fill="#D32F2F"/>
  <g transform="translate(60, 24)">
    <polygon points="0,0 80,0 95,50 15,50" fill="#FFEB3B"/>
    <text x="48" y="37" fill="#D32F2F" font-family="Arial, sans-serif" font-size="28" font-weight="900" text-anchor="middle">ABP</text>
  </g>
  <text x="160" y="132" fill="#FFFFFF" font-family="'Noto Sans Devanagari', 'Mukta', Arial, sans-serif" font-size="36" font-weight="900" text-anchor="middle" letter-spacing="2">माझा</text>
</svg>`;
fs.writeFileSync('public/assets/images/news/abp_majha_clean.svg', abpMajhaSvg);

console.log('Done creating vector logos!');
