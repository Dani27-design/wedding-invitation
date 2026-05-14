import { createCanvas, registerFont } from 'canvas';
import { writeFileSync } from 'fs';

registerFont('public/fonts/Dayland.ttf', { family: 'Dayland' });

const CANVAS_W = 1080;
const CANVAS_H = 1920;
const FRAME_MARGIN = 100;
const FRAME_TOP = 140;
const FRAME_BOTTOM = 280;

const canvas = createCanvas(CANVAS_W, CANVAS_H);
const ctx = canvas.getContext('2d');

// Inline the drawOverlay logic (can't import TS directly in Node)
const w = CANVAS_W;
const h = CANVAS_H;
const margin = FRAME_MARGIN;
const top = FRAME_TOP;
const viewW = w - margin * 2;
const viewH = h - top - FRAME_BOTTOM;
const arcR = viewW / 2;

const archPath = (inset = 0) => {
  const m = inset;
  ctx.beginPath();
  ctx.moveTo(margin + m, top + arcR);
  ctx.arcTo(margin + m, top + m, margin + arcR, top + m, arcR - m);
  ctx.arcTo(margin + viewW - m, top + m, margin + viewW - m, top + arcR, arcR - m);
  ctx.lineTo(margin + viewW - m, top + viewH - m);
  ctx.lineTo(margin + m, top + viewH - m);
  ctx.closePath();
};

ctx.fillStyle = '#F2EEE9';
ctx.fillRect(0, 0, w, h);

ctx.save();
ctx.globalCompositeOperation = 'destination-out';
ctx.filter = 'blur(35px)';
ctx.fillStyle = 'white';
archPath(40);
ctx.fill();
ctx.restore();
ctx.filter = 'none';

ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
ctx.lineWidth = 2;
archPath(45);
ctx.stroke();

const sunGrad = ctx.createRadialGradient(w * 0.9, 0, 0, w * 0.9, 0, w * 0.7);
sunGrad.addColorStop(0, 'rgba(255, 248, 230, 0.12)');
sunGrad.addColorStop(1, 'transparent');
ctx.fillStyle = sunGrad;
ctx.fillRect(0, 0, w, h);

const drawPetal = (x, y, rw, rh, angle, color) => {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.ellipse(0, 0, rw, rh, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
};

const themes = [
  { main: 'rgba(235, 170, 185, 0.5)', secondary: 'rgba(245, 200, 210, 0.35)', center: 'rgba(200, 130, 150, 0.25)' },
  { main: 'rgba(255, 200, 180, 0.5)', secondary: 'rgba(255, 225, 210, 0.35)', center: 'rgba(230, 160, 140, 0.25)' },
  { main: 'rgba(255, 253, 240, 0.6)', secondary: 'rgba(255, 255, 255, 0.45)', center: 'rgba(240, 220, 160, 0.3)' },
  { main: 'rgba(250, 240, 185, 0.5)', secondary: 'rgba(255, 250, 210, 0.35)', center: 'rgba(220, 190, 100, 0.25)' },
  { main: 'rgba(195, 180, 235, 0.5)', secondary: 'rgba(210, 200, 250, 0.35)', center: 'rgba(150, 130, 200, 0.25)' },
  { main: 'rgba(175, 205, 240, 0.5)', secondary: 'rgba(200, 220, 250, 0.35)', center: 'rgba(140, 170, 220, 0.25)' },
  { main: 'rgba(220, 180, 190, 0.55)', secondary: 'rgba(235, 200, 210, 0.4)', center: 'rgba(180, 130, 150, 0.3)' },
  { main: 'rgba(245, 225, 190, 0.45)', secondary: 'rgba(255, 240, 210, 0.3)', center: 'rgba(210, 180, 130, 0.25)' },
  { main: 'rgba(155, 185, 165, 0.45)', secondary: 'rgba(180, 205, 190, 0.3)', center: 'rgba(100, 130, 110, 0.25)' },
  { main: 'rgba(230, 190, 140, 0.4)', secondary: 'rgba(245, 210, 140, 0.25)', center: 'rgba(180, 140, 100, 0.2)' },
];

const drawArtisticFlower = (x, y, scale, shapeType, colorType) => {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);

  let paletteIndex = colorType % 10;
  if (shapeType === 0) paletteIndex = [0, 1, 2, 3, 6][colorType % 5];
  else if (shapeType === 1) paletteIndex = [2, 3, 0][colorType % 3];
  else if (shapeType === 3) paletteIndex = [2, 7, 3][colorType % 3];
  else if (shapeType === 4) paletteIndex = [4, 5, 2][colorType % 3];
  else if (shapeType === 5) paletteIndex = [0, 6, 9][colorType % 3];

  const palette = themes[paletteIndex];

  if (shapeType === 0) {
    for (let i = 0; i < 14; i++) { const angle = (i / 14) * Math.PI * 2; drawPetal(Math.cos(angle) * 12, Math.sin(angle) * 12, 18, 8, angle + 0.4, palette.main); }
    for (let i = 0; i < 8; i++) { const angle = (i / 8) * Math.PI * 2 + 0.3; drawPetal(Math.cos(angle) * 6, Math.sin(angle) * 6, 12, 6, angle, palette.secondary); }
  } else if (shapeType === 1) {
    for (let i = 0; i < 16; i++) { const angle = (i / 16) * Math.PI * 2; drawPetal(Math.cos(angle) * 16, Math.sin(angle) * 16, 24, 4, angle, palette.main); }
  } else if (shapeType === 2) {
    for (let i = 0; i < 7; i++) { const angle = (i / 7) * Math.PI * 1.2 - 0.5; drawPetal(Math.cos(angle) * 14, Math.sin(angle) * 14, 20, 10, angle, palette.main); }
  } else if (shapeType === 3) {
    for (let i = 0; i < 5; i++) { const angle = (i / 5) * Math.PI * 2; drawPetal(Math.cos(angle) * 10, Math.sin(angle) * 10, 14, 4, angle, palette.main); }
  } else if (shapeType === 4) {
    for (let i = 0; i < 6; i++) { const xO = (i % 3 - 1) * 10; const yO = (Math.floor(i / 3) - 1) * 10; ctx.beginPath(); ctx.arc(xO, yO, 6, 0, Math.PI * 2); ctx.fillStyle = palette.main; ctx.fill(); }
  } else {
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.bezierCurveTo(-15, -15, -25, 10, 0, 25); ctx.bezierCurveTo(25, 10, 15, -15, 0, 0); ctx.fillStyle = palette.main; ctx.fill(); ctx.strokeStyle = palette.center; ctx.lineWidth = 1; ctx.stroke();
  }

  if (shapeType !== 5 && shapeType !== 4) { ctx.beginPath(); ctx.arc(0, 0, 4, 0, Math.PI * 2); ctx.fillStyle = palette.center; ctx.fill(); }
  ctx.restore();
};

