'use client';
import { useState, useCallback } from 'react';
import { WeddingDocument, WeddingTheme, ThemeColors } from '../../types/firestore';
import { THEME_DEFAULTS } from '../../constants/themeDefaults';
import { Check } from 'lucide-react';

const COLOR_PRESETS: { name: string; colors: ThemeColors }[] = [
  {
    name: 'Classic Gold',
    colors: { accent: '#B48D3E', background: '#FDFCF8', text: '#1A1A1A', surface: '#F5F2ED', button: '#F8BBD0' },
  },
  {
    name: 'Rose',
    colors: { accent: '#C47A7A', background: '#FDF7F7', text: '#2D1F1F', surface: '#F5EDED', button: '#E8A0A0' },
  },
  {
    name: 'Sage',
    colors: { accent: '#7A9E7E', background: '#F7FAF7', text: '#1A2E1A', surface: '#EDF2ED', button: '#A8C5AB' },
  },
  {
    name: 'Dusty Blue',
    colors: { accent: '#6B8EA8', background: '#F6F9FB', text: '#1A2530', surface: '#ECF1F5', button: '#9BBDD4' },
  },
  {
    name: 'Lavender',
    colors: { accent: '#9B7DB8', background: '#FAF7FD', text: '#201A2E', surface: '#F1EDF5', button: '#C4A8D8' },
  },
  {
    name: 'Peach',
    colors: { accent: '#D4926C', background: '#FDF9F6', text: '#2E1E14', surface: '#F5EDE7', button: '#EABC9E' },
  },
  {
    name: 'Mauve',
    colors: { accent: '#A87A8F', background: '#FCF7F9', text: '#2A1A22', surface: '#F3ECF0', button: '#CDA5B5' },
  },
  {
    name: 'Mint',
    colors: { accent: '#5EA8A0', background: '#F5FBFA', text: '#142E2B', surface: '#E8F3F1', button: '#8DC8C2' },
  },
  {
    name: 'Champagne',
    colors: { accent: '#C4A265', background: '#FDFBF5', text: '#2B2410', surface: '#F5F1E6', button: '#E0CC9A' },
  },
  {
    name: 'Blush',
    colors: { accent: '#D48B9E', background: '#FDF6F8', text: '#2E1620', surface: '#F5ECF0', button: '#E8B4C3' },
  },
];

const FONT_FIELDS = [
  { key: 'heading' as const, label: 'Judul' },
  { key: 'body' as const, label: 'Isi' },
  { key: 'decorative' as const, label: 'Dekoratif' },
  { key: 'script' as const, label: 'Tulisan Tangan' },
];

const FONT_OPTIONS = [
  'Cormorant Garamond', 'Playfair Display', 'Montserrat', 'Lora',
  'Merriweather', 'Poppins', 'Raleway', 'Open Sans', 'Roboto Slab',
  'Dancing Script', 'Great Vibes', 'Parisienne', 'Alex Brush', 'Dayland',
];

interface CustomizeFormProps {
  data: WeddingDocument | null;
  slug: string;
  onSave: (fields: Partial<WeddingDocument>, files?: Record<string, File>, urlsToDelete?: string[]) => void;
  isSaving?: boolean;
  onDirty?: () => void;
  step?: number;
  totalSteps?: number;
}

function colorsMatch(a: ThemeColors, b: ThemeColors): boolean {
  return a.accent === b.accent && a.background === b.background && a.text === b.text && a.surface === b.surface && a.button === b.button;
}

