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
}

function colorsMatch(a: ThemeColors, b: ThemeColors): boolean {
  return a.accent === b.accent && a.background === b.background && a.text === b.text && a.surface === b.surface && a.button === b.button;
}

export function CustomizeForm({ data, slug, onSave, isSaving, onDirty }: CustomizeFormProps) {
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

  const inputClass = 'w-full px-3 py-2 border border-gold/20 rounded-lg text-sm bg-white focus:outline-none focus:border-gold/50';

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Color palette presets */}
      <fieldset className="space-y-2">
        <legend className="text-xs uppercase tracking-[0.3em] text-gold font-black mb-1">Tema Warna</legend>
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
                {/* Color swatch stack */}
                <div className="w-full aspect-square rounded-lg overflow-hidden flex flex-col border border-ink/10">
                  <div className="flex-1" style={{ backgroundColor: preset.colors.accent }} />
                  <div className="flex-1" style={{ backgroundColor: preset.colors.button }} />
                  <div className="flex-1 flex">
                    <div className="flex-1" style={{ backgroundColor: preset.colors.background }} />
                    <div className="flex-1" style={{ backgroundColor: preset.colors.surface }} />
                  </div>
                </div>
                <span className="text-[7px] font-bold text-ink/40 uppercase tracking-wider leading-tight text-center">{preset.name}</span>
                {isSelected && (
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-gold rounded-full flex items-center justify-center">
                    <Check className="w-2.5 h-2.5 text-ivory" />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </fieldset>

      {/* Live preview */}
      <details className="border border-gold/10 rounded-xl overflow-hidden" onToggle={handlePreviewToggle}>
        <summary className="px-4 py-2.5 text-[10px] uppercase tracking-widest text-gold font-black cursor-pointer hover:bg-gold/5 transition-colors">
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
        <p className="text-[9px] text-ink/25 text-center py-2 border-t border-gold/5">Simpan tema lalu tutup dan buka ulang preview untuk melihat perubahan</p>
      </details>

      {/* Fonts */}
      <fieldset className="space-y-2">
        <legend className="text-xs uppercase tracking-[0.3em] text-gold font-black mb-1">Font</legend>
        {FONT_FIELDS.map(({ key, label }) => (
          <div key={key} className="flex items-baseline gap-2">
            <label htmlFor={`font-${key}`} className="text-[10px] text-ink/50 w-12 flex-shrink-0">{label}</label>
            <select id={`font-${key}`} value={fonts[key]} onChange={(e) => { setFonts(prev => ({ ...prev, [key]: e.target.value })); onDirty?.(); }} className="px-2 py-1.5 border border-gold/20 rounded-lg text-xs bg-white focus:outline-none focus:border-gold/50 w-[120px] flex-shrink-0">
              {FONT_OPTIONS.map(f => (
                <option key={f} value={f}>{f}</option>
              ))}
            </select>
            <span className="text-base text-ink/40 flex-1" style={{ fontFamily: `'${fonts[key]}', serif` }}>Contoh TEKS 123</span>
          </div>
        ))}
      </fieldset>

      <button type="submit" disabled={isSaving} className="w-full py-3 bg-gold text-ivory rounded-full text-xs tracking-[0.3em] font-black uppercase disabled:opacity-50 shadow-lg shadow-gold/20">{isSaving ? 'Menyimpan...' : 'Simpan'}</button>
    </form>
  );
}