ctx.beginPath();
ctx.strokeStyle = 'rgba(126, 171, 140, 0.15)';
ctx.lineWidth = 4;
archPath(20);
ctx.stroke();

// Use seeded random for reproducibility
let seed = 42;
const seededRandom = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };

const flowerDensity = 100;
for (let i = 0; i <= flowerDensity; i++) {
  const t = i / flowerDensity;
  let fx, fy;
  if (t < 0.25) { const subT = t / 0.25; fx = margin; fy = top + arcR + (viewH - arcR) * (1 - subT); }
  else if (t < 0.75) { const subT = (t - 0.25) / 0.5; const angle = Math.PI + subT * Math.PI; fx = margin + arcR + Math.cos(angle) * arcR; fy = top + arcR + Math.sin(angle) * arcR; }
  else { const subT = (t - 0.75) / 0.25; fx = margin + viewW; fy = top + arcR + (viewH - arcR) * subT; }

  for (let j = 0; j < 3; j++) {
    const jx = (seededRandom() - 0.5) * 90;
    const jy = (seededRandom() - 0.5) * 90;
    const s = 0.4 + seededRandom() * 0.9;
    const colorType = Math.floor(seededRandom() * 10);
    let shapeType;
    const r = seededRandom();
    if (r < 0.25) shapeType = 1;
    else if (r < 0.45) shapeType = 0;
    else shapeType = Math.floor(seededRandom() * 6);
    drawArtisticFlower(fx + jx, fy + jy, s, shapeType, colorType);
  }
}

const accents = [
  { x: margin - 30, y: top + viewH - 100 },
  { x: margin + viewW + 30, y: top + viewH - 100 },
  { x: margin + viewW / 2, y: top - 40 },
  { x: margin + 50, y: top + 150 },
  { x: margin + viewW - 50, y: top + 150 },
];
accents.forEach((p) => {
  for (let i = 0; i < 6; i++) {
    const s = 0.6 + seededRandom() * 0.8;
    const shapeType = Math.floor(seededRandom() * 6);
    const colorType = Math.floor(seededRandom() * 10);
    drawArtisticFlower(p.x + (seededRandom() - 0.5) * 120, p.y + (seededRandom() - 0.5) * 120, s, shapeType, colorType);
  }
});

for (let i = 0; i < 40; i++) {
  const px = w / 2 + (seededRandom() - 0.5) * 1100;
  const py = h - 400 + (seededRandom() - 0.5) * 500;
  drawPetal(px, py, 11, 5, seededRandom() * Math.PI, 'rgba(219, 140, 160, 0.08)');
}

ctx.textAlign = 'center';
ctx.textBaseline = 'middle';
ctx.font = "32px 'Cormorant Italic', serif";
ctx.fillStyle = 'rgba(26, 26, 26, 0.45)';
ctx.fillText('Turut Menyertai Hari Bahagia', w / 2, h - 255);

const fontMain = "110px 'Dayland', cursive";
const fontAmp = "65px 'Dayland', cursive";
ctx.font = fontMain;
const wDani = ctx.measureText('Dani').width;
const wMarini = ctx.measureText('Marini').width;
ctx.font = fontAmp;
const wAmp = ctx.measureText('&').width;

const spacing = 30;
const totalW = wDani + wMarini + wAmp + spacing * 2;
let currentX = (w - totalW) / 2;
const nameY = h - 140;

ctx.textAlign = 'left';
ctx.fillStyle = 'rgba(26, 26, 26, 0.9)';
ctx.font = fontMain;
ctx.fillText('Dani', currentX, nameY);
currentX += wDani + spacing;
ctx.font = fontAmp;
ctx.fillText('&', currentX, nameY + 2);
currentX += wAmp + spacing;
ctx.font = fontMain;
ctx.fillText('Marini', currentX, nameY);

ctx.textAlign = 'center';
ctx.font = "28px 'Cormorant Italic', serif";
ctx.fillStyle = 'rgba(163, 143, 106, 0.7)';
ctx.fillText('Surabaya 29 Agustus 2026', w / 2, h - 40);

for (let i = 0; i < 65; i++) {
  ctx.beginPath();
  ctx.arc(seededRandom() * w, seededRandom() * h, seededRandom() * 1.2, 0, Math.PI * 2);
  ctx.fillStyle = `rgba(196, 164, 106, ${seededRandom() * 0.18})`;
  ctx.fill();
}

const buffer = canvas.toBuffer('image/png');
writeFileSync('public/images/twibbon-overlay.png', buffer);
console.log('Generated public/images/twibbon-overlay.png (' + (buffer.length / 1024).toFixed(1) + ' KB)');
