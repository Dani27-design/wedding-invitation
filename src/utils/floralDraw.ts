/**
 * Shared floral drawing primitives used by twibbon overlay and QR card.
 * All functions draw onto a provided CanvasRenderingContext2D.
 */

export const FLORAL_PALETTES = [
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

export function drawPetal(
  ctx: CanvasRenderingContext2D,
  x: number, y: number,
  rw: number, rh: number,
  angle: number, color: string,
) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.ellipse(0, 0, rw, rh, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

export function drawArtisticFlower(
  ctx: CanvasRenderingContext2D,
  x: number, y: number,
  scale: number, shapeType: number, colorType: number,
) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);

  let paletteIndex = colorType % 10;
  if (shapeType === 0) paletteIndex = [0, 1, 2, 3, 6][colorType % 5];
  else if (shapeType === 1) paletteIndex = [2, 3, 0][colorType % 3];
  else if (shapeType === 3) paletteIndex = [2, 7, 3][colorType % 3];
  else if (shapeType === 4) paletteIndex = [4, 5, 2][colorType % 3];
  else if (shapeType === 5) paletteIndex = [0, 6, 9][colorType % 3];

  const palette = FLORAL_PALETTES[paletteIndex];

  const petal = (px: number, py: number, rw: number, rh: number, angle: number, color: string) => {
    ctx.save();
    ctx.translate(px, py);
    ctx.rotate(angle);
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.ellipse(0, 0, rw, rh, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  };

  if (shapeType === 0) {
    for (let i = 0; i < 14; i++) {
      const angle = (i / 14) * Math.PI * 2;
      petal(Math.cos(angle) * 12, Math.sin(angle) * 12, 18, 8, angle + 0.4, palette.main);
    }
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2 + 0.3;
      petal(Math.cos(angle) * 6, Math.sin(angle) * 6, 12, 6, angle, palette.secondary);
    }
  } else if (shapeType === 1) {
    for (let i = 0; i < 16; i++) {
      const angle = (i / 16) * Math.PI * 2;
      petal(Math.cos(angle) * 16, Math.sin(angle) * 16, 24, 4, angle, palette.main);
    }
  } else if (shapeType === 2) {
    for (let i = 0; i < 7; i++) {
      const angle = (i / 7) * Math.PI * 1.2 - 0.5;
      petal(Math.cos(angle) * 14, Math.sin(angle) * 14, 20, 10, angle, palette.main);
    }
  } else if (shapeType === 3) {
    for (let i = 0; i < 5; i++) {
      const angle = (i / 5) * Math.PI * 2;
      petal(Math.cos(angle) * 10, Math.sin(angle) * 10, 14, 4, angle, palette.main);
    }
  } else if (shapeType === 4) {
    for (let i = 0; i < 6; i++) {
      const xO = (i % 3 - 1) * 10;
      const yO = (Math.floor(i / 3) - 1) * 10;
      ctx.beginPath();
      ctx.arc(xO, yO, 6, 0, Math.PI * 2);
      ctx.fillStyle = palette.main;
      ctx.fill();
    }
  } else {
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.bezierCurveTo(-15, -15, -25, 10, 0, 25);
    ctx.bezierCurveTo(25, 10, 15, -15, 0, 0);
    ctx.fillStyle = palette.main;
    ctx.fill();
    ctx.strokeStyle = palette.center;
    ctx.lineWidth = 1;
    ctx.stroke();
  }

  if (shapeType !== 5 && shapeType !== 4) {
    ctx.beginPath();
    ctx.arc(0, 0, 4, 0, Math.PI * 2);
    ctx.fillStyle = palette.center;
    ctx.fill();
  }

  ctx.restore();
}

/**
 * Draw a natural-looking flower cluster at a given point.
 * `count` flowers with random shape/color/spread within `spread` radius.
 */
export function drawFlowerCluster(
  ctx: CanvasRenderingContext2D,
  cx: number, cy: number,
  count: number, spread: number,
  scaleMin: number, scaleMax: number,
) {
  for (let j = 0; j < count; j++) {
    const jx = (Math.random() - 0.5) * spread;
    const jy = (Math.random() - 0.5) * spread;
    const s = scaleMin + Math.random() * (scaleMax - scaleMin);
    const colorType = Math.floor(Math.random() * 10);
    const r = Math.random();
    const shapeType = r < 0.25 ? 1 : r < 0.45 ? 0 : Math.floor(Math.random() * 6);
    drawArtisticFlower(ctx, cx + jx, cy + jy, s, shapeType, colorType);
  }
}

/**
 * Draw scattered loose petals across an area.
 */
export function drawScatteredPetals(
  ctx: CanvasRenderingContext2D,
  count: number,
  cx: number, cy: number,
  rangeX: number, rangeY: number,
  color: string,
) {
  for (let i = 0; i < count; i++) {
    const px = cx + (Math.random() - 0.5) * rangeX;
    const py = cy + (Math.random() - 0.5) * rangeY;
    drawPetal(ctx, px, py, 11, 5, Math.random() * Math.PI, color);
  }
}

/**
 * Draw gold dust particles across an area.
 */
export function drawGoldDust(
  ctx: CanvasRenderingContext2D,
  count: number,
  w: number, h: number,
  maxRadius: number,
  maxAlpha: number,
) {
  for (let i = 0; i < count; i++) {
    ctx.beginPath();
    ctx.arc(Math.random() * w, Math.random() * h, Math.random() * maxRadius, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(196, 164, 106, ${Math.random() * maxAlpha})`;
    ctx.fill();
  }
}
