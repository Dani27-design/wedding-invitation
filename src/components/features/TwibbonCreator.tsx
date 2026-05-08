import { useState, useRef, useEffect, useCallback, useMemo, ChangeEvent, MouseEvent, TouchEvent } from 'react';
import { motion } from 'motion/react';
import { Camera, RefreshCw } from 'lucide-react';
import { useWeddingContext } from '../../context/WeddingContext';
import { deriveTwibbonFilename } from '../../utils/weddingDerived';

const CANVAS_W = 1080;
const CANVAS_H = 1920;
const MAX_PREVIEW_DIM = 2000;

export function TwibbonCreator() {
  const wedding = useWeddingContext();
  const [image, setImage] = useState<string | null>(null);
  const [transform, setTransform] = useState({ x: 0, y: 0, zoom: 1 });
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [shareError, setShareError] = useState(false);

  const wrapperRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const imgElementRef = useRef<HTMLImageElement>(null);
  const overlayImgRef = useRef<HTMLImageElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isDragging = useRef(false);
  const lastPos = useRef({ x: 0, y: 0 });
  const lastTouchDistance = useRef<number | null>(null);
  const shareErrorTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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
    setIsLoading(true);

    const originalUrl = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const { width, height } = img;
      const maxDim = Math.max(width, height);

      if (maxDim <= MAX_PREVIEW_DIM) {
        if (image) URL.revokeObjectURL(image);
        setImage(originalUrl);
        setIsLoading(false);
      } else {
        const scale = MAX_PREVIEW_DIM / maxDim;
        const canvas = document.createElement('canvas');
        canvas.width = Math.round(width * scale);
        canvas.height = Math.round(height * scale);
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          canvas.toBlob((blob) => {
            URL.revokeObjectURL(originalUrl);
            if (blob) {
              if (image) URL.revokeObjectURL(image);
              setImage(URL.createObjectURL(blob));
            }
            setIsLoading(false);
          }, 'image/jpeg', 0.85);
        }
      }

      setTransform({ x: 0, y: 0, zoom: 1 });
    };
    img.src = originalUrl;
  };

  const handleStart = (e: MouseEvent | TouchEvent) => {
    if (!image) return;
    if (e.cancelable) e.preventDefault();
    isDragging.current = true;
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    if ('touches' in e && e.touches.length === 2) {
      lastTouchDistance.current = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY);
      lastPos.current = { x: clientX, y: clientY };
    } else {
      lastPos.current = { x: clientX, y: clientY };
    }
  };

  const handleMove = (e: MouseEvent | TouchEvent) => {
    if (!isDragging.current || !image) return;
    if (e.cancelable) e.preventDefault();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    setTransform(prev => {
      let { x, y, zoom } = prev;
      if ('touches' in e && e.touches.length === 2) {
        const dist = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY);
        if (lastTouchDistance.current) {
          zoom = Math.min(5, Math.max(0.1, zoom * (dist / lastTouchDistance.current)));
        }
        lastTouchDistance.current = dist;
        lastPos.current = { x: clientX, y: clientY };
      } else {
        x += clientX - lastPos.current.x;
        y += clientY - lastPos.current.y;
        lastPos.current = { x: clientX, y: clientY };
      }
      return { x, y, zoom };
    });
  };

  const handleEnd = () => {
    isDragging.current = false;
    lastTouchDistance.current = null;
  };

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const onTouchStart = (e: TouchEvent) => handleStart(e);
    const onTouchMove = (e: TouchEvent) => handleMove(e);
    const onTouchEnd = () => handleEnd();

    el.addEventListener('touchstart', onTouchStart, { passive: false });
    el.addEventListener('touchmove', onTouchMove, { passive: false });
    el.addEventListener('touchend', onTouchEnd);

    return () => {
      el.removeEventListener('touchstart', onTouchStart);
      el.removeEventListener('touchmove', onTouchMove);
      el.removeEventListener('touchend', onTouchEnd);
    };
  }, [image]);

  useEffect(() => {
    return () => { if (shareErrorTimerRef.current) clearTimeout(shareErrorTimerRef.current); };
  }, []);

  const handleCanvasClick = () => {
    if (image) return;
    fileInputRef.current?.click();
  };

  const generateTwibbonBlob = (): Promise<Blob | null> => {
    return new Promise((resolve) => {
      if (!overlayImgRef.current || !image) return resolve(null);
      const canvas = document.createElement('canvas');
      canvas.width = CANVAS_W;
      canvas.height = CANVAS_H;
      const ctx = canvas.getContext('2d');
      if (!ctx) return resolve(null);

      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onerror = (error) => {
        console.error('Error loading image.', error);
        resolve(null);
      };
      img.onload = () => {
        try {
          ctx.fillStyle = '#F2EEE9';
          ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

          // 1. Offscreen Downscaling: 
          // Create a temporary canvas for the user photo to handle downscaling before compositing
          const tempCanvas = document.createElement('canvas');
          tempCanvas.width = CANVAS_W;
          tempCanvas.height = CANVAS_H;
          const tempCtx = tempCanvas.getContext('2d');
          
          if (tempCtx) {
            const { x, y, zoom } = transform;
            const scale = Math.max(CANVAS_W / img.width, CANVAS_H / img.height) * zoom;
            const dw = img.width * scale;
            const dh = img.height * scale;
            
            const previewEl = containerRef.current;
            let tx = 0, ty = 0;
            if (previewEl && previewEl.clientWidth > 0) {
              tx = x * (CANVAS_W / previewEl.clientWidth);
              ty = y * (CANVAS_H / previewEl.clientHeight);
            }
            
            tempCtx.drawImage(img, (CANVAS_W - dw) / 2 + tx, (CANVAS_H - dh) / 2 + ty, dw, dh);
          }
          ctx.drawImage(tempCanvas, 0, 0);

          // Direct Overlay Loading
          const overlayImg = new Image();
          overlayImg.crossOrigin = 'anonymous';
          
          overlayImg.onload = () => {
            ctx.drawImage(overlayImg, 0, 0, CANVAS_W, CANVAS_H);
            canvas.toBlob((blob) => resolve(blob), 'image/png', 0.9);
          };

          overlayImg.onerror = (err) => {
            console.error('Twibbon overlay failed to load directly:', err);
            resolve(null);
          };
          
          overlayImg.src = wedding?.twibbonOverlay ?? '';
        } catch (error) {
          console.error('Canvas export failed.', error);
          resolve(null);
        }
      };
      img.src = image;
    });
  };

  const handleShare = async () => {
    setIsGenerating(true);
    setShareError(false);

    // Yield control to UI thread to allow loading spinner to render
    await new Promise(resolve => setTimeout(resolve, 100));

    try {
      const blob = await generateTwibbonBlob();
      if (!blob) throw new Error('Generation failed');

      const filename = deriveTwibbonFilename(wedding?.groomNickname ?? '', wedding?.brideNickname ?? '');
      const file = new File([blob], filename, { type: 'image/png' });

      if (navigator.share && navigator.canShare?.({ files: [file] })) {
        try {
          await navigator.share({ files: [file] });
        } catch (err) {
          console.error('Share failed', err);
          // Fallback to download on share cancel/fail
          triggerDownload(blob, filename);
        }
      } else {
        triggerDownload(blob, filename);
      }
    } catch (err) {
      console.error('Failed to generate twibbon image.', err);
      setShareError(true);
      shareErrorTimerRef.current = setTimeout(() => setShareError(false), 3000);
    } finally {
      setIsGenerating(false);
    }
  };

  const triggerDownload = (blob: Blob, filename: string) => {
    const link = document.createElement('a');
    link.download = filename;
    link.href = URL.createObjectURL(blob);
    link.click();
    setTimeout(() => URL.revokeObjectURL(link.href), 1000);
  };

  const overlayUrl = useMemo(() => 
    wedding?.twibbonOverlay ? `${wedding.twibbonOverlay}${wedding.twibbonOverlay.includes('?') ? '&' : '?'}v=${Date.now()}` : ''
  , [wedding?.twibbonOverlay]);

  const isRemoteOverlay = overlayUrl.startsWith('http');

  return (
    <div ref={wrapperRef} className="flex flex-col h-fit w-full items-center justify-start gap-[3vh] px-4">
      <div className="text-center shrink-0">
        <p className="text-xs uppercase tracking-[0.4em] text-gold font-black mb-2">Twibbon Pernikahan Kami</p>
        <p className="font-serif italic text-[13px] leading-relaxed text-ink/70 max-w-[300px] mx-auto">rayakan momen bahagia ini bersama kami.</p>
      </div>
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.05 }}
          transition={{ duration: 0.8 }}
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
              {isLoading ? (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="flex items-center gap-2">
                    {[0, 1, 2].map((i) => (
                      <motion.div
                        key={i}
                        animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1, 0.8] }}
                        transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2, ease: 'easeInOut' }}
                        className="w-2 h-2 rounded-full bg-white/60"
                      />
                    ))}
                  </div>
                </div>
              ) : image ? (
                <motion.img
                  ref={imgElementRef}
                  initial={{ opacity: 0, scale: 1.1 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                  src={image}
                  className="max-w-none w-full h-full object-cover pointer-events-none"
                  style={{ transform: `scale(${transform.zoom}) translate3d(${transform.x}px, ${transform.y}px, 0)` }}
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

            <img 
              ref={overlayImgRef} 
              src={overlayUrl} 
              onLoad={() => setIsReady(true)} 
              onError={() => {
                console.error('Twibbon overlay failed to load:', overlayUrl);
              }}
              className="absolute inset-0 z-10 w-full h-full pointer-events-none" 
              alt="" 
            />
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
            onClick={handleShare}
            disabled={!isReady || isGenerating}
            className="w-full py-2 bg-gold text-ivory rounded-full font-black uppercase text-xs tracking-[0.4em] shadow-xl disabled:opacity-50 disabled:pointer-events-none transition-all flex items-center justify-center gap-2"
          >
            {isGenerating ? (
              <>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  className="w-3 h-3 border-2 border-ivory/30 border-t-ivory rounded-full"
                />
                Memproses...
              </>
            ) : (
              'Bagikan Momen'
            )}
          </motion.button>
          {shareError && <p className="text-xs text-red-400 mt-2 font-serif italic">Gagal membuat gambar. Coba lagi.</p>}
        </motion.div>
      )}

      <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
    </div>
  );
}
