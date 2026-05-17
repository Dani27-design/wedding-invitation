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
 * Draw an aesthetic QR card on canvas matching the twibbon-style design.
 * Returns a high-res PNG data URL for download.
 */
export async function generateQRCardPNG(
  invitationUrl: string,
  guestName: string,
  coupleName: string,
): Promise<string> {
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

  // --- Rounded rect clip + gradient background ---
  const r = 28 * S;
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

  // Clip to card shape
  ctx.save();
  roundRect(0, 0, W, H, r);
  ctx.clip();

  // Gradient background
  const bgGrad = ctx.createLinearGradient(0, 0, W * 0.3, H);
  bgGrad.addColorStop(0, '#FAF7F2');
  bgGrad.addColorStop(0.4, '#F5F0E8');
  bgGrad.addColorStop(1, '#F0E9DD');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, W, H);

  // Radial warm glow top-right
  const glow1 = ctx.createRadialGradient(W * 0.85, H * 0.05, 0, W * 0.85, H * 0.05, W * 0.5);
  glow1.addColorStop(0, 'rgba(180, 141, 62, 0.07)');
  glow1.addColorStop(1, 'transparent');
  ctx.fillStyle = glow1;
  ctx.fillRect(0, 0, W, H);

  // Radial pink glow bottom-left
  const glow2 = ctx.createRadialGradient(W * 0.1, H * 0.9, 0, W * 0.1, H * 0.9, W * 0.45);
  glow2.addColorStop(0, 'rgba(219, 170, 185, 0.08)');
  glow2.addColorStop(1, 'transparent');
  ctx.fillStyle = glow2;
  ctx.fillRect(0, 0, W, H);

  // --- Soft floral corner accents ---
  const drawPetal = (x: number, y: number, rw: number, rh: number, angle: number, color: string) => {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.ellipse(0, 0, rw, rh, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  };

  const drawFlowerCluster = (cx: number, cy: number, scale: number) => {
    const colors = [
      'rgba(235, 170, 185, 0.35)', 'rgba(255, 200, 180, 0.35)',
      'rgba(255, 253, 240, 0.45)', 'rgba(250, 240, 185, 0.35)',
      'rgba(220, 180, 190, 0.4)', 'rgba(245, 225, 190, 0.3)',
    ];
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2 + (cx * 0.01);
      const d = 10 * scale;
      const pw = (12 + Math.sin(i * 1.3) * 4) * scale;
      const ph = (5 + Math.cos(i * 0.7) * 2) * scale;
      drawPetal(cx + Math.cos(angle) * d, cy + Math.sin(angle) * d, pw, ph, angle + 0.3, colors[i % colors.length]);
    }
    ctx.beginPath();
    ctx.arc(cx, cy, 3 * scale, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(200, 160, 100, 0.2)';
    ctx.fill();
  };

  // Corner flower clusters
  const flowerS = S * 0.8;
  drawFlowerCluster(PAD * 0.6, PAD * 0.6, flowerS * 1.2);
  drawFlowerCluster(W - PAD * 0.6, PAD * 0.6, flowerS);
  drawFlowerCluster(PAD * 0.8, H - PAD * 0.8, flowerS);
  drawFlowerCluster(W - PAD * 0.8, H - PAD * 0.8, flowerS * 1.1);

  // Scattered petals
  for (let i = 0; i < 12; i++) {
    const px = PAD * 0.5 + Math.random() * (W - PAD);
    const py = Math.random() < 0.5 ? Math.random() * PAD * 2 : H - Math.random() * PAD * 2;
    drawPetal(px, py, 6 * S, 3 * S, Math.random() * Math.PI, 'rgba(219, 140, 160, 0.06)');
  }

  // Gold dust particles
  for (let i = 0; i < 30; i++) {
    ctx.beginPath();
    ctx.arc(Math.random() * W, Math.random() * H, Math.random() * 1.2 * S, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(196, 164, 106, ${Math.random() * 0.15})`;
    ctx.fill();
  }

  ctx.restore(); // unclip

  // --- Card border ---
  roundRect(0, 0, W, H, r);
  ctx.strokeStyle = 'rgba(180, 141, 62, 0.2)';
  ctx.lineWidth = 2 * S;
  ctx.stroke();

  // Inner decorative border
  const inset = 7 * S;
  roundRect(inset, inset, W - inset * 2, H - inset * 2, r - inset);
  ctx.strokeStyle = 'rgba(180, 141, 62, 0.1)';
  ctx.lineWidth = 0.5 * S;
  ctx.stroke();

  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  // --- Heart ornament helper ---
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

  // --- Content ---
  let curY = PAD + 4 * S;

  // Top ornament
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

  // QR box shadow
  ctx.save();
  ctx.shadowColor = 'rgba(180, 141, 62, 0.08)';
  ctx.shadowBlur = 12 * S;
  ctx.shadowOffsetY = 2 * S;
  roundRect(qrBoxX, qrBoxY, qrBoxW, qrBoxH, qrR);
  ctx.fillStyle = 'rgba(255, 255, 255, 0.92)';
  ctx.fill();
  ctx.restore();

  // QR box border
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
    // Small dot at end
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

  // Bottom ornament — star diamond shape
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

  // Footer text
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
