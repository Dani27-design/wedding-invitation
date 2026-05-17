import { drawPetal, drawArtisticFlower, drawGoldDust } from './floralDraw';

export interface OverlayData {
  groomNickname: string;
  brideNickname: string;
  locationDate: string;
  tagline?: string;
  fonts?: {
    decorative: string;
    script: string;
  };
}

const FRAME_MARGIN = 100;
const FRAME_TOP = 140;
const FRAME_BOTTOM = 280;

export function drawOverlay(ctx: CanvasRenderingContext2D, w: number, h: number, data: OverlayData) {
  ctx.clearRect(0, 0, w, h);

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
  if (typeof ctx.filter !== 'undefined') {
    ctx.filter = 'blur(35px)';
  }
  ctx.fillStyle = 'white';
  archPath(40);
  ctx.fill();
  ctx.restore();
  if (typeof ctx.filter !== 'undefined') ctx.filter = 'none';

  ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
  ctx.lineWidth = 2;
  archPath(45);
  ctx.stroke();

  const sunGrad = ctx.createRadialGradient(w * 0.9, 0, 0, w * 0.9, 0, w * 0.7);
  sunGrad.addColorStop(0, 'rgba(255, 248, 230, 0.12)');
  sunGrad.addColorStop(1, 'transparent');
  ctx.fillStyle = sunGrad;
  ctx.fillRect(0, 0, w, h);

  ctx.beginPath();
  ctx.strokeStyle = 'rgba(126, 171, 140, 0.15)';
  ctx.lineWidth = 4;
  archPath(20);
  ctx.stroke();

  const flowerDensity = 100;
  for (let i = 0; i <= flowerDensity; i++) {
    const t = i / flowerDensity;
    let fx: number, fy: number;

    if (t < 0.25) {
      const subT = t / 0.25;
      fx = margin;
      fy = top + arcR + (viewH - arcR) * (1 - subT);
    } else if (t < 0.75) {
      const subT = (t - 0.25) / 0.5;
      const angle = Math.PI + subT * Math.PI;
      fx = margin + arcR + Math.cos(angle) * arcR;
      fy = top + arcR + Math.sin(angle) * arcR;
    } else {
      const subT = (t - 0.75) / 0.25;
      fx = margin + viewW;
      fy = top + arcR + (viewH - arcR) * subT;
    }

    const clusterSize = 3;
    for (let j = 0; j < clusterSize; j++) {
      const spread = 90;
      const jx = (Math.random() - 0.5) * spread;
      const jy = (Math.random() - 0.5) * spread;
      const s = 0.4 + Math.random() * 0.9;
      const colorType = Math.floor(Math.random() * 10);

      let shapeType;
      const r = Math.random();
      if (r < 0.25) shapeType = 1;
      else if (r < 0.45) shapeType = 0;
      else shapeType = Math.floor(Math.random() * 6);

      drawArtisticFlower(ctx, fx + jx, fy + jy, s, shapeType, colorType);
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
      const s = 0.6 + Math.random() * 0.8;
      const shapeType = Math.floor(Math.random() * 6);
      const colorType = Math.floor(Math.random() * 10);
      drawArtisticFlower(ctx, p.x + (Math.random() - 0.5) * 120, p.y + (Math.random() - 0.5) * 120, s, shapeType, colorType);
    }
  });

  for (let i = 0; i < 40; i++) {
    const px = w / 2 + (Math.random() - 0.5) * 1100;
    const py = h - 400 + (Math.random() - 0.5) * 500;
    drawPetal(ctx, px, py, 11, 5, Math.random() * Math.PI, 'rgba(219, 140, 160, 0.08)');
  }

  const fontDecorative = data.fonts?.decorative ?? 'Playfair Display';
  const fontScript = data.fonts?.script ?? 'Dayland';
  const tagline = data.tagline ?? 'Turut Menyertai Hari Bahagia';

  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  ctx.font = `italic 32px '${fontDecorative}', serif`;
  ctx.fillStyle = 'rgba(26, 26, 26, 0.45)';
  ctx.fillText(tagline, w / 2, h - 255);

  const fontMain = `110px '${fontScript}', cursive`;
  const fontAmp = `65px '${fontScript}', cursive`;
  ctx.font = fontMain;
  const wGroom = ctx.measureText(data.groomNickname).width;
  const wBride = ctx.measureText(data.brideNickname).width;
  ctx.font = fontAmp;
  const wAmp = ctx.measureText('&').width;

  const spacing = 30;
  const totalW = wGroom + wBride + wAmp + spacing * 2;
  let currentX = (w - totalW) / 2;
  const nameY = h - 140;

  ctx.textAlign = 'left';
  ctx.fillStyle = 'rgba(26, 26, 26, 0.9)';
  ctx.font = fontMain;
  ctx.fillText(data.groomNickname, currentX, nameY);
  currentX += wGroom + spacing;

  ctx.font = fontAmp;
  ctx.fillText('&', currentX, nameY + 2);
  currentX += wAmp + spacing;

  ctx.font = fontMain;
  ctx.fillText(data.brideNickname, currentX, nameY);

  ctx.textAlign = 'center';
  ctx.font = `italic 28px '${fontDecorative}', serif`;
  ctx.fillStyle = 'rgba(163, 143, 106, 0.7)';
  ctx.fillText(data.locationDate, w / 2, h - 40);

  drawGoldDust(ctx, 65, w, h, 1.2, 0.18);
}
