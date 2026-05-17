export async function generateQRDataURL(text: string): Promise<string> {
  try {
    const QRCode = await import('qrcode');
    return await QRCode.toDataURL(text, {
      width: 280,
      margin: 2,
      color: { dark: '#1A1A1A', light: '#FFFFFF' },
      errorCorrectionLevel: 'M',
    });
  } catch {
    return '';
  }
}

/**
 * Draw an aesthetic QR card on canvas with twibbon-style floral ornaments.
 * Returns a high-res PNG data URL for download.
 */
export async function generateQRCardPNG(
  invitationUrl: string,
  guestName: string,
  coupleName: string,
): Promise<string> {
  const { drawFlowerCluster, drawScatteredPetals, drawGoldDust } = await import('./floralDraw');

  const qrDataUrl = await generateQRDataURL(invitationUrl);
  if (!qrDataUrl) return '';

  const S = 2;
  const W = 300 * S;
  const H = 430 * S;
  const QR = 180 * S;
  const PAD = 28 * S;

  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  const gold = '#B48D3E';
  const ink = '#1A1A1A';

  // --- Rounded rect helper ---
  const roundRect = (x: number, y: number, w: number, h: number, radius: number) => {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + w - radius, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + radius);
    ctx.lineTo(x + w, y + h - radius);
    ctx.quadraticCurveTo(x + w, y + h, x + w - radius, y + h);
    ctx.lineTo(x + radius, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
  };

  const r = 28 * S;

  // --- Background (clipped to rounded rect) ---
  ctx.save();
  roundRect(0, 0, W, H, r);
  ctx.clip();

  const bgGrad = ctx.createLinearGradient(0, 0, W * 0.3, H);
  bgGrad.addColorStop(0, '#FAF7F2');
  bgGrad.addColorStop(0.4, '#F5F0E8');
  bgGrad.addColorStop(1, '#F0E9DD');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, W, H);

  // Radial glows
  const glow1 = ctx.createRadialGradient(W * 0.85, H * 0.05, 0, W * 0.85, H * 0.05, W * 0.5);
  glow1.addColorStop(0, 'rgba(180, 141, 62, 0.07)');
  glow1.addColorStop(1, 'transparent');
  ctx.fillStyle = glow1;
  ctx.fillRect(0, 0, W, H);

  const glow2 = ctx.createRadialGradient(W * 0.1, H * 0.9, 0, W * 0.1, H * 0.9, W * 0.45);
  glow2.addColorStop(0, 'rgba(219, 170, 185, 0.08)');
  glow2.addColorStop(1, 'transparent');
  ctx.fillStyle = glow2;
  ctx.fillRect(0, 0, W, H);

  // --- Floral corner clusters (twibbon-style artistic flowers) ---
  const fs = S * 0.7;
  drawFlowerCluster(ctx, PAD * 0.5, PAD * 0.5, 4, 50 * fs, 0.3 * fs, 0.9 * fs);
  drawFlowerCluster(ctx, W - PAD * 0.5, PAD * 0.5, 3, 45 * fs, 0.25 * fs, 0.8 * fs);
  drawFlowerCluster(ctx, PAD * 0.6, H - PAD * 0.6, 3, 45 * fs, 0.25 * fs, 0.8 * fs);
  drawFlowerCluster(ctx, W - PAD * 0.6, H - PAD * 0.6, 4, 50 * fs, 0.3 * fs, 0.9 * fs);

  // Scattered petals along edges
  drawScatteredPetals(ctx, 8, W / 2, PAD * 0.4, W * 0.7, PAD, 'rgba(219, 140, 160, 0.06)');
  drawScatteredPetals(ctx, 8, W / 2, H - PAD * 0.4, W * 0.7, PAD, 'rgba(219, 140, 160, 0.06)');

  // Gold dust
  drawGoldDust(ctx, 30, W, H, 1.2 * S, 0.15);

  ctx.restore(); // unclip

  // --- Borders ---
  roundRect(0, 0, W, H, r);
  ctx.strokeStyle = 'rgba(180, 141, 62, 0.2)';
  ctx.lineWidth = 2 * S;
  ctx.stroke();

  const inset = 7 * S;
  roundRect(inset, inset, W - inset * 2, H - inset * 2, r - inset);
  ctx.strokeStyle = 'rgba(180, 141, 62, 0.1)';
  ctx.lineWidth = 0.5 * S;
  ctx.stroke();

  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  // --- Heart ornament ---
  const drawHeart = (cx: number, cy: number, size: number) => {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.scale(size, size);
    ctx.beginPath();
    ctx.moveTo(0, 2);
    ctx.bezierCurveTo(-4, -2, -7, 1, 0, 7);
    ctx.bezierCurveTo(7, 1, 4, -2, 0, 2);
    ctx.fillStyle = 'rgba(180, 141, 62, 0.22)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(180, 141, 62, 0.3)';
    ctx.lineWidth = 0.3;
    ctx.stroke();
    ctx.restore();
  };

  const drawDivider = (y: number, lineW: number) => {
    ctx.strokeStyle = 'rgba(180, 141, 62, 0.25)';
    ctx.lineWidth = 0.5 * S;
    ctx.beginPath();
    ctx.moveTo(W / 2 - lineW - 8 * S, y);
    ctx.lineTo(W / 2 - 8 * S, y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(W / 2 + 8 * S, y);
    ctx.lineTo(W / 2 + lineW + 8 * S, y);
    ctx.stroke();
    drawHeart(W / 2, y - 2 * S, S * 1.1);
  };

  // --- Content layout ---
  let curY = PAD + 4 * S;

  drawDivider(curY + 4 * S, 28 * S);
  curY += 16 * S;

  // Couple name
  ctx.font = `${22 * S}px Dayland, cursive`;
  ctx.fillStyle = gold;
  ctx.fillText(coupleName, W / 2, curY + 12 * S);
  curY += 32 * S;

  // QR code container
  const qrPad = 10 * S;
  const qrBoxW = QR + qrPad * 2;
  const qrBoxH = QR + qrPad * 2;
  const qrBoxX = (W - qrBoxW) / 2;
  const qrBoxY = curY;
  const qrR = 14 * S;

  // QR box with shadow
  ctx.save();
  ctx.shadowColor = 'rgba(180, 141, 62, 0.08)';
  ctx.shadowBlur = 12 * S;
  ctx.shadowOffsetY = 2 * S;
  roundRect(qrBoxX, qrBoxY, qrBoxW, qrBoxH, qrR);
  ctx.fillStyle = 'rgba(255, 255, 255, 0.92)';
  ctx.fill();
  ctx.restore();

  roundRect(qrBoxX, qrBoxY, qrBoxW, qrBoxH, qrR);
  ctx.strokeStyle = 'rgba(180, 141, 62, 0.1)';
  ctx.lineWidth = 0.5 * S;
  ctx.stroke();

  // Corner accent arcs on QR box
  const drawCornerArc = (x: number, y: number, startAngle: number) => {
    ctx.beginPath();
    ctx.arc(x, y, 6 * S, startAngle, startAngle + Math.PI / 2);
    ctx.strokeStyle = 'rgba(180, 141, 62, 0.18)';
    ctx.lineWidth = 1 * S;
    ctx.stroke();
    const endX = x + Math.cos(startAngle + Math.PI / 2) * 6 * S;
    const endY = y + Math.sin(startAngle + Math.PI / 2) * 6 * S;
    ctx.beginPath();
    ctx.arc(endX, endY, 1 * S, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(180, 141, 62, 0.18)';
    ctx.fill();
  };

  drawCornerArc(qrBoxX - 2 * S, qrBoxY - 2 * S, 0);
  drawCornerArc(qrBoxX + qrBoxW + 2 * S, qrBoxY - 2 * S, Math.PI / 2);
  drawCornerArc(qrBoxX + qrBoxW + 2 * S, qrBoxY + qrBoxH + 2 * S, Math.PI);
  drawCornerArc(qrBoxX - 2 * S, qrBoxY + qrBoxH + 2 * S, Math.PI * 1.5);

  // Draw QR image
  const qrImg = await loadImage(qrDataUrl);
  ctx.drawImage(qrImg, qrBoxX + qrPad, qrBoxY + qrPad, QR, QR);

  curY = qrBoxY + qrBoxH + 16 * S;

  // Guest name
  ctx.font = `italic ${17 * S}px 'Cormorant Garamond', Georgia, serif`;
  ctx.fillStyle = ink;
  const maxNameW = W - PAD * 2;
  const nameLines = wrapText(ctx, guestName, maxNameW);
  for (const line of nameLines.slice(0, 2)) {
    ctx.fillText(line, W / 2, curY);
    curY += 22 * S;
  }
  curY += 4 * S;

  // Bottom star ornament
  const drawStar = (cx: number, cy: number, size: number) => {
    ctx.beginPath();
    ctx.moveTo(cx, cy - size);
    ctx.lineTo(cx + size * 0.65, cy - size * 0.35);
    ctx.lineTo(cx + size, cy);
    ctx.lineTo(cx + size * 0.65, cy + size * 0.35);
    ctx.lineTo(cx, cy + size);
    ctx.lineTo(cx - size * 0.65, cy + size * 0.35);
    ctx.lineTo(cx - size, cy);
    ctx.lineTo(cx - size * 0.65, cy - size * 0.35);
    ctx.closePath();
    ctx.fillStyle = 'rgba(180, 141, 62, 0.14)';
    ctx.fill();
  };

  ctx.strokeStyle = 'rgba(180, 141, 62, 0.18)';
  ctx.lineWidth = 0.5 * S;
  ctx.beginPath();
  ctx.moveTo(W / 2 - 24 * S, curY);
  ctx.lineTo(W / 2 - 6 * S, curY);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(W / 2 + 6 * S, curY);
  ctx.lineTo(W / 2 + 24 * S, curY);
  ctx.stroke();
  drawStar(W / 2, curY, 3.5 * S);
  curY += 14 * S;

  // Footer
  ctx.font = `bold ${6.5 * S}px sans-serif`;
  ctx.fillStyle = 'rgba(26, 26, 26, 0.28)';
  ctx.letterSpacing = `${1.5 * S}px`;
  ctx.fillText('SCAN UNTUK MEMBUKA', W / 2, curY);
  curY += 10 * S;
  ctx.fillText('UNDANGAN PERNIKAHAN', W / 2, curY);
  ctx.letterSpacing = '0px';

  return canvas.toDataURL('image/png');
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const words = text.split(' ');
  const lines: string[] = [];
  let current = '';
  for (const word of words) {
    const test = current ? `${current} ${word}` : word;
    if (ctx.measureText(test).width > maxWidth && current) {
      lines.push(current);
      current = word;
    } else {
      current = test;
    }
  }
  if (current) lines.push(current);
  return lines;
}

export async function generateQRSVG(text: string): Promise<string> {
  try {
    const QRCode = await import('qrcode');
    return await QRCode.toString(text, {
      type: 'svg',
      width: 280,
      margin: 2,
      color: { dark: '#1A1A1A', light: '#FFFFFF' },
      errorCorrectionLevel: 'M',
    });
  } catch {
    return '';
  }
}