export function CustomizeForm({ data, slug, onSave, isSaving, onDirty, step, totalSteps }: CustomizeFormProps) {
  const currentTheme = data?.theme ?? THEME_DEFAULTS.cinematic;
  const [colors, setColors] = useState({ ...currentTheme.colors });
  const [fonts, setFonts] = useState({ ...currentTheme.fonts });
  const [previewKey, setPreviewKey] = useState(0);

  const handlePreviewToggle = useCallback((e: React.ToggleEvent<HTMLDetailsElement>) => {
    if (e.newState === 'open') setPreviewKey(k => k + 1);
  }, []);

  const selectPreset = (preset: ThemeColors) => {
    setColors({ ...preset });
    onDirty?.();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const theme: WeddingTheme = { template: currentTheme.template, colors, fonts };
    onSave({ theme });
  };

  const inputClass = 'w-full px-3 py-2.5 border border-gold/20 rounded-xl text-sm bg-white focus:outline-none focus:border-gold/50 transition-colors';

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Color palette card */}
      <div className="bg-white rounded-2xl border border-gold/10 shadow-sm overflow-hidden">
        <div className="border-l-4 border-gold px-4 py-3 bg-gold/[0.03]">
          <h3 className="font-base text-[13px] text-ink">Tema Warna</h3>
        </div>
        <div className="p-4">
          <div className="grid grid-cols-5 gap-2">
            {COLOR_PRESETS.map((preset) => {
              const isSelected = colorsMatch(colors, preset.colors);
              return (
                <button
                  key={preset.name}
                  type="button"
                  onClick={() => selectPreset(preset.colors)}
                  className={`relative flex flex-col items-center gap-1.5 p-2 rounded-xl border-2 transition-all ${
                    isSelected ? 'border-gold shadow-sm' : 'border-gold/15 hover:border-gold/30'
                  }`}
                >
                  <div className="w-full aspect-square rounded-lg overflow-hidden flex flex-col border border-ink/10">
                    <div className="flex-1" style={{ backgroundColor: preset.colors.accent }} />
                    <div className="flex-1" style={{ backgroundColor: preset.colors.button }} />
                    <div className="flex-1 flex">
                      <div className="flex-1" style={{ backgroundColor: preset.colors.background }} />
                      <div className="flex-1" style={{ backgroundColor: preset.colors.surface }} />
                    </div>
                  </div>
                  <span className="text-[7px] font-bold text-ink/80 uppercase tracking-wider leading-tight text-center">{preset.name}</span>
                  {isSelected && (
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-gold rounded-full flex items-center justify-center">
                      <Check className="w-2.5 h-2.5 text-ivory" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Live preview */}
      <details className="bg-white rounded-2xl border border-gold/10 shadow-sm overflow-hidden" onToggle={handlePreviewToggle}>
        <summary className="border-l-4 border-gold px-4 py-3 bg-gold/[0.03] text-[13px] text-ink cursor-pointer">
          Preview Tema Undangan
        </summary>
        <div className="border-t border-gold/5 bg-ink/5 flex justify-center py-3">
          <div className="relative w-[200px] rounded-lg overflow-hidden border border-ink/10 shadow-sm" style={{ height: 355 }}>
            <iframe
              key={previewKey}
              src={`/${slug}`}
              title="Preview Tema Undangan"
              className="w-[375px] h-[667px] origin-top-left"
              style={{ transform: 'scale(0.533)' }}
              sandbox="allow-scripts allow-same-origin"
            />
          </div>
        </div>
        <p className="text-[9px] text-ink/80 text-center py-2 border-t border-gold/5">Simpan tema lalu tutup dan buka ulang preview untuk melihat perubahan</p>
      </details>

      {/* Fonts card */}
      <div className="bg-white rounded-2xl border border-gold/10 shadow-sm overflow-hidden">
        <div className="border-l-4 border-gold px-4 py-3 bg-gold/[0.03]">
          <h3 className="font-base text-[13px] text-ink">Font</h3>
        </div>
        <div className="p-4 space-y-3">
          {FONT_FIELDS.map(({ key, label }) => (
            <div key={key}>
              <label htmlFor={`font-${key}`} className="text-[11px] text-ink/80 font-medium block mb-1.5">{label}</label>
              <div className="flex items-center gap-2">
                <select id={`font-${key}`} value={fonts[key]} onChange={(e) => { setFonts(prev => ({ ...prev, [key]: e.target.value })); onDirty?.(); }} className={`${inputClass} w-[140px] flex-shrink-0`}>
                  {FONT_OPTIONS.map(f => (
                    <option key={f} value={f}>{f}</option>
                  ))}
                </select>
                <span className="text-sm text-ink/80 flex-1 truncate" style={{ fontFamily: `'${fonts[key]}', serif` }}>Contoh TEKS 123</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {step != null && totalSteps != null && totalSteps > 0 && (() => {
        const pct = Math.round(((step + 1) / totalSteps) * 100);
        const barColor = pct <= 25 ? 'bg-red-400' : pct <= 50 ? 'bg-orange-400' : pct <= 75 ? 'bg-yellow-400' : 'bg-green-500';
        return (
          <div className="space-y-1">
            <div className="h-2 bg-ink/5 rounded-full overflow-hidden">
              <div className={`h-full rounded-full transition-all duration-500 ${barColor}`} style={{ width: `${pct}%` }} />
            </div>
            <p className="text-[10px] text-ink/80 text-right">{step + 1} dari {totalSteps}</p>
          </div>
        );
      })()}

      <button type="submit" disabled={isSaving} className="w-full py-3 bg-gold text-ivory rounded-full text-xs tracking-[0.3em] font-black uppercase disabled:opacity-50 shadow-lg shadow-gold/20">{isSaving ? 'Menyimpan...' : 'Simpan & Lanjutkan'}</button>
    </form>
  );
}
