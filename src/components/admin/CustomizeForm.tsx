'use client';
import { useState } from 'react';
import { WeddingDocument, WeddingTheme } from '../../types/firestore';
import { THEME_DEFAULTS } from '../../constants/themeDefaults';

const COLOR_FIELDS = [
  { key: 'accent' as const, label: 'Warna Aksen' },
  { key: 'background' as const, label: 'Warna Latar' },
  { key: 'text' as const, label: 'Warna Teks' },
  { key: 'surface' as const, label: 'Warna Permukaan' },
  { key: 'button' as const, label: 'Warna Tombol' },
];

const FONT_FIELDS = [
  { key: 'heading' as const, label: 'Font Judul' },
  { key: 'body' as const, label: 'Font Isi' },
  { key: 'decorative' as const, label: 'Font Dekoratif' },
  { key: 'script' as const, label: 'Font Tulisan Tangan' },
];

const FONT_OPTIONS = [
  'Cormorant Garamond', 'Playfair Display', 'Montserrat', 'Lora',
  'Merriweather', 'Poppins', 'Raleway', 'Open Sans', 'Roboto Slab',
  'Dancing Script', 'Great Vibes', 'Parisienne', 'Alex Brush', 'Dayland',
];

const TEMPLATE_OPTIONS = Object.keys(THEME_DEFAULTS);

interface CustomizeFormProps {
  data: WeddingDocument | null;
  onSave: (fields: Partial<WeddingDocument>, files?: Record<string, File>, urlsToDelete?: string[]) => void;
  isSaving?: boolean;
}

export function CustomizeForm({ data, onSave, isSaving }: CustomizeFormProps) {
  const currentTheme = data?.theme ?? THEME_DEFAULTS.cinematic;
  const [template, setTemplate] = useState(currentTheme.template);
  const [colors, setColors] = useState({ ...currentTheme.colors });
  const [fonts, setFonts] = useState({ ...currentTheme.fonts });
  const [quranArabic, setQuranArabic] = useState(data?.quranArabic ?? '');
  const [quranTranslation, setQuranTranslation] = useState(data?.quranTranslation ?? '');
  const [quranReference, setQuranReference] = useState(data?.quranReference ?? '');

  const handleTemplateChange = (value: string) => {
    setTemplate(value);
    const defaults = THEME_DEFAULTS[value];
    if (defaults) {
      setColors({ ...defaults.colors });
      setFonts({ ...defaults.fonts });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const theme: WeddingTheme = { template, colors, fonts };
    onSave({
      quranArabic: quranArabic.trim(),
      quranTranslation: quranTranslation.trim(),
      quranReference: quranReference.trim(),
      theme,
    });
  };

  const inputClass = 'w-full px-4 py-3 border border-gold/20 rounded-xl text-sm bg-white focus:outline-none focus:border-gold/50';

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <fieldset className="space-y-3">
        <legend className="text-xs uppercase tracking-[0.3em] text-gold font-black mb-3">Ayat Al-Quran</legend>
        <textarea value={quranArabic} onChange={(e) => setQuranArabic(e.target.value)} placeholder="Ayat Arab" rows={4} maxLength={500} aria-label="Ayat Arab" className={`${inputClass} resize-none`} dir="rtl" />
        <textarea value={quranTranslation} onChange={(e) => setQuranTranslation(e.target.value)} placeholder="Terjemahan" rows={4} maxLength={500} aria-label="Terjemahan" className={`${inputClass} resize-none`} />
        <input value={quranReference} onChange={(e) => setQuranReference(e.target.value)} placeholder="Referensi (misal: QS. Ar-Rum: 21)" maxLength={50} aria-label="Referensi Ayat" className={inputClass} />
      </fieldset>

      <fieldset className="space-y-3">
        <legend className="text-xs uppercase tracking-[0.3em] text-gold font-black mb-3">Template</legend>
        <select id="theme-template" value={template} onChange={(e) => handleTemplateChange(e.target.value)} aria-label="Template" className={inputClass}>
          {TEMPLATE_OPTIONS.map(t => (
            <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
          ))}
        </select>
      </fieldset>

      <fieldset className="space-y-3">
        <legend className="text-xs uppercase tracking-[0.3em] text-gold font-black mb-3">Warna</legend>
        {COLOR_FIELDS.map(({ key, label }) => (
          <div key={key} className="flex items-center gap-3">
            <input
              type="color"
              value={colors[key]}
              onChange={(e) => setColors(prev => ({ ...prev, [key]: e.target.value }))}
              className="w-10 h-10 rounded-lg border border-gold/20 cursor-pointer"
            />
            <div className="flex-1">
              <span className="text-xs text-ink/70">{label}</span>
              <span className="text-xs text-ink/60 ml-2">{colors[key]}</span>
            </div>
          </div>
        ))}
      </fieldset>

      <fieldset className="space-y-3">
        <legend className="text-xs uppercase tracking-[0.3em] text-gold font-black mb-3">Font</legend>
        {FONT_FIELDS.map(({ key, label }) => (
          <div key={key}>
            <label htmlFor={`font-${key}`} className="text-xs text-ink/60 mb-1 block">{label}</label>
            <select id={`font-${key}`} value={fonts[key]} onChange={(e) => setFonts(prev => ({ ...prev, [key]: e.target.value }))} className={inputClass}>
              {FONT_OPTIONS.map(f => (
                <option key={f} value={f}>{f}</option>
              ))}
            </select>
          </div>
        ))}
      </fieldset>

      <button type="submit" disabled={isSaving} className="w-full py-3 bg-gold text-ivory rounded-full text-xs tracking-[0.3em] font-black uppercase disabled:opacity-50 shadow-lg shadow-gold/20">{isSaving ? 'Menyimpan...' : 'Simpan'}</button>
    </form>
  );
}
