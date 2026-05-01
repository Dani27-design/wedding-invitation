// Build Update: 2026-04-29
import { useState, useEffect, useRef, FormEvent, useCallback, ChangeEvent, MouseEvent, TouchEvent } from 'react';
import { motion, AnimatePresence, useScroll, useTransform, useSpring } from 'motion/react';
import {
  Heart,
  Calendar,
  MapPin,
  Music,
  Copy,
  Check,
  Sparkles,
  ArrowRight,
  Send,
  MessageSquare,
  MessageCircle,
  Gift,
  ChevronDown,
  Camera,
  Download,
  Upload,
  Plus,
  Minus,
  RefreshCw,
  Image as ImageIcon,
  Palette,
  Code,
  Instagram,
  Twitter,
  Facebook,
  X,
  Play,
  Pause
} from 'lucide-react';

// --- TYPES ---
import { GuestWishes } from './types';

// Custom Easing
const transition = { duration: 1.8, ease: [0.16, 1, 0.3, 1] };
const stagger = {
  animate: {
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.3
    }
  }
};

const fadeUp = {
  initial: { opacity: 0, y: 20, filter: 'blur(10px)' },
  animate: { opacity: 1, y: 0, filter: 'blur(0px)', transition }
};

// --- COMPONENTS ---

const LightGlow = () => (
  <div className="absolute inset-0 pointer-events-none overflow-hidden z-[5]">
    <motion.div
      animate={{
        opacity: [0.05, 0.15, 0.05],
        scale: [1, 1.1, 1],
        rotate: [0, 5, 0],
        x: ['-5%', '5%', '-5%'],
        y: ['-5%', '5%', '-5%']
      }}
      transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
      className="absolute -top-1/4 -right-1/4 w-[150%] h-[150%] bg-gold/10 blur-[180px] rounded-full pointer-events-none mix-blend-soft-light"
    />
  </div>
);

const ForegroundOrnaments = () => (
  <div className="absolute inset-0 pointer-events-none z-20 overflow-hidden">
    <motion.div
      animate={{
        y: [0, -15, 0],
        rotate: [-1, 1, -1]
      }}
      transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
      className="absolute -bottom-20 -left-20 w-80 h-80 bg-ink/10 blur-[60px] rounded-full"
    />
    <motion.div
      animate={{
        y: [0, 20, 0],
        rotate: [1, -1, 1]
      }}
      transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
      className="absolute -top-20 -right-20 w-96 h-96 bg-gold/5 blur-[80px] rounded-full"
    />
  </div>
);

const FloatingPetals = () => (
  <div className="absolute inset-0 pointer-events-none overflow-hidden z-10">
    {[...Array(8)].map((_, i) => (
      <motion.div
        key={i}
        initial={{
          opacity: 0,
          x: Math.random() * 100 + "%",
          y: -50,
          rotate: Math.random() * 360,
          scale: 0.8 + Math.random() * 1.2
        }}
        animate={{
          opacity: [0, 0.3, 0.3, 0],
          y: "100vh",
          x: (Math.random() * 100 - 30 + Math.sin(i) * 15) + "%",
          rotate: [0, 180, 360, 540],
          skewX: [0, 15, -15, 0]
        }}
        transition={{
          duration: 25 + Math.random() * 15,
          repeat: Infinity,
          delay: Math.random() * 15,
          ease: [0.45, 0, 0.55, 1]
        }}
        className="absolute"
      >
        <div className="w-4 h-6 bg-gold/5 rounded-[100%_10%_100%_10%] blur-[0.5px] shadow-sm transform-gpu" />
      </motion.div>
    ))}
  </div>
);

const BackgroundLayers = () => (
  <>
    {/* Global Film Grain */}
    <div className="fixed inset-0 pointer-events-none z-[9999] opacity-[0.025] animate-grain bg-repeat bg-[url('https://www.transparenttextures.com/patterns/p6.png')]" />

    {/* Living Ornament: Floral Shadows */}
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden mix-blend-multiply opacity-30">
      <div className="absolute top-0 -left-20 w-[600px] h-[600px] bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] blur-[80px] rounded-full animate-shadow-drift" />
      <div className="absolute bottom-0 -right-20 w-[500px] h-[500px] bg-gold/10 blur-[100px] rounded-full animate-shadow-drift [animation-delay:5s]" />
    </div>

    {/* Subtle Light sweep */}
    <div className="fixed inset-0 pointer-events-none z-[1] overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-gold/5 to-transparent w-[200%] -translate-x-full animate-light-sweep" />
    </div>
  </>
);

const CountdownTimer = ({ targetDate }: { targetDate: string }) => {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  useEffect(() => {
    const target = new Date(targetDate).getTime();

    const updateTimer = () => {
      const now = new Date().getTime();
      const distance = target - now;

      const calculated = distance < 0 ? {
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0
      } : {
        days: Math.floor(distance / (1000 * 60 * 60 * 24)),
        hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((distance % (1000 * 60)) / 1000)
      };

      setTimeLeft(calculated);
    };

    updateTimer();
    const timer = setInterval(updateTimer, 1000);
    return () => clearInterval(timer);
  }, []);

  // Standard simplified TimeBox for reliability
  const TimeBox = ({ value, label }: { value: number; label: string }) => (
    <motion.div
      animate={{ y: [0, -4, 0] }}
      transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      className="flex flex-col items-center flex-1 min-w-0"
    >
      <div className="relative group">
        {/* Animated Background Aura */}
        <div className="absolute inset-0 bg-gold/10 blur-xl rounded-full scale-150 animate-pulse opacity-50 -z-10" />

        <AnimatePresence mode="wait">
          <motion.span
            key={value}
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 1.1 }}
            transition={{ duration: 0.4, ease: "backOut" }}
            className="font-serif text-3xl md:text-5xl text-ink/90 block font-light leading-none tracking-tighter"
          >
            {value.toString().padStart(2, '0')}
          </motion.span>
        </AnimatePresence>
      </div>
      <span className="font-sans text-[7px] md:text-[9px] tracking-[0.2em] md:tracking-[0.3em] uppercase text-gold/80 font-bold mt-2">
        {label}
      </span>
    </motion.div>
  );

  return (
    <div className="w-full max-w-xl mx-auto px-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.5 }}
        className="flex justify-center items-center gap-1 md:gap-14 py-2 md:py-6 w-full relative z-30"
      >
        <TimeBox value={timeLeft.days} label="Hari" />
        <TimeBox value={timeLeft.hours} label="Jam" />
        <TimeBox value={timeLeft.minutes} label="Menit" />
        <TimeBox value={timeLeft.seconds} label="Detik" />
      </motion.div>
    </div>
  );
};


type AspRatio = '4:5' | '9:16' | '16:9';

