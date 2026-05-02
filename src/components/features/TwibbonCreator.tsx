import { useState, useRef, useEffect, useCallback, ChangeEvent, MouseEvent, TouchEvent } from 'react';
import { motion } from 'motion/react';
import { Camera, RefreshCw } from 'lucide-react';
import { drawOverlay } from '../../utils/twibbonOverlay';

const CANVAS_W = 1080;
const CANVAS_H = 1920;
const FRAME_MARGIN = 100;
const FRAME_TOP = 140;
const FRAME_BOTTOM = 280;

export function TwibbonCreator() {
  const [image, setImage] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);

  const transformRef = useRef({ x: 0, y: 0, zoom: 1 });
  const wrapperRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const imgElementRef = useRef<HTMLImageElement>(null);
  const overlayCanvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const hasDrawn = useRef(false);

  const isDragging = useRef(false);
  const lastPos = useRef({ x: 0, y: 0 });
  const lastTouchDistance = useRef<number | null>(null);

  const updateImageTransform = useCallback(() => {
    if (!imgElementRef.current) return;
    const { x, y, zoom } = transformRef.current;
    imgElementRef.current.style.transform = `translate3d(${x}px, ${y}px, 0) scale(${zoom})`;
  }, []);

  useEffect(() => {
    const el = wrapperRef.current;
    if (!el || hasDrawn.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasDrawn.current) {
          hasDrawn.current = true;
          const canvas = overlayCanvasRef.current;
          if (canvas) {
            canvas.width = CANVAS_W;
            canvas.height = CANVAS_H;
            const ctx = canvas.getContext('2d');
            if (ctx) drawOverlay(ctx, CANVAS_W, CANVAS_H);
          }
          setIsReady(true);
          observer.disconnect();
        }
      },
      { rootMargin: '200px' }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setImage(event.target?.result as string);
        transformRef.current = { x: 0, y: 0, zoom: 1 };
        setTimeout(updateImageTransform, 0);
      };
      reader.readAsDataURL(file);
    }
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

  const handleCanvasClick = (e: MouseEvent) => {
    if (image) return;
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = ((e.clientX - rect.left) / rect.width) * CANVAS_W;
    const y = ((e.clientY - rect.top) / rect.height) * CANVAS_H;
    const vH = CANVAS_H - FRAME_TOP - FRAME_BOTTOM;
    if (x >= FRAME_MARGIN + 40 && x <= CANVAS_W - FRAME_MARGIN - 40 && y >= FRAME_TOP + 40 && y <= FRAME_TOP + vH - 40) {
      fileInputRef.current?.click();
    }
  };

  const handleDownload = () => {
    if (!overlayCanvasRef.current || !image) return;
    const canvas = document.createElement('canvas');
    canvas.width = CANVAS_W;
    canvas.height = CANVAS_H;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      ctx.fillStyle = '#F2EEE9';
      ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

      const { x, y, zoom } = transformRef.current;
      const scale = Math.max(CANVAS_W / img.width, CANVAS_H / img.height) * zoom;
      const dw = img.width * scale;
      const dh = img.height * scale;

      ctx.save();
      const previewEl = containerRef.current;
      if (previewEl) {
        ctx.translate(x * (CANVAS_W / previewEl.clientWidth), y * (CANVAS_W / previewEl.clientWidth));
      }
      ctx.drawImage(img, (CANVAS_W - dw) / 2, (CANVAS_H - dh) / 2, dw, dh);
      ctx.restore();

      ctx.drawImage(overlayCanvasRef.current!, 0, 0);

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
        <h3 className="font-serif text-xl italic text-ink mb-1">Rayakan Momen Ini</h3>
        <p className="text-[9px] uppercase tracking-[0.4em] text-gold font-black opacity-60">Signature Twibbon</p>
      </div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative h-[55vh] w-auto max-w-[82%] md:max-w-[380px] lg:max-w-[420px] aspect-[9/16] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.15)] border border-ink/10 bg-[#F2EEE9] group/result"
        >
          <div
            ref={containerRef}
            onClick={handleCanvasClick}
            className={`absolute inset-0 select-none overflow-hidden ${image ? 'cursor-move touch-none' : 'cursor-pointer'}`}
            onMouseDown={(e: any) => handleStart(e)}
            onMouseMove={(e: any) => handleMove(e)}
            onMouseUp={handleEnd}
            onMouseLeave={handleEnd}
            onTouchStart={(e: any) => handleStart(e)}
            onTouchMove={(e: any) => handleMove(e)}
            onTouchEnd={handleEnd}
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

            <canvas ref={overlayCanvasRef} className="absolute inset-0 z-10 w-full h-full pointer-events-none" />

            {image && (
              <div className="absolute inset-x-0 bottom-32 flex justify-center pointer-events-none">
                <motion.span
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 0.4, y: 0 }}
                  className="bg-ink/10 backdrop-blur-md text-ink text-[7px] px-3 py-1 rounded-full uppercase tracking-widest font-black"
                >
                  Seret • Cubit untuk Atur
                </motion.span>
              </div>
            )}
          </div>
        </motion.div>

      <div className="flex flex-col items-center h-fit w-full max-w-[82%] md:max-w-[380px] lg:max-w-[420px] shrink-0">
        {image && (
          <motion.button
            onClick={() => setImage(null)}
            className="mb-4 flex items-center gap-2 text-[10px] uppercase font-black text-ink/40 hover:text-ink transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Ganti Foto
          </motion.button>
        )}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleDownload}
          disabled={!isReady || !image}
          className="w-full py-2 bg-ink text-gold rounded-full font-black uppercase text-[10px] tracking-[0.4em] shadow-xl disabled:opacity-50 disabled:pointer-events-none transition-all border border-gold/10"
        >
          Bagikan Momen
        </motion.button>
      </div>

      <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
    </div>
  );
}
