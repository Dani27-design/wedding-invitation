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
 * Draw a full QR card (frame + couple name + QR + guest name) on a canvas
 * and return it as a PNG blob URL for download.
 */
export async function generateQRCardPNG(
  invitationUrl: string,
  guestName: string,
  coupleName: string,
): Promise<string> {
  const qrDataUrl = await generateQRDataURL(invitationUrl);
  if (!qrDataUrl) return '';

  const S = 2; // scale factor for retina
  const W = 300 * S;
  const H = 420 * S;
  const QR = 200 * S;
  const PAD = 30 * S;

  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  // Colors
  const ivory = '#FDFCF8';
  const gold = '#B48D3E';
  const goldLight = 'rgba(180, 141, 62, 0.2)';
  const goldFaint = 'rgba(180, 141, 62, 0.35)';
  const ink = '#1A1A1A';

  // Background with rounded corners
  const r = 24 * S;
  ctx.beginPath();
  ctx.moveTo(r, 0);
  ctx.lineTo(W - r, 0);
  ctx.quadraticCurveTo(W, 0, W, r);
  ctx.lineTo(W, H - r);
  ctx.quadraticCurveTo(W, H, W - r, H);
  ctx.lineTo(r, H);
  ctx.quadraticCurveTo(0, H, 0, H - r);
  ctx.lineTo(0, r);
  ctx.quadraticCurveTo(0, 0, r, 0);
  ctx.closePath();
  ctx.fillStyle = ivory;
  ctx.fill();

  // Border
  ctx.strokeStyle = goldLight;
  ctx.lineWidth = 2 * S;
  ctx.stroke();

  // Inner decorative border
  const inset = 8 * S;
  const ri = 18 * S;
  ctx.beginPath();
  ctx.moveTo(inset + ri, inset);
  ctx.lineTo(W - inset - ri, inset);
  ctx.quadraticCurveTo(W - inset, inset, W - inset, inset + ri);
  ctx.lineTo(W - inset, H - inset - ri);
  ctx.quadraticCurveTo(W - inset, H - inset, W - inset - ri, H - inset);
  ctx.lineTo(inset + ri, H - inset);
  ctx.quadraticCurveTo(inset, H - inset, inset, H - inset - ri);
  ctx.lineTo(inset, inset + ri);
  ctx.quadraticCurveTo(inset, inset, inset + ri, inset);
  ctx.closePath();
  ctx.strokeStyle = 'rgba(180, 141, 62, 0.1)';
  ctx.lineWidth = 1 * S;
  ctx.stroke();

  ctx.textAlign = 'center';

  // Heart divider helper
  const drawHeart = (cx: number, cy: number, size: number) => {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.scale(size, size);
    ctx.beginPath();
    ctx.moveTo(0, 3);
    ctx.bezierCurveTo(-5, -2, -9, 2, 0, 9);
    ctx.bezierCurveTo(9, 2, 5, -2, 0, 3);
    ctx.fillStyle = goldFaint;
    ctx.fill();
    ctx.restore();
  };

  const drawDivider = (y: number) => {
    const lineW = 30 * S;
    ctx.strokeStyle = 'rgba(180, 141, 62, 0.25)';
    ctx.lineWidth = 1 * S;
    ctx.beginPath();
    ctx.moveTo(W / 2 - lineW - 8 * S, y);
    ctx.lineTo(W / 2 - 8 * S, y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(W / 2 + 8 * S, y);
    ctx.lineTo(W / 2 + lineW + 8 * S, y);
    ctx.stroke();
    drawHeart(W / 2, y - 3 * S, S * 1.2);
  };

  // Top divider
  let curY = PAD;
  drawDivider(curY + 6 * S);
  curY += 18 * S;

  // Couple name
  ctx.font = `${22 * S}px Dayland, cursive`;
  ctx.fillStyle = gold;
  ctx.fillText(coupleName, W / 2, curY + 14 * S);
  curY += 34 * S;

  // QR code
  const qrBoxPad = 12 * S;
  const qrBoxW = QR + qrBoxPad * 2;
  const qrBoxH = QR + qrBoxPad * 2;
  const qrBoxX = (W - qrBoxW) / 2;
  const qrBoxY = curY;

  // QR white background
  const qrR = 12 * S;
  ctx.beginPath();
  ctx.moveTo(qrBoxX + qrR, qrBoxY);
  ctx.lineTo(qrBoxX + qrBoxW - qrR, qrBoxY);
  ctx.quadraticCurveTo(qrBoxX + qrBoxW, qrBoxY, qrBoxX + qrBoxW, qrBoxY + qrR);
  ctx.lineTo(qrBoxX + qrBoxW, qrBoxY + qrBoxH - qrR);
  ctx.quadraticCurveTo(qrBoxX + qrBoxW, qrBoxY + qrBoxH, qrBoxX + qrBoxW - qrR, qrBoxY + qrBoxH);
  ctx.lineTo(qrBoxX + qrR, qrBoxY + qrBoxH);
  ctx.quadraticCurveTo(qrBoxX, qrBoxY + qrBoxH, qrBoxX, qrBoxY + qrBoxH - qrR);
  ctx.lineTo(qrBoxX, qrBoxY + qrR);
  ctx.quadraticCurveTo(qrBoxX, qrBoxY, qrBoxX + qrR, qrBoxY);
  ctx.closePath();
  ctx.fillStyle = '#FFFFFF';
  ctx.fill();
  ctx.strokeStyle = 'rgba(180, 141, 62, 0.1)';
  ctx.lineWidth = 1 * S;
  ctx.stroke();

  // Draw QR image
  const qrImg = await loadImage(qrDataUrl);
  ctx.drawImage(qrImg, qrBoxX + qrBoxPad, qrBoxY + qrBoxPad, QR, QR);

  curY = qrBoxY + qrBoxH + 16 * S;

  // Guest name
  ctx.font = `italic ${18 * S}px 'Cormorant Garamond', Georgia, serif`;
  ctx.fillStyle = ink;
  const maxNameW = W - PAD * 2;
  const nameLines = wrapText(ctx, guestName, maxNameW);
  for (const line of nameLines.slice(0, 2)) {
    ctx.fillText(line, W / 2, curY);
    curY += 22 * S;
  }
  curY += 2 * S;

  // Bottom divider
  drawDivider(curY);
  curY += 16 * S;

  // Footer text
  ctx.font = `bold ${7 * S}px sans-serif`;
  ctx.fillStyle = 'rgba(26, 26, 26, 0.35)';
  ctx.letterSpacing = `${2 * S}px`;
  ctx.fillText('SCAN UNTUK MEMBUKA', W / 2, curY);
  curY += 11 * S;
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