function TwibbonCreator() {
  const [image, setImage] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);
  
  // High-performance refs for gesture state (avoids React re-renders during motion)
  const transformRef = useRef({ x: 0, y: 0, zoom: 1 });
  const containerRef = useRef<HTMLDivElement>(null);
  const imgElementRef = useRef<HTMLImageElement>(null);
  const overlayCanvasRef = useRef<HTMLCanvasElement>(null);
  const exportCanvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const isDragging = useRef(false);
  const lastPos = useRef({ x: 0, y: 0 });
  const lastTouchDistance = useRef<number | null>(null);

  // Constants for fixed 9:16 Story Ratio
  const CANVAS_W = 1080;
  const CANVAS_H = 1920;

  const FRAME_MARGIN = 100;
  const FRAME_TOP = 140;
  const FRAME_BOTTOM = 280;

  const updateImageTransform = useCallback(() => {
    if (!imgElementRef.current) return;
    const { x, y, zoom } = transformRef.current;
    // Use translate3d for hardware acceleration and smooth movement
    imgElementRef.current.style.transform = `translate3d(${x}px, ${y}px, 0) scale(${zoom})`;
  }, []);

  const drawOverlay = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, skipClear = false) => {
    if (!skipClear) ctx.clearRect(0, 0, w, h);
    
    // 1. Layout Geometry (Signature Arch)
    const margin = FRAME_MARGIN;
    const top = FRAME_TOP;
    const bottom = FRAME_BOTTOM;
    const viewW = w - margin * 2;
    const viewH = h - top - bottom;
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

    // 2. Luxury Canvas (Warm Sand Base)
    ctx.fillStyle = "#F2EEE9"; 
    ctx.fillRect(0, 0, w, h);

    // 3. Artistic Feathered Mask (Cinematic Blending)
    // We use destination-out with a blur filter to create a soft, vignette-style hole for the photo
    ctx.save();
    ctx.globalCompositeOperation = 'destination-out';
    if (typeof ctx.filter !== 'undefined') {
      ctx.filter = 'blur(35px)'; // Premium softness
    }
    ctx.fillStyle = "white";
    archPath(40); // Inset slightly for better vignette effect
    ctx.fill();
    ctx.restore();
    if (typeof ctx.filter !== 'undefined') ctx.filter = 'none';

    // 4. Atmospheric Light & Depth
    // Soft Inner Arch Glow (Highlights the boundary subtly)
    ctx.strokeStyle = "rgba(255, 255, 255, 0.4)";
    ctx.lineWidth = 2;
    archPath(45);
    ctx.stroke();

    // Warm Atmospheric Glow (Top right sunlight hint)
    const sunGrad = ctx.createRadialGradient(w * 0.9, 0, 0, w * 0.9, 0, w * 0.7);
    sunGrad.addColorStop(0, "rgba(255, 248, 230, 0.12)");
    sunGrad.addColorStop(1, "transparent");
    ctx.fillStyle = sunGrad;
    ctx.fillRect(0, 0, w, h);

    // 5. Artisanal Floral Arrangement (The "Masterpiece" Frame)
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

    const drawArtisticFlower = (x: number, y: number, scale: number, shapeType: number, colorType: number) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.scale(scale, scale);
      
      const themes = [
        { main: 'rgba(235, 170, 185, 0.5)', secondary: 'rgba(245, 200, 210, 0.35)', center: 'rgba(200, 130, 150, 0.25)' }, // 0: Dusty Rose (Pinks)
        { main: 'rgba(255, 200, 180, 0.5)', secondary: 'rgba(255, 225, 210, 0.35)', center: 'rgba(230, 160, 140, 0.25)' }, // 1: Soft Peach
        { main: 'rgba(255, 253, 240, 0.6)', secondary: 'rgba(255, 255, 255, 0.45)', center: 'rgba(240, 220, 160, 0.3)' },  // 2: Creamy White
        { main: 'rgba(250, 240, 185, 0.5)', secondary: 'rgba(255, 250, 210, 0.35)', center: 'rgba(220, 190, 100, 0.25)' }, // 3: Pale Yellow
        { main: 'rgba(195, 180, 235, 0.5)', secondary: 'rgba(210, 200, 250, 0.35)', center: 'rgba(150, 130, 200, 0.25)' }, // 4: Lavender (Purple)
        { main: 'rgba(175, 205, 240, 0.5)', secondary: 'rgba(200, 220, 250, 0.35)', center: 'rgba(140, 170, 220, 0.25)' }, // 5: Hydrangea Blue
        { main: 'rgba(220, 180, 190, 0.55)', secondary: 'rgba(235, 200, 210, 0.4)', center: 'rgba(180, 130, 150, 0.3)' },  // 6: Vintage Mauve
        { main: 'rgba(245, 225, 190, 0.45)', secondary: 'rgba(255, 240, 210, 0.3)', center: 'rgba(210, 180, 130, 0.25)' }, // 7: Champagne
        { main: 'rgba(155, 185, 165, 0.45)', secondary: 'rgba(180, 205, 190, 0.3)', center: 'rgba(100, 130, 110, 0.25)' }, // 8: Sage (Greenery)
        { main: 'rgba(230, 190, 140, 0.4)', secondary: 'rgba(245, 210, 140, 0.25)', center: 'rgba(180, 140, 100, 0.2)' }   // 9: Golden Accent
      ];
      
      // Smart color selection based on shape to ensure it "makes sense"
      let paletteIndex = colorType % 10;
      if (shapeType === 0) paletteIndex = [0, 1, 2, 3, 6][colorType % 5]; // Roses: Pink, Peach, White, Yellow, Mauve
      else if (shapeType === 1) paletteIndex = [2, 3, 0][colorType % 3];  // Daisies: White, Yellow, Pink
      else if (shapeType === 3) paletteIndex = [2, 7, 3][colorType % 3];  // Jasmine: White, Champagne, Yellow
      else if (shapeType === 4) paletteIndex = [4, 5, 2][colorType % 3];  // Clusters: Purple, Blue, White
      else if (shapeType === 5) paletteIndex = [0, 6, 9][colorType % 3];  // Hearts: Pink, Mauve, Gold
      
      const palette = themes[paletteIndex];
      
      if (shapeType === 0) { // TYPE 0: Lush Rose
        for (let i = 0; i < 14; i++) {
          const angle = (i / 14) * Math.PI * 2;
          drawPetal(Math.cos(angle) * 12, Math.sin(angle) * 12, 18, 8, angle + 0.4, palette.main);
        }
        for (let i = 0; i < 8; i++) {
          const angle = (i / 8) * Math.PI * 2 + 0.3;
          drawPetal(Math.cos(angle) * 6, Math.sin(angle) * 6, 12, 6, angle, palette.secondary);
        }
      } else if (shapeType === 1) { // TYPE 1: Wild Daisy
        for (let i = 0; i < 16; i++) {
          const angle = (i / 16) * Math.PI * 2;
          drawPetal(Math.cos(angle) * 16, Math.sin(angle) * 16, 24, 4, angle, palette.main);
        }
      } else if (shapeType === 2) { // TYPE 2: Fan/Peony
        for (let i = 0; i < 7; i++) {
          const angle = (i / 7) * Math.PI * 1.2 - 0.5;
          drawPetal(Math.cos(angle) * 14, Math.sin(angle) * 14, 20, 10, angle, palette.main);
        }
      } else if (shapeType === 3) { // TYPE 3: Pointy Jasmine
        for (let i = 0; i < 5; i++) {
          const angle = (i / 5) * Math.PI * 2;
          drawPetal(Math.cos(angle) * 10, Math.sin(angle) * 10, 14, 4, angle, palette.main);
        }
      } else if (shapeType === 4) { // TYPE 4: Delicate Cluster
        for (let i = 0; i < 6; i++) {
          const xO = (i % 3 - 1) * 10;
          const yO = (Math.floor(i / 3) - 1) * 10;
          ctx.beginPath();
          ctx.arc(xO, yO, 6, 0, Math.PI * 2);
          ctx.fillStyle = palette.main;
          ctx.fill();
        }
      } else { // TYPE 5: Aesthetic Heart
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
      
      // Heart of the bloom
      if (shapeType !== 5 && shapeType !== 4) {
        ctx.beginPath();
        ctx.arc(0, 0, 4, 0, Math.PI * 2);
        ctx.fillStyle = palette.center;
        ctx.fill();
      }
      
      ctx.restore();
    };

    // Draw connecting vines first (Behind flowers)
    ctx.beginPath();
    ctx.strokeStyle = 'rgba(126, 171, 140, 0.15)';
    ctx.lineWidth = 4;
    archPath(20);
    ctx.stroke();

    const flowerDensity = 100;
    for (let i = 0; i <= flowerDensity; i++) {
      const t = i / flowerDensity;
      let fx, fy;
      
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

      // Create depth with layered clusters (More even, slightly tighter spread)
      const clusterSize = 3;
      for(let j=0; j<clusterSize; j++) {
        const spread = 90; // Balanced spread
        const jx = (Math.random() - 0.5) * spread;
        const jy = (Math.random() - 0.5) * spread;
        const s = 0.4 + Math.random() * 0.9;
        const colorType = Math.floor(Math.random() * 10);
        
        // Slightly favor greenery (type 1) and roses (type 0) for structure
        let shapeType;
        const r = Math.random();
        if (r < 0.25) shapeType = 1; // Sage Leaf structure
        else if (r < 0.45) shapeType = 0; // Rose
        else shapeType = Math.floor(Math.random() * 6);
        
        drawArtisticFlower(fx + jx, fy + jy, s, shapeType, colorType);
      }
    }

    // Curated accent clusters for even weight distribution
    const accents = [
      { x: margin - 30, y: top + viewH - 100 },
      { x: margin + viewW + 30, y: top + viewH - 100 },
      { x: margin + viewW / 2, y: top - 40 },
      { x: margin + 50, y: top + 150 },
      { x: margin + viewW - 50, y: top + 150 }
    ];
    accents.forEach(p => {
      for(let i=0; i<6; i++) {
        const s = 0.6 + Math.random() * 0.8;
        const shapeType = Math.floor(Math.random() * 6);
        const colorType = Math.floor(Math.random() * 10);
        drawArtisticFlower(p.x + (Math.random()-0.5)*120, p.y + (Math.random()-0.5)*120, s, shapeType, colorType);
      }
    });

    // Elegant Atmosphere (Increased petal count)
    for(let i=0; i<40; i++) {
        const px = w/2 + (Math.random()-0.5) * 1100;
        const py = h - 400 + (Math.random()-0.5) * 500;
        drawPetal(px, py, 11, 5, Math.random()*Math.PI, 'rgba(219, 140, 160, 0.08)');
    }

    // 6. Editorial Typography
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    
    // Line 1: attendance the wedding of
    ctx.font = "italic 32px 'Playfair Display', serif";
    ctx.fillStyle = "rgba(26, 26, 26, 0.45)";
    ctx.fillText("attendance the wedding of", w / 2, h - 255);

    // Line 2: Dani & Marini (Balanced with smaller ampersand)
    const fontMain = "110px 'Dayland', cursive";
    const fontAmp = "65px 'Dayland', cursive";
    ctx.font = fontMain;
    const wDani = ctx.measureText("Dani").width;
    const wMarini = ctx.measureText("Marini").width;
    ctx.font = fontAmp;
    const wAmp = ctx.measureText("&").width;
    
    const spacing = 30;
    const totalW = wDani + wMarini + wAmp + spacing * 2;
    let currentX = (w - totalW) / 2;
    const nameY = h - 140;

    ctx.textAlign = "left";
    ctx.fillStyle = "rgba(26, 26, 26, 0.9)";
    ctx.font = fontMain;
    ctx.fillText("Dani", currentX, nameY);
    currentX += wDani + spacing;
    
    ctx.font = fontAmp;
    ctx.fillText("&", currentX, nameY + 2); 
    currentX += wAmp + spacing;
    
    ctx.font = fontMain;
    ctx.fillText("Marini", currentX, nameY);
    
    // Line 3: surabaya 29 agustus 2026
    ctx.textAlign = "center";
    ctx.font = "italic 28px 'Playfair Display', serif";
    ctx.fillStyle = "rgba(163, 143, 106, 0.7)";
    ctx.fillText("surabaya 29 agustus 2026", w / 2, h - 40);

    // 7. Cinematic Flourish (Gold Dust)
    for(let i=0; i<65; i++) {
      ctx.beginPath();
      ctx.arc(Math.random()*w, Math.random()*h, Math.random()*1.2, 0, Math.PI*2);
      ctx.fillStyle = `rgba(196, 164, 106, ${Math.random()*0.18})`;
      ctx.fill();
    }
  }, []);

  useEffect(() => {
    const canvas = overlayCanvasRef.current;
    if (canvas) {
      canvas.width = CANVAS_W;
      canvas.height = CANVAS_H;
      const ctx = canvas.getContext('2d');
      if (ctx) drawOverlay(ctx, CANVAS_W, CANVAS_H);
    }
    setIsReady(true);
  }, [drawOverlay]);

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
    
    // CRITICAL: Isolate scroll only when dragging
    if (e.cancelable) e.preventDefault();
    
    isDragging.current = true;
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    if ('touches' in e && e.touches.length === 2) {
      const dist = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY);
      lastTouchDistance.current = dist;
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
        const delta = dist / lastTouchDistance.current;
        transformRef.current.zoom = Math.min(5, Math.max(0.1, transformRef.current.zoom * delta));
      }
      lastTouchDistance.current = dist;
    } else {
      const deltaX = clientX - lastPos.current.x;
      const deltaY = clientY - lastPos.current.y;
      transformRef.current.x += deltaX;
      transformRef.current.y += deltaY;
      lastPos.current = { x: clientX, y: clientY };
    }
    
    // Direct DOM update for performance (60fps)
    requestAnimationFrame(updateImageTransform);
  };

  const handleEnd = () => {
    isDragging.current = false;
    lastTouchDistance.current = null;
  };

  const handleCanvasClick = (e: MouseEvent) => {
    if (image) return;

    // Check if click is inside the photo arch area (matches archPath(40) in drawOverlay)
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = ((e.clientX - rect.left) / rect.width) * CANVAS_W;
    const y = ((e.clientY - rect.top) / rect.height) * CANVAS_H;

    const vH = CANVAS_H - FRAME_TOP - FRAME_BOTTOM;

    // Matches the visual "hole" boundaries
    const isInsideX = x >= (FRAME_MARGIN + 40) && x <= (CANVAS_W - FRAME_MARGIN - 40);
    const isInsideY = y >= (FRAME_TOP + 40) && y <= (FRAME_TOP + vH - 40);

    if (isInsideX && isInsideY) {
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
    img.crossOrigin = "anonymous";
    img.onload = () => {
      // 1. Draw Warm Sand Background
      ctx.fillStyle = "#F2EEE9";
      ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

      // 2. Draw User Image with transformations
      const { x, y, zoom } = transformRef.current;
      const scale = Math.max(CANVAS_W / img.width, CANVAS_H / img.height) * zoom;
      const dw = img.width * scale;
      const dh = img.height * scale;
      const centerX = (CANVAS_W - dw) / 2;
      const centerY = (CANVAS_H - dh) / 2;
      
      ctx.save();
      const previewEl = containerRef.current;
      if (previewEl) {
        const pScale = CANVAS_W / previewEl.clientWidth;
        ctx.translate(x * pScale, y * pScale);
      }
      ctx.drawImage(img, centerX, centerY, dw, dh);
      ctx.restore();

      // 3. Draw Overlay logic ON TOP using a temp canvas to preserve transparency
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = CANVAS_W;
      tempCanvas.height = CANVAS_H;
      const tempCtx = tempCanvas.getContext('2d');
      if (tempCtx) {
        drawOverlay(tempCtx, CANVAS_W, CANVAS_H);
        ctx.drawImage(tempCanvas, 0, 0);
      }

      const link = document.createElement('a');
      link.download = `Memori-Dani-Marini.png`;
      link.href = canvas.toDataURL('image/png', 1.0);
      link.click();
    };
    img.src = image;
  };

  return (
    <div className="flex flex-col h-fit w-full py-4 items-center justify-center">
      {/* HEADER (COMPACT) */}
      <div className="text-center mb-6 shrink-0 px-4">
        <h3 className="font-serif text-xl italic text-ink mb-1">Rayakan Momen Ini</h3>
        <p className="text-[9px] uppercase tracking-[0.4em] text-gold font-black opacity-60">Signature Twibbon</p>
      </div>

      {/* TWIBBON RESULT AREA - Separated Frame and Actions for ratio accuracy */}
      <div className="flex-1 w-full flex flex-col items-center justify-center min-h-0 h-fit px-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative h-fit w-[82%] max-w-[320px] aspect-[9/16] shadow-[0_45px_120px_-20px_rgba(0,0,0,0.3)] border border-ink/10 bg-[#F2EEE9] group/result"
        >
          {/* FRAME CONTAINER */}
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
            {/* USER IMAGE LAYER */}
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
                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent"
                  />
                  <Camera className="w-10 h-10 text-white/20 stroke-[1]" />
                </div>
              )}
            </div>

            <canvas 
              ref={overlayCanvasRef} 
              className="absolute inset-0 z-10 w-full h-full pointer-events-none"
            />

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

        {/* ACTIONS (Outside aspect ratio container) */}
        <div className="mt-8 flex flex-col items-center h-fit w-[82%] max-w-[320px] shrink-0">
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
            className="w-full py-2 bg-ink text-gold rounded-full font-black uppercase text-[10px] tracking-[0.4em] shadow-xl disabled:opacity-30 disabled:pointer-events-none transition-all border border-gold/10"
          >
            Bagikan Momen
          </motion.button>
        </div>
      </div>

      <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
    </div>
  );
};


