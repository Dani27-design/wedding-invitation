import { useState, useRef, useEffect, useCallback, ChangeEvent, MouseEvent, TouchEvent } from 'react';
import { motion } from 'motion/react';
import { Camera, RefreshCw } from 'lucide-react';

const CANVAS_W = 1080;
const CANVAS_H = 1920;
const OVERLAY_SRC = '/images/twibbon-overlay.png';

export function TwibbonCreator() {
  const [image, setImage] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);

  const transformRef = useRef({ x: 0, y: 0, zoom: 1 });
  const wrapperRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const imgElementRef = useRef<HTMLImageElement>(null);
  const overlayImgRef = useRef<HTMLImageElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isDragging = useRef(false);
  const lastPos = useRef({ x: 0, y: 0 });
  const lastTouchDistance = useRef<number | null>(null);

  const updateImageTransform = useCallback(() => {
    if (!imgElementRef.current) return;
    const { x, y, zoom } = transformRef.current;
    imgElementRef.current.style.transform = `translate3d(${x}px, ${y}px, 0) scale(${zoom})`;
  }, []);

  const clearImage = useCallback(() => {
    if (image) URL.revokeObjectURL(image);
    setImage(null);
  }, [image]);

  useEffect(() => {
    return () => {
      if (image) URL.revokeObjectURL(image);
    };
  }, [image]);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith('image/')) return;
    if (image) URL.revokeObjectURL(image);
    const blobUrl = URL.createObjectURL(file);
    setImage(blobUrl);
    transformRef.current = { x: 0, y: 0, zoom: 1 };
    setTimeout(updateImageTransform, 0);
  };

  const handleStart = (e: MouseEvent | TouchEvent) => {
    if (!image) return;
    if (e.cancelable) e.preventDefault();
    isDragging.current = true;
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    if ('touches' in e && e.touches.length === 2) {
      lastTouchDistance.current = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY);
    } else {
      lastPos.current = { x: clientX, y: clientY };
    }
  };

  const handleMove = (e: MouseEvent | TouchEvent) => {
    if (!isDragging.current || !image) return;
    if (e.cancelable) e.preventDefault();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    if ('touches' in e && e.touches.length === 2) {
      const dist = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY);
      if (lastTouchDistance.current) {
        transformRef.current.zoom = Math.min(5, Math.max(0.1, transformRef.current.zoom * (dist / lastTouchDistance.current)));
      }
      lastTouchDistance.current = dist;
    } else {
      transformRef.current.x += clientX - lastPos.current.x;
      transformRef.current.y += clientY - lastPos.current.y;
      lastPos.current = { x: clientX, y: clientY };
    }
    requestAnimationFrame(updateImageTransform);
  };

  const handleEnd = () => {
    isDragging.current = false;
    lastTouchDistance.current = null;
  };

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const onTouchStart = (e: globalThis.TouchEvent) => handleStart(e as unknown as TouchEvent);
    const onTouchMove = (e: globalThis.TouchEvent) => handleMove(e as unknown as TouchEvent);
    const onTouchEnd = () => handleEnd();

    el.addEventListener('touchstart', onTouchStart, { passive: false });
    el.addEventListener('touchmove', onTouchMove, { passive: false });
    el.addEventListener('touchend', onTouchEnd);

    return () => {
      el.removeEventListener('touchstart', onTouchStart);
      el.removeEventListener('touchmove', onTouchMove);
      el.removeEventListener('touchend', onTouchEnd);
    };
  });

  const handleCanvasClick = () => {
    if (image) return;
    fileInputRef.current?.click();
  };

  const handleDownload = () => {
    if (!overlayImgRef.current || !image) return;
    const canvas = document.createElement('canvas');
    canvas.width = CANVAS_W;
    canvas.height = CANVAS_H;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.onload = () => {
      ctx.fillStyle = '#F2EEE9';
      ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

      const { x, y, zoom } = transformRef.current;
      const scale = Math.max(CANVAS_W / img.width, CANVAS_H / img.height) * zoom;
      const dw = img.width * scale;
      const dh = img.height * scale;

      ctx.save();
      const previewEl = containerRef.current;
      if (previewEl && previewEl.clientWidth > 0) {
        const scaleX = CANVAS_W / previewEl.clientWidth;
        const scaleY = CANVAS_H / previewEl.clientHeight;
        ctx.translate(x * scaleX, y * scaleY);
      }
      ctx.drawImage(img, (CANVAS_W - dw) / 2, (CANVAS_H - dh) / 2, dw, dh);
      ctx.restore();

      ctx.drawImage(overlayImgRef.current!, 0, 0, CANVAS_W, CANVAS_H);

      const link = document.createElement('a');
      link.download = 'Memori-Dani-Marini.png';
      link.href = canvas.toDataURL('image/png', 1.0);
      link.click();
    };
    img.src = image;
  };

  return (
    <div ref={wrapperRef} className="flex flex-col h-fit w-full items-center justify-start gap-[3vh] px-4">
      <div className="text-center shrink-0">
        <p className="text-xs uppercase tracking-[0.4em] text-gold font-black mb-2">Twibbon Pernikahan Kami</p>
        <p className="font-serif italic text-[13px] leading-relaxed text-ink/70 max-w-[300px] mx-auto">rayakan momen bahagia ini bersama kami.</p>
      </div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative h-[55vh] w-auto max-w-[82%] md:max-w-[380px] lg:max-w-[420px] aspect-[9/16] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.15)] border border-gold/10 bg-[#F2EEE9] group/result"
        >
          <div
            ref={containerRef}
            onClick={handleCanvasClick}
            className={`absolute inset-0 select-none overflow-hidden ${image ? 'cursor-move touch-none' : 'cursor-pointer'}`}
            onMouseDown={(e: any) => handleStart(e)}
            onMouseMove={(e: any) => handleMove(e)}
            onMouseUp={handleEnd}
            onMouseLeave={handleEnd}
          >
            <div className="absolute inset-0 z-0 bg-[#8E8A85] flex items-center justify-center">
              {image ? (
                <motion.img
                  ref={imgElementRef}
                  initial={{ opacity: 0, scale: 1.1 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                  src={image}
                  className="max-w-none w-full h-full object-cover pointer-events-none"
                  style={{ transform: `scale(${transformRef.current.zoom}) translate3d(${transformRef.current.x}px, ${transformRef.current.y}px, 0)` }}
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <motion.div
                    animate={{ x: ['-150%', '150%'] }}
                    transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                    className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent"
                  />
                  <Camera className="w-10 h-10 text-white/40 stroke-[1]" />
                </div>
              )}
            </div>

            <img ref={overlayImgRef} src={OVERLAY_SRC} onLoad={() => setIsReady(true)} className="absolute inset-0 z-10 w-full h-full pointer-events-none" alt="" />
          </div>
        </motion.div>

      {image && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center h-fit w-full max-w-[82%] md:max-w-[380px] lg:max-w-[420px] shrink-0">
          <motion.button
            onClick={clearImage}
            className="mb-4 flex items-center gap-2 text-xs uppercase font-black text-ink/70 hover:text-ink transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Ganti Foto
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleDownload}
            disabled={!isReady}
            className="w-full py-2 bg-gold text-ivory rounded-full font-black uppercase text-xs tracking-[0.4em] shadow-xl disabled:opacity-50 disabled:pointer-events-none transition-all"
          >
            Bagikan Momen
          </motion.button>
        </motion.div>
      )}

      <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
    </div>
  );
}