{/* --- AMBIENT SOCIAL & DECORATIVE HELPERS --- */}
const AmbientSocialLayer = ({ 
  customComments = [], 
  triggerHeartTap,
  triggerCommentTap
}: { 
  customComments?: { name: string, text: string }[], 
  triggerHeartTap?: number,
  triggerCommentTap?: { name: string, text: string, id: number } | null
}) => {
  const [elements, setElements] = useState<{ id: number; type: 'heart' | 'comment'; text?: string; x: number; delay: number; isBurst?: boolean; isInstant?: boolean }[]>([]);
  
  // Ensure default comments have a name for consistency
  const defaultComments = [
    "Tamu: MasyaAllah", 
    "Tamu: So sweet", 
    "Tamu: Akhirnya", 
    "Tamu: Bahagia selalu", 
    "Tamu: Lancar ya"
  ];
  const pool = [...defaultComments, ...customComments.map(c => `${c.name}: ${c.text}`)];

  // Handle manual heart burst
  useEffect(() => {
    if (triggerHeartTap) {
      const burstId = Date.now() + Math.random();
      const burstEl = {
        id: burstId,
        type: 'heart' as const,
        x: 70 + (Math.random() * 20), // Group near the heart button area (right side)
        delay: 0,
        isBurst: true
      };
      setElements(prev => [...prev.slice(-20), burstEl]);
    }
  }, [triggerHeartTap]);

  // Handle manual comment burst (instant feedback)
  useEffect(() => {
    if (triggerCommentTap) {
      const instantEl = {
        id: triggerCommentTap.id,
        type: 'comment' as const,
        text: `${triggerCommentTap.name}: ${triggerCommentTap.text}`,
        x: 40 + Math.random() * 20, // More central for visibility
        delay: 0,
        isInstant: true
      };
      setElements(prev => [...prev.slice(-20), instantEl]);
    }
  }, [triggerCommentTap]);

  useEffect(() => {
    const interval = setInterval(() => {
      setElements(prev => {
        const isComment = Math.random() > 0.6;
        const newEl = {
          id: Date.now() + Math.random(),
          type: (isComment ? 'comment' : 'heart') as 'heart' | 'comment',
          text: isComment ? pool[Math.floor(Math.random() * pool.length)] : undefined,
          // Use a tighter range for comments to avoid clipping
          x: isComment ? 20 + Math.random() * 60 : 5 + Math.random() * 90,
          delay: Math.random() * 1.5
        };
        return [...prev.slice(-20), newEl];
      });
    }, 4000);
    return () => clearInterval(interval);
  }, [JSON.stringify(pool)]);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-20">
      <AnimatePresence>
        {elements.map(el => (
          <motion.div
            key={el.id}
            initial={{ 
              opacity: 0, 
              y: (el.isBurst || el.isInstant) ? "70vh" : "100vh", 
              x: `${el.x}vw`,
              scale: (el.isBurst || el.isInstant) ? 0.7 : 1,
              translateX: "-50%" 
            }}
            animate={{ 
              opacity: [0, 1, 1, 0], 
              y: "-15vh",
              x: [`${el.x}vw`, `${el.x + (Math.random() * 15 - 7.5)}vw`],
              scale: (el.isBurst || el.isInstant) ? [0.7, 1.2, 1] : 1
            }}
            exit={{ opacity: 0 }}
            transition={{ 
              duration: (el.isBurst || el.isInstant) ? 4 + Math.random() * 2 : 14 + Math.random() * 6, 
              ease: el.isInstant ? "easeOut" : "linear", 
              delay: el.delay 
            }}
            className={`absolute will-change-transform ${el.isInstant ? 'z-50' : 'z-20'}`}
          >
            {el.type === 'heart' ? (
              <Heart 
                className={`${el.isBurst ? 'w-6 h-6' : 'w-3 h-3'} text-rose-pastel fill-rose-pastel/40 drop-shadow-sm`} 
              />
            ) : (
              <span className={`text-[10px] font-sans tracking-[0.1em] uppercase text-white/95 whitespace-nowrap bg-black/40 border ${el.isInstant ? 'border-rose-pastel/60 scale-110' : 'border-white/10'} px-4 py-2 rounded-full backdrop-blur-md shadow-2xl`}>
                {el.text}
              </span>
            )}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

const PetalEffect = () => {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-10">
      {[...Array(15)].map((_, i) => (
        <motion.div
          key={i}
          initial={{ 
            opacity: 0, 
            y: -20, 
            x: `${Math.random() * 100}vw`,
            rotate: 0 
          }}
          animate={{ 
            opacity: [0, 0.3, 0],
            y: "100vh",
            x: [`${Math.random() * 100}vw`, `${(Math.random() - 0.5) * 50 + 50}vw`],
            rotate: [0, 180, 360]
          }}
          transition={{ 
            duration: 18 + Math.random() * 10,
            repeat: Infinity,
            ease: "easeInOut",
            delay: i * 1.5
          }}
          className="absolute w-1.5 h-1.5 bg-rose-pastel/15 rounded-full blur-[0.5px]"
        />
      ))}
    </div>
  );
};

const CinematicStory = () => {
  const slides = [
    {
      year: "2016 — 2017",
      text: "Berawal dari chat sederhana,\nlalu kita dipertemukan di dunia nyata.\n\nCappucino cincau dan Indomaret Point—\njadi saksi awal cerita kita.",
      bg: "/bride_face_potrait.jpeg"
    },
    {
      year: "2018 — 2022",
      text: "Kita berjalan beriringan,\nmelewati hari-hari yang mungkin terlihat biasa,\ntapi selalu terasa berbeda saat dijalani bersama.",
      bg: "/groom_face_potrait.jpeg"
    },
    {
      year: "2023",
      text: "Kita sampai di satu titik,\nsaling menyaksikan langkah masing-masing,\ndan tetap memilih untuk ada di sisi satu sama lain.",
      bg: "/bride_and_groom_half_body_potrait.png"
    },
    {
      year: "2024 — 2025",
      text: "Hubungan ini tidak lagi sekadar berjalan,\ntapi mulai menuju arah yang sama.\n\nDari cerita yang kita jalani,\nperlahan menjadi tujuan yang kita pilih.",
      bg: "/bride_and_groom_full_body_potrait.jpeg"
    },
    {
      year: "2026",
      text: "Setelah semua perjalanan ini,\nkita memutuskan untuk melangkah lebih jauh—\nbersama, selamanya.",
      bg: "/ivory_texture.jpg"
    },
    {
      year: "Ikrar",
      text: "Bukan perjalanan yang singkat,\ndan tidak selalu mudah.\nAda waktu yang menguji,\nada langkah yang sempat rapuh.\n\nNamun kami tetap memilih,\nuntuk tidak berhenti satu sama lain.\n\nHingga akhirnya kami sampai di titik ini,\ntapi karena kami memutuskan\nuntuk tetap melaluinya bersama.",
      bg: "/bride_and_groom_full_body_potrait.jpeg"
    }
  ];

  const [storyStats, setStoryStats] = useState<Record<number, { likes: number; comments: { name: string; text: string }[] }>>(
    slides.reduce((acc, _, i) => ({ ...acc, [i]: { likes: Math.floor(Math.random() * 50) + 120, comments: [] } }), {})
  );
  const [commentInput, setCommentInput] = useState<{ index: number; name: string; text: string } | null>(null);
  const [heartTrigger, setHeartTrigger] = useState(0);
  const [commentTrigger, setCommentTrigger] = useState<{ name: string; text: string; id: number } | null>(null);

  const handleLike = (idx: number) => {
    setHeartTrigger(Date.now());
    setStoryStats(prev => ({
      ...prev,
      [idx]: { ...prev[idx], likes: prev[idx].likes + 1 }
    }));
  };

  const handleAddComment = (idx: number) => {
    if (!commentInput?.text.trim() || !commentInput?.name.trim()) return;
    const newComment = { name: commentInput.name, text: commentInput.text.trim() };
    setStoryStats(prev => ({
      ...prev,
      [idx]: { ...prev[idx], comments: [...prev[idx].comments, newComment] }
    }));
    setCommentTrigger({ ...newComment, id: Date.now() });
    setCommentInput(null);
  };

  return (
    <section id="story-section" className="relative h-screen w-full bg-ink overflow-hidden scroll-snap-container">
      <div className="h-full w-full flex overflow-x-auto snap-x snap-mandatory no-scrollbar scroll-smooth">
        {slides.map((slide, idx) => (
          <div key={idx} className="relative h-full w-full min-w-full snap-center flex items-center justify-center overflow-hidden">
            <div className="absolute inset-0">
              <img 
                src={slide.bg} 
                className="w-full h-full object-cover opacity-40 md:opacity-50 grayscale hover:grayscale-0 transition-all duration-[3000ms]"
                alt="Memory"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/20 to-ink/60" />
            </div>

            <AmbientSocialLayer 
              customComments={storyStats[idx].comments} 
              triggerHeartTap={heartTrigger} 
              triggerCommentTap={commentTrigger}
            />
            <PetalEffect />

            {/* Interaction UI Overlay */}
            <div className="absolute bottom-32 right-6 flex flex-col gap-5 z-[60]">
              <motion.button
                whileTap={{ scale: 0.8 }}
                onClick={() => handleLike(idx)}
                className="relative flex flex-col items-center gap-1 group"
              >
                <div className="w-12 h-12 rounded-full bg-white/5 backdrop-blur-md border border-white/10 flex items-center justify-center group-hover:bg-rose-pastel/20 transition-all">
                  <Heart className="w-5 h-5 text-rose-pastel transition-transform group-active:scale-125" fill={storyStats[idx].likes > 120 ? "currentColor" : "none"} />
                </div>
                <span className="text-[9px] font-sans text-white/60 tracking-widest">{storyStats[idx].likes}</span>
              </motion.button>

              <motion.button
                whileTap={{ scale: 0.8 }}
                onClick={() => setCommentInput({ index: idx, name: "", text: "" })}
                className="flex flex-col items-center gap-1 group"
              >
                <div className="w-12 h-12 rounded-full bg-white/5 backdrop-blur-md border border-white/10 flex items-center justify-center group-hover:bg-white/10 transition-all">
                  <MessageCircle className="w-5 h-5 text-ivory/80" />
                </div>
                <span className="text-[9px] font-sans text-white/60 tracking-widest">{storyStats[idx].comments.length}</span>
              </motion.button>
            </div>

            {/* Comment Input Overlay */}
            <AnimatePresence>
              {commentInput?.index === idx && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  className="absolute inset-x-6 bottom-48 z-[70] max-w-sm mx-auto"
                >
                  <div className="bg-ink/90 backdrop-blur-2xl border border-white/10 rounded-2xl p-5 shadow-2xl">
                    <div className="flex items-center gap-3 mb-4">
                      <MessageCircle className="w-4 h-4 text-rose-pastel" />
                      <span className="text-[10px] uppercase tracking-[0.2em] text-ivory/60 font-bold">Bagikan Kebahagiaan</span>
                    </div>
                    
                    <input
                      type="text"
                      value={commentInput.name}
                      onChange={(e) => setCommentInput({ ...commentInput, name: e.target.value })}
                      placeholder="Nama Anda"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-ivory placeholder:text-white/20 focus:outline-none focus:border-gold/50 mb-3 font-sans"
                    />

                    <textarea
                      autoFocus
                      value={commentInput.text}
                      onChange={(e) => setCommentInput({ ...commentInput, text: e.target.value })}
                      placeholder="Tulis pesan..."
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-ivory placeholder:text-white/20 focus:outline-none focus:border-rose-pastel/50 min-h-[80px] resize-none font-sans"
                    />
                    
                    <div className="flex justify-end gap-2 mt-4 font-sans">
                      <button 
                        onClick={() => setCommentInput(null)}
                        className="px-4 py-2 text-[10px] uppercase tracking-widest text-white/40 hover:text-white transition-colors"
                      >
                        Batal
                      </button>
                      <button 
                        disabled={!commentInput.text.trim() || !commentInput.name.trim()}
                        onClick={() => handleAddComment(idx)}
                        className="px-6 py-2 bg-rose-pastel rounded-full text-ink text-[10px] uppercase font-black tracking-widest hover:brightness-110 disabled:opacity-30 transition-all"
                      >
                        Kirim
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="relative z-30 px-8 pb-48 pt-20 w-full h-full flex flex-col items-start justify-end text-left">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 1.2, ease: "easeOut" }}
                className="max-w-[75%] md:max-w-md w-full"
              >
                <motion.div
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  transition={{ duration: 2 }}
                  className="font-sans text-[9px] uppercase tracking-[0.6em] text-gold/80 mb-6 flex items-center gap-3"
                >
                  <span className="h-[1px] w-6 bg-gold/30" />
                  <span>{slide.year}</span>
                </motion.div>
                
                <h2 className="font-serif italic text-sm md:text-base text-ivory/90 leading-relaxed whitespace-pre-line tracking-tight">
                  {slide.text}
                </h2>
              </motion.div>
            </div>

            <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex items-center gap-2.5 z-40">
              {slides.map((_, i) => (
                <motion.div 
                   key={i} 
                   animate={{ 
                     scale: i === idx ? 1.2 : 0.8,
                     width: i === idx ? 20 : 6,
                     opacity: i === idx ? 1 : 0.3
                   }}
                   transition={{ type: "spring", stiffness: 300, damping: 30 }}
                   className="h-1.5 bg-gold rounded-full transition-colors duration-500" 
                />
              ))}
            </div>
            
            {idx === 0 && (
              <motion.div 
                animate={{ x: [0, 8, 0], opacity: [0.2, 0.5, 0.2] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                className="absolute right-8 top-1/2 -translate-y-1/2 flex flex-col items-center gap-3 z-30 invisible md:visible"
              >
                <div className="w-[1px] h-16 bg-gradient-to-b from-transparent via-gold to-transparent" />
                <span className="text-[7px] tracking-[0.6em] uppercase text-gold rotate-90 origin-right translate-x-3 whitespace-nowrap mt-4">Scroll to reveal</span>
              </motion.div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
};

export default function App() {
  const [isOpen, setIsOpen] = useState(false);
  const [wishes, setWishes] = useState<GuestWishes[]>([
    { id: 'd1', name: 'Ahmad & Keluarga', attendance: 'yes', message: 'Selamat menempuh hidup baru Dani & Marini! Semoga menjadi keluarga sakinah mawaddah warahmah.', createdAt: Date.now() - 1000000 },
    { id: 'd2', name: 'Budi Santoso', attendance: 'yes', message: 'Happy wedding! Titip doa terbaik buat kalian berdua.', createdAt: Date.now() - 2000000 },
    { id: 'd3', name: 'Citra Lestari', attendance: 'no', message: 'Maaf belum bisa hadir, lancar sampai hari H ya!', createdAt: Date.now() - 3000000 },
    { id: 'd4', name: 'Dedi Kurniawan', attendance: 'yes', message: 'Baarakallahu laka wa baaraka \'alaika wa jama\'a bainakuma fii khoir.', createdAt: Date.now() - 4000000 },
    { id: 'd5', name: 'Eka Putri', attendance: 'yes', message: 'Semoga bahagia selamanya, sampai kakek nenek.', createdAt: Date.now() - 5000000 },
    { id: 'd6', name: 'Fajar Ramadhan', attendance: 'yes', message: 'Congrats brader! Akhirnya sah juga.', createdAt: Date.now() - 6000000 },
    { id: 'd7', name: 'Gita Amalia', attendance: 'yes', message: 'Cantik banget Marini! Semoga berkah rumah tangganya.', createdAt: Date.now() - 7000000 },
    { id: 'd8', name: 'Hadi Prasetyo', attendance: 'no', message: 'Selamat ya Dan! Maaf lagi di luar kota.', createdAt: Date.now() - 8000000 },
    { id: 'd9', name: 'Indra Jaya', attendance: 'yes', message: 'Selamat menempuh bahtera rumah tangga baru.', createdAt: Date.now() - 9000000 },
    { id: 'd10', name: 'Joko Susilo', attendance: 'yes', message: 'Sakinah mawaddah warahmah ya gaes.', createdAt: Date.now() - 10000000 },
    { id: 'd11', name: 'Kiki Amelia', attendance: 'yes', message: 'Happy forever you two!', createdAt: Date.now() - 11000000 },
    { id: 'd12', name: 'Lia Kusuma', attendance: 'yes', message: 'Lancar-lancar acaranya Marini.', createdAt: Date.now() - 12000000 },
    { id: 'd13', name: 'Maman', attendance: 'yes', message: 'Selamat menempuh hidup baru teman.', createdAt: Date.now() - 13000000 },
    { id: 'd14', name: 'Nina', attendance: 'no', message: 'Doa terbaik untuk kalian.', createdAt: Date.now() - 14000000 },
    { id: 'd15', name: 'Oky', attendance: 'yes', message: 'Mantap Dani! Selamat ya.', createdAt: Date.now() - 15000000 },
    { id: 'd16', name: 'Putu', attendance: 'yes', message: 'Rahajeng wedding Dani & Marini.', createdAt: Date.now() - 16000000 },
    { id: 'd17', name: 'Qori', attendance: 'yes', message: 'Selamat ya kak.', createdAt: Date.now() - 17000000 },
    { id: 'd18', name: 'Rian', attendance: 'yes', message: 'Selamat ya Dani dan Marini.', createdAt: Date.now() - 18000000 },
    { id: 'd19', name: 'Siska', attendance: 'yes', message: 'Happy wedding day!', createdAt: Date.now() - 19000000 },
    { id: 'd20', name: 'Tono', attendance: 'yes', message: 'Selamat berbahagia bro.', createdAt: Date.now() - 20000000 },
  ]);
  const [guestName, setGuestName] = useState("Tamu Terkasih Kami");
  const [isPlaying, setIsPlaying] = useState(false);
  const [isRSVPModalOpen, setIsRSVPModalOpen] = useState(false);
  const [isToolsOpen, setIsToolsOpen] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Dynamic Pagination Logic based on Refined Estimated Height
  const wishPages = (() => {
    // 82vh on a standard mobile is ~615px.
    // Pagination (50px) + Padding/Margins (~30px) = ~80px.
    // We can safely use 530px as available height.
    const availableHeight = 630;
    const pages: GuestWishes[][] = [];
    let currentPageWishes: GuestWishes[] = [];
    let currentHeight = 0;

    wishes.forEach((wish) => {
      // Header: ~28px + padding: ~20px + Message margin: ~4px = ~52px base
      // Content: approx 30 chars per line for the serif font at 12px
      const lines = Math.max(1, Math.ceil(wish.message.length / 30));
      const estimatedHeight = 52 + (lines * 17);

      if (currentHeight + estimatedHeight > availableHeight && currentPageWishes.length > 0) {
        pages.push(currentPageWishes);
        currentPageWishes = [wish];
        currentHeight = estimatedHeight;
      } else {
        currentPageWishes.push(wish);
        currentHeight += estimatedHeight + 6; // gap
      }
    });

    if (currentPageWishes.length > 0) pages.push(currentPageWishes);
    return pages;
  })();

  const currentWishes = wishPages[currentPage - 1] || [];
  const totalPages = wishPages.length;

  const { scrollYProgress } = useScroll();
  const smoothProgress = useSpring(scrollYProgress, { stiffness: 100, damping: 30 });

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const to = params.get('to');
    if (to) setGuestName(decodeURIComponent(to));
  }, []);

  const handleOpen = () => {
    setIsOpen(true);
    setIsPlaying(true);
    if (audioRef.current) {
      audioRef.current.play().catch(() => setIsPlaying(false));
    }
  };

  const toggleMusic = () => {
    if (audioRef.current) {
      if (isPlaying) audioRef.current.pause();
      else audioRef.current.play();
      setIsPlaying(!isPlaying);
    }
  };

  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleRSVPSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newWish: GuestWishes = {
      id: Math.random().toString(36).substr(2, 9),
      name: formData.get('name') as string,
      message: formData.get('message') as string,
      attendance: formData.get('attendance') as 'yes' | 'no',
      count: Number(formData.get('count')) || 1,
      createdAt: Date.now()
    };
    setWishes([newWish, ...wishes]);
    setCurrentPage(1); // Reset to first page on new wish
    setIsRSVPModalOpen(false); // Close modal on success
    e.currentTarget.reset();
  };

  const formatDate = (timestamp: number) => {
    return new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    }).format(timestamp);
  };

  return (
    <div className="min-h-screen bg-ivory text-ink selection:bg-gold/20 font-sans overflow-x-hidden">
      <BackgroundLayers />

      <audio ref={audioRef} loop src="https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3" />

      {/* --- CINEMATIC OPENING --- */}
      <AnimatePresence mode="wait">
        {!isOpen && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{
              opacity: 0,
              scale: 1.05,
              filter: 'blur(30px)',
              transition: { duration: 2, ease: [0.76, 0, 0.24, 1] }
            }}
            className="fixed inset-0 z-[1000] flex flex-col bg-ink overflow-hidden"
          >
            {/* Background Immersive Photo (Cinematic) */}
            <motion.div
              animate={{
                scale: [1, 1.05, 1],
                opacity: 0.4
              }}
              transition={{
                scale: { duration: 20, repeat: Infinity, ease: "easeInOut" },
                opacity: { duration: 4 }
              }}
              className="absolute inset-0 z-0"
            >
              <img
                src="/bride_and_groom_full_body_potrait.jpeg"
                className="w-full h-full object-cover animate-soft-zoom"
                alt="Opening BG"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-ink/60 via-transparent to-ink/90" />
              <LightGlow />
              <FloatingPetals />
              <ForegroundOrnaments />
            </motion.div>

            {/* Top Bar - Minimal */}
            <div className="relative z-10 p-6 md:p-6 flex justify-between items-start w-full">
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1 }}
                className="flex flex-col gap-1"
              >
                <span className="font-sans text-[8px] tracking-[0.4rem] uppercase text-gold font-bold">Surabaya</span>
                <span className="font-serif italic text-sm text-ivory/60">29 Agustus 2026</span>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1.2, duration: 1.5 }}
                className="relative w-12 h-12 flex items-center justify-center"
              >
                {/* Rotating Decorative Rings */}
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-0 border border-gold/20 rounded-full border-dashed"
                />
                <motion.div
                  animate={{ rotate: -360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-[3px] border border-gold/10 rounded-full"
                />

                {/* Core Heart Pulse */}
                <motion.div
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.6, 1, 0.6]
                  }}
                  transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                  className="relative z-10"
                >
                  <Heart className="w-4 h-4 text-gold fill-gold/20 drop-shadow-[0_0_12px_rgba(180,141,62,0.6)]" />
                </motion.div>

                {/* Celestial Spark Orbit */}
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-0"
                >
                  <div className="w-1 h-1 bg-gold/60 rounded-full absolute -top-0.5 left-1/2 -translate-x-1/2 blur-[0.5px]" />
                </motion.div>
              </motion.div>
            </div>

            {/* Main Content - Names Higher, Guest & CTA at Bottom */}
            <div className="relative z-10 px-8 md:px-24 flex-1 flex flex-col justify-between w-full h-full">
              {/* Top Content - Names (Higher) */}
              <div className="pt-0 md:pt-2 flex flex-col items-center justify-center">
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 1.8, delay: 0.5 }}
                  className="space-y-4 text-center"
                >
                  <h1 className="font-dayland text-7xl md:text-9xl text-ivory drop-shadow-2xl">
                    Dani & Marini
                  </h1>
                </motion.div>
              </div>

              {/* Bottom Content - Guest & CTA */}
              <div className="pb-6 md:pb-6 flex flex-col items-center justify-center">
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.5 }}
                  className="flex flex-col items-center text-center gap-6"
                >
                  <div className="space-y-2">
                    <p className="font-sans text-[9px] tracking-[0.3rem] uppercase text-gold/60 font-medium">Turut Mengundang</p>
                    <h2 className="font-display italic text-3xl md:text-4xl text-ivory/90 font-light">
                      {guestName}
                    </h2>
                  </div>

                  {/* Simple Text CTA */}
                  <div className="pt-4">
                    <motion.button
                      whileHover={{ letterSpacing: '0.6rem' }}
                      onClick={handleOpen}
                      className="font-sans text-[11px] tracking-[0.4rem] uppercase text-gold font-bold transition-all duration-500 py-4 border-b border-gold/20"
                    >
                      Buka Undangan
                    </motion.button>
                  </div>
                </motion.div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- MAIN CONTENT --- */}
      {isOpen && (
        <main className="relative z-10">

          {/* --- MUSIC & TOOLS CONTROLLER (DRAGGABLE ARTIFACT) --- */}
          <motion.div 
            drag
            dragMomentum={false}
            dragElastic={0.1}
            className="fixed bottom-8 right-3 z-[100] flex flex-col items-center gap-4 touch-none cursor-grab active:cursor-grabbing"
          >
            {/* Expanded Tools */}
            <AnimatePresence>
              {isToolsOpen && (
                <div className="flex flex-col items-center gap-3 mb-2">
                  {[
                    { id: 'twibbon-section', label: 'Twibbon', icon: Sparkles },
                    { id: 'rsvp-section', label: 'Konfirmasi', icon: Heart },
                    { id: 'gift-section', label: 'Digital Gift', icon: Gift },
                    { id: 'event-section', label: 'Info Acara', icon: MapPin },
                  ].map((tool, idx) => (
                    <motion.button
                      key={tool.id}
                      initial={{ opacity: 0, scale: 0.5, y: 20 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.5, y: 10 }}
                      transition={{ delay: idx * 0.05 }}
                      onClick={() => {
                        document.getElementById(tool.id)?.scrollIntoView({ behavior: 'smooth' });
                        setIsToolsOpen(false);
                      }}
                      className="group flex items-center gap-3 pr-4 pl-3 py-2 bg-ivory/90 backdrop-blur-xl border border-rose-pastel/30 rounded-full shadow-xl hover:bg-white transition-all"
                    >
                      <tool.icon className="w-3.5 h-3.5 text-rose-pastel group-hover:scale-110 transition-transform" />
                      <span className="font-sans text-[8px] tracking-[0.2em] uppercase text-ink font-bold">{tool.label}</span>
                    </motion.button>
                  ))}
                  
                  {/* Music Toggle tool */}
                  <motion.button
                    initial={{ opacity: 0, scale: 0.5, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.5, y: 10 }}
                    transition={{ delay: 0.2 }}
                    onClick={toggleMusic}
                    className="group flex items-center gap-3 pr-4 pl-3 py-2 bg-ivory/90 backdrop-blur-xl border border-rose-pastel/20 rounded-full shadow-xl hover:bg-white transition-all"
                  >
                    {isPlaying ? <Pause className="w-3.5 h-3.5 text-rose-pastel" /> : <Play className="w-3.5 h-3.5 text-rose-pastel" />}
                    <span className="font-sans text-[8px] tracking-[0.2em] uppercase text-ink font-bold">{isPlaying ? 'Hentikan Musik' : 'Putar Musik'}</span>
                  </motion.button>
                </div>
              )}
            </AnimatePresence>

            {/* Main Disc Button */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="relative"
            >
              {/* Pulsing Aura */}
              <AnimatePresence>
                {isPlaying && (
                  <motion.div
                    initial={{ scale: 1, opacity: 0 }}
                    animate={{ scale: [1, 1.8], opacity: [0.3, 0] }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
                    className="absolute inset-0 bg-rose-pastel/20 rounded-full blur-xl"
                  />
                )}
              </AnimatePresence>

              {/* Status Ring */}
              <motion.div
                animate={isPlaying ? { rotate: 360 } : { rotate: 0 }}
                transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                className={`absolute -inset-1.5 border border-dashed border-rose-pastel/30 rounded-full pointer-events-none transition-opacity duration-1000 ${isPlaying ? 'opacity-100' : 'opacity-40'}`}
              />

              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsToolsOpen(!isToolsOpen)}
                className={`relative w-14 h-14 flex items-center justify-center backdrop-blur-xl border border-rose-pastel/40 rounded-full transition-all duration-700 shadow-2xl group overflow-hidden ${isToolsOpen ? 'bg-ink border-rose-pastel' : 'bg-ivory/20'}`}
              >
                {/* Internal Animated Gradient Ring (Music dependent) */}
                <motion.div
                  animate={isPlaying ? { rotate: 360 } : { rotate: 0 }}
                  transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-0 opacity-20 bg-gradient-to-tr from-rose-pastel via-transparent to-rose-pastel"
                />

                <motion.div
                  animate={isToolsOpen ? { rotate: 180 } : { rotate: 0 }}
                  transition={{ type: "spring", stiffness: 260, damping: 20 }}
                >
                  {isToolsOpen ? (
                    <X className="w-6 h-6 text-rose-pastel" />
                  ) : (
                    <motion.div
                      animate={isPlaying ? {
                        scale: [1, 1.2, 1],
                        opacity: [0.8, 1, 0.8]
                      } : { scale: 1, opacity: 0.5 }}
                      transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    >
                      <Heart className={`w-6 h-6 text-rose-pastel ${isPlaying ? 'fill-rose-pastel' : ''} transition-colors duration-500`} />
                    </motion.div>
                  )}
                </motion.div>
              </motion.button>
            </motion.div>
          </motion.div>

          {/* --- [1] HERO (REFINED) --- */}
          <section className="relative min-h-[100vh] md:min-h-screen flex flex-col items-center justify-between px-6 pb-6 md:pb-6 overflow-hidden bg-ivory">
            {/* Full Background Portrait */}
            <div className="absolute inset-0 z-0">
              <motion.div
                animate={{ scale: [1, 1.03, 1] }}
                transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
                className="w-full h-full"
              >
                <img
                  src="/bride_and_groom_full_body_potrait.jpeg"
                  className="w-full h-full object-cover object-top brightness-[0.85] contrast-[1.05]"
                  alt="Hero Portrait"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-ivory/20 to-ivory" />
                <LightGlow />
                <FloatingPetals />
                <ForegroundOrnaments />
              </motion.div>
            </div>

            {/* Content Overlay - Names (Top) */}
            <div className="relative z-10 text-center pt-6 md:pt-6 w-full">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1.5, delay: 0.5 }}
              >
                <h1 className="font-dayland text-7xl md:text-[8rem] leading-none text-ink drop-shadow-sm">
                  <span className="block">Dani</span>
                  <span className="block text-gold text-4xl md:text-5xl my-2 md:my-4">&</span>
                  <span className="block">Marini</span>
                </h1>
              </motion.div>
            </div>

            {/* Content Overlay - Date (Bottom) */}
            <div className="relative z-10 text-center w-full">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1.5, delay: 1 }}
                className="space-y-6"
              >
                <div className="w-12 h-px bg-gold/30 mx-auto" />
                <div className="space-y-3">
                  <p className="font-display italic text-3xl md:text-5xl text-ink/80">Sabtu, 29 Agustus 2026</p>
                  <p className="font-sans text-[8px] tracking-[0.6rem] uppercase text-gold font-medium">Surabaya . Indonesia</p>
                </div>
              </motion.div>
            </div>
          </section>

          <section id="couple-section" className="relative min-h-screen py-6 bg-ivory flex items-center">
            <div className="container mx-auto px-6 max-w-5xl">

              <div className="grid pt-6 md:grid-cols-2 gap-8 items-center relative">

                {/* Overlapping Portraits Design - Refined Organic Blobs */}
                <div className="relative h-[400px] md:h-[500px] w-full flex items-center justify-center">

                  {/* Groom Frame - Floating Liquid Blob */}
                  <motion.div
                    initial={{ opacity: 0, x: -40, scale: 0.9 }}
                    whileInView={{
                      opacity: 1,
                      x: 0,
                      scale: 1,
                    }}
                    viewport={{ once: true }}
                    className="absolute top-0 left-4 w-[65%] h-[65%] z-10"
                  >
                    <motion.div
                      animate={{
                        borderRadius: [
                          "40% 60% 70% 30% / 40% 50% 60% 50%",
                          "50% 50% 30% 70% / 50% 60% 40% 60%",
                          "40% 60% 70% 30% / 40% 50% 60% 50%",
                        ]
                      }}
                      transition={{
                        duration: 12,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                      className="w-full h-full overflow-hidden shadow-2xl relative group"
                    >
                      <img
                        src="/groom_face_potrait.jpeg"
                        className="w-full h-full object-cover filter saturate-[1.05] contrast-[1.02] hover:scale-105 transition-all duration-1000"
                        alt="Dani"
                      />
                      <div className="absolute inset-0 bg-gold/5 mix-blend-soft-light group-hover:bg-transparent transition-colors" />
                    </motion.div>
                    {/* Decorative ring following the blob logic */}
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
                      className="absolute -inset-4 border border-gold/20 rounded-[45%_55%_65%_35%] -z-10"
                    />
                  </motion.div>

                  {/* Bride Frame - Floating Liquid Blob */}
                  <motion.div
                    initial={{ opacity: 0, x: 40, y: 40, scale: 0.9 }}
                    whileInView={{
                      opacity: 1,
                      x: 0,
                      y: 0,
                      scale: 1,
                    }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.3 }}
                    className="absolute bottom-4 right-4 w-[65%] h-[65%] z-20"
                  >
                    <motion.div
                      animate={{
                        borderRadius: [
                          "50% 50% 30% 70% / 50% 60% 40% 60%",
                          "60% 40% 60% 40% / 40% 50% 40% 60%",
                          "50% 50% 30% 70% / 50% 60% 40% 60%",
                        ]
                      }}
                      transition={{
                        duration: 15,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                      className="w-full h-full overflow-hidden shadow-2xl relative group bg-sepia"
                    >
                      <img
                        src="/bride_face_potrait.jpeg"
                        className="w-full h-full object-cover filter saturate-[1.05] contrast-[1.02] scale-110 hover:scale-115 transition-all duration-1000"
                        alt="Marini"
                      />
                      <div className="absolute inset-0 bg-gold/5 mix-blend-soft-light group-hover:bg-transparent transition-colors" />
                    </motion.div>
                    <motion.div
                      animate={{ rotate: -360 }}
                      transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
                      className="absolute -inset-3 border border-gold/40 rounded-[55%_45%_35%_65%] -z-10"
                    />
                  </motion.div>
                </div>

                {/* Dense Portrait Info */}
                <motion.div
                  initial="initial"
                  whileInView="animate"
                  viewport={{ once: true }}
                  variants={stagger}
                  className="flex flex-col mt-0 pt-0 gap-3 md:pl-16 text-center md:text-left"
                >
                  <motion.div variants={fadeUp}>
                    <p className="text-[9px] uppercase tracking-[0.5em] text-gold mb-1 font-black">Mempelai Pria</p>
                    <h3 className="font-serif text-3xl md:text-5xl leading-none mb-1 tracking-tighter">M. Daniansyah Chusyaidin, S.Kom</h3>
                    <p className="text-[10px] tracking-widest text-ink/40">Putra Bapak M. Safiudin Sukri & Ibu Indiarti</p>
                  </motion.div>

                  <motion.div variants={fadeUp} className="flex justify-center md:justify-start items-center gap-4">
                    <div className="h-px w-12 bg-gold/20" />
                    <Heart className="w-3 h-3 text-gold/30" />
                    <div className="h-px w-12 bg-gold/20" />
                  </motion.div>

                  <motion.div variants={fadeUp}>
                    <p className="text-[9px] uppercase tracking-[0.5em] text-gold mb-1 font-black">Mempelai Wanita</p>
                    <h3 className="font-serif text-3xl md:text-5xl leading-none mb-1 tracking-tighter">Siti Nur Marini, A.Md.M</h3>
                    <p className="text-[10px] tracking-widest text-ink/40">Putri Bapak Margono & Ibu (Almh) Sulami</p>
                  </motion.div>
                </motion.div>

              </div>

            </div>
          </section>

          {/* --- [4] THE JOURNEY (CINEMATIC) --- */}
          <CinematicStory />

          {/* --- [3] THE EVENT (REFINED & EFFICIENT) --- */}
          <section className="relative py-6 bg-ivory overflow-hidden">
            <div className="container mx-auto px-6 max-w-lg relative z-10">
              
              {/* Reading Flow: Vertical stack of information */}
              <div className="flex flex-col items-center text-center">
                
                {/* 1. Countdown (Primary Emotional Hook) */}
                <motion.div 
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: 0.1 }}
                  className="mb-6 w-full max-w-xs"
                >
                  <p className="text-[10px] uppercase tracking-[0.4em] text-gold font-black mb-4">Menuju Hari Bahagia</p>
                  <CountdownTimer targetDate="2026-08-29T09:00:00" />
                </motion.div>

                {/* 2. Event Date */}
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                  className="mb-8"
                >
                  <h2 className="font-serif text-3xl md:text-4xl text-ink italic tracking-tight">Sabtu, 29 Agustus 2026</h2>
                </motion.div>

                {/* 3. Akad & Resepsi (Core Block) */}
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: 0.3 }}
                  className="w-full mb-8"
                >
                  <div className="flex justify-center items-center gap-10 md:gap-16 border-y border-gold/10 py-5">
                    <div className="flex flex-col">
                      <span className="font-serif text-2xl italic text-ink mb-1">Akad Nikah</span>
                      <span className="font-mono text-[10px] text-gold font-bold uppercase tracking-[0.2em]">09:00 — 10:00</span>
                    </div>
                    {/* Vertical Divider */}
                    <div className="w-px h-8 bg-gold/20" />
                    <div className="flex flex-col">
                      <span className="font-serif text-2xl italic text-ink mb-1">Resepsi</span>
                      <span className="font-mono text-[10px] text-gold font-bold uppercase tracking-[0.2em]">10:00 — 13:00</span>
                    </div>
                  </div>
                </motion.div>

                {/* 4. Location */}
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: 0.4 }}
                  className="mb-8 text-center"
                >
                  <div className="flex justify-center items-center gap-2 mb-2">
                    <MapPin className="w-3.5 h-3.5 text-gold/60" />
                    <p className="font-serif italic text-xl text-ink/80">Gedung Wanita Candra Kencana</p>
                  </div>
                  <p className="text-[12px] text-ink/50 font-light max-w-[280px] mx-auto leading-relaxed">
                    Jl. Kalibokor Selatan No.2, Baratajaya, Gubeng, Surabaya
                  </p>
                </motion.div>

                {/* 5. CTA Actions */}
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: 0.5 }}
                  className="flex flex-wrap justify-center gap-4"
                >
                  <motion.a
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    href="https://maps.app.goo.gl/YourMapLink"
                    target="_blank"
                    className="inline-flex items-center gap-2 py-2.5 px-6 bg-ink text-gold rounded-full text-[9px] uppercase tracking-[0.3em] font-black transition-all shadow-md"
                  >
                    <MapPin className="w-3 h-3" />
                    <span>Lihat Peta</span>
                  </motion.a>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      const event = {
                        title: "Pernikahan Dani & Marini",
                        start: "20260829T090000",
                        end: "20260829T130000",
                        location: "Gedung Wanita Candra Kencana, Surabaya"
                      };
                      window.open(`https://www.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(event.title)}&dates=${event.start}/${event.end}&details=Pernikahan+kami&location=${encodeURIComponent(event.location)}&sf=true&output=xml`);
                    }}
                    className="inline-flex items-center gap-2 py-2.5 px-6 border border-ink/10 text-ink/60 rounded-full text-[9px] uppercase tracking-[0.3em] font-black transition-all bg-white/50 backdrop-blur-sm"
                  >
                    <Calendar className="w-3 h-3" />
                    <span>Ke Kalender</span>
                  </motion.button>
                </motion.div>
              </div>

            </div>
          </section>

          {/* --- [7] TWIBBON (INSTANT GENERATOR) --- */}
          <section id="twibbon-section" className="relative py-6 bg-ivory overflow-hidden">
            <div className="w-full h-full relative z-10 flex flex-col items-center">
              <TwibbonCreator />
            </div>
          </section>

          {/* --- [5] RSVP & WISHES (ELEGANT INTEGRATION) --- */}
          <section id="rsvp-section" className="relative py-6 bg-ivory/50 overflow-hidden">
            {/* Background Aesthetic Gimmick */}
            <div className="absolute inset-0 pointer-events-none">
              <motion.div
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.3, 0.5, 0.3]
                }}
                transition={{ duration: 15, repeat: Infinity }}
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-gold/5 rounded-full blur-[120px]"
              />
            </div>

            <div className="container h-full mx-auto px-6 max-w-4xl relative z-10">
              <div className="flex flex-col h-full items-center">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="text-center mb-10 w-full"
                >
                  <div className="flex justify-center items-center gap-4 mb-3">
                    <div className="h-px w-8 bg-gold/30" />
                    <MessageSquare className="w-5 h-5 text-gold/60" />
                    <div className="h-px w-8 bg-gold/30" />
                  </div>
                  <p className="font-serif text-[15px] italic tracking-[0.4em] text-gold uppercase">RSVP & Wishes</p>
                </motion.div>

                {/* Wishes Feed (Primary Focus) */}
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="w-full flex flex-col h-full relative"
                >
                  {/* Floating Action Button for RSVP */}
                  <div className="absolute -top-12 -right-3 z-20">
                    <motion.button
                      whileHover={{ scale: 1.1, y: -2 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setIsRSVPModalOpen(true)}
                      className="w-14 h-14 bg-gradient-to-br from-gold via-gold/80 to-gold text-white rounded-full transition-all duration-500 flex items-center justify-center shadow-[0_10px_40px_rgba(212,175,55,0.3)] group border border-white/20"
                      title="Kirim Doa"
                    >
                      <MessageSquare className="w-6 h-6 transition-transform duration-500 group-hover:scale-110" />
                    </motion.button>
                  </div>

                  {/* Feed Area */}
                  <div className="flex flex-col h-full relative">
                    <div className="px-0.5">
                      {wishes.length === 0 ? (
                        <div className="h-[25vh] flex flex-col items-center justify-center border border-dashed border-gold/20 rounded-2xl bg-gold/5 px-6 text-center">
                          <Heart className="w-4 h-4 text-gold/30 mb-2 animate-pulse" />
                          <p className="text-[9px] opacity-40 italic font-serif tracking-widest uppercase">Belum ada doa.</p>
                        </div>
                      ) : (
                        <div className="w-full h-full">
                          <div className="h-full grid grid-cols-1 md:grid-cols-2 gap-2 content-start">
                            <AnimatePresence mode="popLayout">
                              {currentWishes.map((wish, idx) => (
                                <motion.div
                                  key={wish.id}
                                  initial={{ opacity: 0, scale: 0.95 }}
                                  animate={{ opacity: 1, scale: 1 }}
                                  exit={{ opacity: 0, scale: 0.95 }}
                                  transition={{ duration: 0.25, delay: idx * 0.02 }}
                                  className="w-full bg-white/60 p-2.5 rounded-xl border border-gold/5 relative group hover:border-gold/20 transition-all shadow-sm"
                                >
                                  {/* Ultra Compact Identity Bar */}
                                  <div className="flex justify-between items-center mb-1">
                                    <div className="flex items-center gap-1.5 overflow-hidden">
                                      <p className="text-ink font-bold uppercase text-[8px] tracking-tight truncate max-w-[90px]">{wish.name}</p>
                                      <span className={`text-[5.5px] px-1 py-0 rounded-full border border-gold/5 font-black uppercase tracking-tighter shrink-0 ${wish.attendance === 'yes' ? 'bg-gold/10 text-gold' : 'bg-ink/5 text-ink/20'}`}>
                                        {wish.attendance === 'yes' ? 'Hadir' : 'Absen'}
                                      </span>
                                    </div>
                                    <span className="text-[7px] text-ink/10 font-bold uppercase tracking-tighter shrink-0">{formatDate(wish.createdAt)}</span>
                                  </div>
                                  
                                  {/* The Wish - Ultra Compact */}
                                  <p className="font-serif italic text-[11.5px] leading-[1.25] text-ink/65 line-clamp-2">"{wish.message}"</p>
                                </motion.div>
                              ))}
                            </AnimatePresence>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Pagination Bar */}
                    {totalPages > 1 && (
                      <div className="h-fit flex justify-center items-center gap-4 shrink-0 border-t border-gold/10 py-6 mt-6">
                        <motion.button
                          whileHover={{ scale: 1.1, backgroundColor: 'rgba(212, 175, 55, 0.05)' }}
                          whileTap={{ scale: 0.9 }}
                          disabled={currentPage === 1}
                          onClick={() => setCurrentPage(p => p - 1)}
                          className="w-9 h-9 flex items-center justify-center rounded-full border border-gold/10 text-gold disabled:opacity-10 transition-all bubble-glow"
                        >
                          <ArrowRight className="w-3 h-3 rotate-180" />
                        </motion.button>

                        <div className="text-center">
                          <span className="text-[9px] font-black uppercase tracking-[0.2em] text-gold/60">
                            {currentPage} / {totalPages}
                          </span>
                        </div>

                        <motion.button
                          whileHover={{ scale: 1.1, backgroundColor: 'rgba(212, 175, 55, 0.05)' }}
                          whileTap={{ scale: 0.9 }}
                          disabled={currentPage === totalPages}
                          onClick={() => setCurrentPage(p => p + 1)}
                          className="w-9 h-9 flex items-center justify-center rounded-full border border-gold/10 text-gold disabled:opacity-10 transition-all bubble-glow"
                        >
                          <ArrowRight className="w-3 h-3" />
                        </motion.button>
                      </div>
                    )}
                  </div>
                </motion.div>
              </div>
            </div>
          </section>

          {/* --- [MODAL] RSVP & WISHES --- */}
          <AnimatePresence>
            {isRSVPModalOpen && (
              <div className="fixed inset-0 z-[200] flex items-center justify-center px-6 py-6">
                {/* Backdrop */}
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setIsRSVPModalOpen(false)}
                  className="absolute inset-0 bg-ink/80 backdrop-blur-md"
                />

                {/* Modal Content */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 10 }}
                  className="relative w-full max-w-md bg-ivory p-6 md:p-6 rounded-[2.5rem] border border-gold/20 shadow-2xl overflow-hidden"
                >
                  {/* Subtle Grainy Overlay or Decorative Element */}
                  <div className="absolute -top-10 -right-10 pointer-events-none opacity-[0.03]">
                    <Heart className="w-48 h-48 text-gold" fill="currentColor" />
                  </div>

                  <div className="relative z-10">
                    <div className="flex justify-between items-start mb-8">
                      <div className="space-y-1">
                        <span className="text-[8px] uppercase tracking-[0.4em] text-gold font-black block">Konfirmasi Kehadiran</span>
                        <h3 className="font-serif italic text-2xl text-ink">Beri Doa & Harapan</h3>
                      </div>
                      <button 
                        onClick={() => setIsRSVPModalOpen(false)}
                        className="w-8 h-8 flex items-center justify-center hover:bg-gold/5 rounded-full transition-colors text-ink/40 hover:text-gold"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    <form onSubmit={handleRSVPSubmit} className="space-y-6">
                      <div className="relative group">
                        <label className="text-[9px] uppercase tracking-[0.2em] text-gold/90 font-bold mb-1 block">Nama Lengkap</label>
                        <input
                          name="name" required type="text" placeholder={guestName}
                          className="w-full bg-transparent border-b border-gold/20 py-2 outline-none focus:border-gold transition-all font-serif italic text-lg text-ink placeholder:text-ink/30"
                        />
                      </div>

                      <div className="relative group">
                        <label className="text-[9px] uppercase tracking-[0.2em] text-gold/90 font-bold mb-1.5 block">Status Kehadiran</label>
                        <div className="flex gap-3">
                          <label className="flex-1 cursor-pointer">
                            <input type="radio" name="attendance" value="yes" defaultChecked className="hidden peer" />
                            <div className="w-full py-2.5 text-center border border-gold/20 rounded-xl peer-checked:border-gold peer-checked:bg-gold/5 transition-all text-ink/60 peer-checked:text-gold uppercase text-[8px] font-black tracking-widest leading-none">
                              Hadir
                            </div>
                          </label>
                          <label className="flex-1 cursor-pointer">
                            <input type="radio" name="attendance" value="no" className="hidden peer" />
                            <div className="w-full py-2.5 text-center border border-gold/20 rounded-xl peer-checked:border-gold peer-checked:bg-gold/5 transition-all text-ink/60 peer-checked:text-gold uppercase text-[8px] font-black tracking-widest leading-none">
                              Absen
                            </div>
                          </label>
                        </div>
                      </div>

                      <div className="relative group">
                        <label className="text-[9px] uppercase tracking-[0.2em] text-gold/90 font-bold mb-1 block">Pesan Tulus Anda</label>
                        <textarea
                          name="message" required rows={3} placeholder="Tuliskan harapan indah Anda..."
                          className="w-full bg-transparent border-b border-gold/20 py-2 outline-none focus:border-gold transition-all resize-none font-serif italic text-base text-ink placeholder:text-ink/30"
                        />
                      </div>

                      <motion.button
                        whileHover={{ scale: 1.01, backgroundColor: "#1A1A1A", color: "#D4AF37" }}
                        whileTap={{ scale: 0.98 }}
                        type="submit"
                        className="w-full py-4 bg-ink text-gold rounded-full text-[10px] tracking-[0.35em] font-black uppercase transition-all duration-500 shadow-xl mt-2"
                      >
                        Kirimkan Doa
                      </motion.button>
                    </form>
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>

          {/* --- [6] DIGITAL ENVELOPE (ELEGANT GIVING) --- */}
          <section id="gift-section" className="relative py-6 bg-ivory overflow-hidden">
            {/* Artistic Flowing Background */}
            <div className="absolute inset-0 pointer-events-none opacity-[0.4]">
              <motion.div
                animate={{
                  rotate: [0, 360],
                  scale: [1, 1.2, 1]
                }}
                transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
                className="absolute -top-1/4 -left-1/4 w-full h-full border border-gold/5 rounded-full"
              />
              <motion.div
                animate={{
                  rotate: [360, 0],
                  scale: [1, 1.3, 1]
                }}
                transition={{ duration: 50, repeat: Infinity, ease: "linear" }}
                className="absolute -bottom-1/4 -right-1/4 w-full h-full border border-gold/5 rounded-full"
              />
            </div>

            <div className="container mx-auto px-6 max-w-4xl relative z-10">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-center mb-10"
              >
                <div className="flex justify-center items-center gap-4 mb-3">
                  <div className="h-px w-8 bg-gold/30" />
                  <Gift className="w-5 h-5 text-gold/60" />
                  <div className="h-px w-8 bg-gold/30" />
                </div>
                <p className="font-serif text-[15px] italic tracking-[0.4em] text-gold uppercase">Tanda Kasih</p>
                <p className="text-[10px] md:text-[11px] text-ink/50 mt-4 leading-relaxed max-w-sm mx-auto italic font-light">
                  Kehadiran dan doa Anda adalah kado terindah. Jika ingin memberi tanda kasih, dapat melalui:
                </p>

                <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 max-w-5xl mx-auto">
                  {[
                    { bank: "BCA", account: "1234567890", owner: "M. Daniansyah C." },
                    { bank: "BRI", account: "0987654321", owner: "Siti Nur Marini" },
                    { bank: "Mandiri", account: "111222333444", owner: "M. Daniansyah C." },
                    { bank: "BSI", account: "777888999000", owner: "Siti Nur M." },
                    { bank: "Gopay", account: "08123456789", owner: "Daniansyah" },
                    { bank: "DANA", account: "08987654321", owner: "Siti Nur" }
                  ].map((gift, i) => (
                    <motion.div
                      key={i}
                      whileHover={{ y: -3, scale: 1.01 }}
                      onClick={() => handleCopy(gift.account, i)}
                      className="bg-white/40 backdrop-blur-md p-3 md:p-4 rounded-xl border border-white/60 flex flex-col items-center gap-1 group cursor-pointer shadow-sm transition-all relative overflow-hidden"
                    >
                      <div className="absolute -top-4 -right-4 w-12 h-12 bg-gold/5 rounded-full blur-xl group-hover:scale-150 transition-transform duration-700" />

                      <div className="relative z-10 w-full flex flex-col items-center text-center">
                        <p className="text-[7px] uppercase tracking-widest text-gold/80 font-bold mb-1">{gift.bank}</p>

                        <div className="flex flex-col items-center gap-1 mb-1.5">
                          <span className="font-serif text-lg md:text-xl tracking-tight text-ink group-hover:text-gold transition-colors leading-none">{gift.account}</span>
                          <div className={`px-2 py-0.5 rounded-full text-[6.5px] uppercase tracking-tighter font-black transition-all ${copiedIndex === i ? 'bg-green-500 text-white shadow-sm' : 'bg-gold/5 text-gold/50 group-hover:bg-gold group-hover:text-white'}`}>
                            {copiedIndex === i ? 'Tersalin' : 'Salin'}
                          </div>
                        </div>

                        <div className="pt-1.5 border-t border-gold/5 w-full">
                          <p className="text-[7.5px] text-ink/30 uppercase tracking-tight font-medium truncate">A/N {gift.owner}</p>
                        </div>
                      </div>

                      {/* Success Checkmark Mask - Compact */}
                      <AnimatePresence>
                        {copiedIndex === i && (
                          <motion.div
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0, opacity: 0 }}
                            className="absolute inset-0 bg-white/95 backdrop-blur-md flex flex-col items-center justify-center z-20"
                          >
                            <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center mb-1 shadow-md">
                              <Check className="w-5 h-5 text-white" />
                            </div>
                            <p className="font-serif italic text-xs text-ink">Disalin</p>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </div>
          </section>

          {/* --- [7] PHOTO GALLERY (AESTHETIC GRID) --- */}
          <section className="relative py-6 bg-paper overflow-hidden">
            {/* Decorative Background Elements */}
            <div className="absolute top-0 left-0 w-64 h-64 bg-gold/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-sepia/20 rounded-full blur-3xl translate-x-1/3 translate-y-1/3" />

            <div className="container mx-auto px-6 relative z-10">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-center mb-10"
              >
                <div className="flex justify-center items-center gap-4 mb-3">
                  <div className="h-px w-8 bg-gold/30" />
                  <Camera className="w-5 h-5 text-gold/60" />
                  <div className="h-px w-8 bg-gold/30" />
                </div>
                <p className="font-serif text-[15px] italic tracking-[0.4em] text-gold">Beberapa Momen yang Kami Simpan, dan Kini Ingin Kami Bagikan.</p>
              </motion.div>

              <div className="overflow-x-auto pb-4 -mx-4 px-4">
  <div
    className="py-5 grid grid-rows-[200px_200px] md:grid-rows-[280px_280px] grid-flow-col-dense gap-4 md:gap-6 auto-cols-[150px] md:auto-cols-[210px]"
  >
    {[
      { src: "/bride_face_potrait.jpeg", span: "col-span-1 row-span-1", shape: "rounded-[2rem_5rem_2rem_5rem]" },
      { src: "/bride_and_groom_full_body_potrait.jpeg", span: "col-span-2 row-span-2", shape: "rounded-[4rem_2rem_6rem_3rem]" },
      { src: "/groom_face_potrait.jpeg", span: "col-span-1 row-span-1", shape: "rounded-[5rem_2rem_4rem_6rem]" },
      { src: "/bride_and_groom_half_body_potrait.png", span: "col-span-2 row-span-1", shape: "rounded-[2rem_6rem_3rem_5rem]" },
      { src: "/bride_face_potrait.jpeg", span: "col-span-1 row-span-2", shape: "rounded-[6rem_3rem_5rem_2rem]" },
      { src: "/groom_face_potrait.jpeg", span: "col-span-1 row-span-1", shape: "rounded-[3rem_5rem_2rem_6rem]" },
      { src: "/bride_and_groom_half_body_potrait.png", span: "col-span-1 row-span-1", shape: "rounded-[4rem_2rem_3rem_5rem]" },
      { src: "/bride_and_groom_full_body_potrait.jpeg", span: "col-span-1 row-span-1", shape: "rounded-[2rem_5rem_4rem_2rem]" },
      { src: "/bride_face_potrait.jpeg", span: "col-span-2 row-span-1", shape: "rounded-[5rem_2rem_6rem_4rem]" },
      { src: "/groom_face_potrait.jpeg", span: "col-span-1 row-span-1", shape: "rounded-[3rem_6rem_2rem_4rem]" },
      { src: "/bride_and_groom_half_body_potrait.png", span: "col-span-1 row-span-1", shape: "rounded-[6rem_2rem_5rem_3rem]" },
      { src: "/bride_and_groom_full_body_potrait.jpeg", span: "col-span-2 row-span-1", shape: "rounded-[2rem_4rem_6rem_5rem]" },
    ].map((item, i) => (
      <motion.div
        key={i}
        initial={{ opacity: 0, scale: 0.9 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, delay: i * 0.1 }}
        whileHover={{ y: -10, scale: 1.02 }}
        onClick={() => setSelectedPhoto(item.src)}
        className={`${item.span} relative group overflow-hidden shadow-2xl ${item.shape} cursor-zoom-in isolate transform-gpu [-webkit-mask-image:-webkit-radial-gradient(white,black)]`}
      >
        <img
          src={item.src}
          alt={`Gallery ${i}`}
          className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110 [backface-visibility:hidden]"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-ink/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-center justify-center">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            whileHover={{ y: 0, opacity: 1 }}
            className="bg-white/20 backdrop-blur-md p-4 rounded-full border border-white/30"
          >
            <ImageIcon className="w-5 h-5 text-white" />
          </motion.div>
        </div>
      </motion.div>
    ))}
  </div>
</div>

              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                className="mt-10 text-center"
              >
                <p className="font-serif italic text-ink/40 text-lg">Setiap foto menyimpan cerita yang tidak selalu mudah, tapi selalu kami pilih untuk lanjutkan.</p>
              </motion.div>
            </div>
          </section>

          {/* --- FOOTER (A SHARED MASTERPIECE) --- */}
          <footer className="relative py-6 bg-ivory overflow-hidden border-t border-gold/10">
            <div className="container mx-auto px-6 relative z-10">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="max-w-4xl mx-auto text-center"
              >
                {/* Joint Identity */}
                <div className="mb-5">
                  <h4 className="font-dayland text-5xl md:text-6xl text-ink mb-2">Dani & Marini</h4>
                  <p className="text-[12px] tracking-[0.2em] text-gold font-serif italic">Sebuah Cerita dari Perjalanan yang Kami Jalani dan Bangun Bersama, Dengan Keyakinan yang Sama</p>
                </div>

                {/* The Collaboration Detail */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                  {/* Dani's Part */}
                  <div className="p-3 rounded-[2.5rem] bg-paper/50 border border-gold/5 flex flex-col items-center">
                    <div className="w-12 h-12 rounded-full bg-gold/5 flex items-center justify-center mb-2 text-gold/60">
                      <Code className="w-5 h-5" />
                    </div>
                    <h5 className="font-serif italic text-xl text-ink mb-2">M. Daniansyah C.</h5>
                    <p className="text-xs text-ink/50 leading-relaxed mb-2 max-w-[240px]">
                      Menulis setiap baris code di balik halaman ini, merangkainya satu per satu sampai akhirnya bisa bercerita tentang kami.
                    </p>
                    <div className="flex gap-4 opacity-30 hover:opacity-100 transition-opacity">
                      <motion.a href="#" whileHover={{ y: -3, color: "#B48D3E" }} className="text-ink"><Instagram className="w-4 h-4" /></motion.a>
                      <motion.a href="#" whileHover={{ y: -3, color: "#B48D3E" }} className="text-ink"><Twitter className="w-4 h-4" /></motion.a>
                    </div>
                  </div>

                  {/* Marini's Part */}
                  <div className="p-3 rounded-[2.5rem] bg-paper/50 border border-gold/5 flex flex-col items-center">
                    <div className="w-12 h-12 rounded-full bg-gold/5 flex items-center justify-center mb-2 text-gold/60">
                      <Palette className="w-5 h-5" />
                    </div>
                    <h5 className="font-serif italic text-xl text-ink mb-2">Siti Nur Marini</h5>
                    <p className="text-xs text-ink/50 leading-relaxed mb-2 max-w-[240px]">
                      Menjadikan setiap bagian tidak hanya terlihat indah, tapi juga hingga semuanya benar-benar seperti kami.
                    </p>
                    <div className="flex gap-4 opacity-30 hover:opacity-100 transition-opacity">
                      <motion.a href="#" whileHover={{ y: -3, color: "#B48D3E" }} className="text-ink"><Instagram className="w-4 h-4" /></motion.a>
                      <motion.a href="#" whileHover={{ y: -3, color: "#B48D3E" }} className="text-ink"><Facebook className="w-4 h-4" /></motion.a>
                    </div>
                  </div>
                </div>

                <div className="pt-1 border-t border-gold/5 mb-8">
                  <div className="flex justify-center items-center gap-2 mb-2">
                    <Heart className="w-3 h-3 text-gold fill-gold" />
                  </div>
                  <p className="text-[8px] text-ink/20 tracking-widest uppercase">© 2026. Kami membangunnya bersama, dari perjalanan kami.</p>
                </div>
              </motion.div>
            </div>
          </footer>

          {/* --- PHOTO ZOOM MODAL --- */}
          <AnimatePresence>
            {selectedPhoto && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setSelectedPhoto(null)}
                className="fixed inset-0 z-[2000] flex items-center justify-center bg-ink/90 backdrop-blur-xl p-4 md:p-6 cursor-zoom-out"
              >
                <motion.div
                  initial={{ scale: 0.8, opacity: 0, y: 20 }}
                  animate={{ scale: 1, opacity: 1, y: 0 }}
                  exit={{ scale: 0.8, opacity: 0, y: 20 }}
                  transition={{ type: "spring", stiffness: 300, damping: 25 }}
                  className="relative max-w-5xl w-full max-h-full flex items-center justify-center p-2 rounded-[2rem] bg-white/10 border border-white/20 overflow-hidden"
                  onClick={(e) => e.stopPropagation()}
                >
                  <img
                    src={selectedPhoto}
                    alt="Zoomed Moment"
                    className="max-w-full max-h-[85vh] object-contain rounded-[1.5rem]"
                  />

                  <button
                    onClick={() => setSelectedPhoto(null)}
                    className="absolute top-6 right-6 w-12 h-12 flex items-center justify-center bg-white/20 hover:bg-white/40 text-white rounded-full backdrop-blur-md transition-all border border-white/20 group"
                  >
                    <Camera className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                  </button>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

        </main>
      )}
    </div>
  );
}
