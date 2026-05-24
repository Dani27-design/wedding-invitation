'use client';
import { useState } from 'react';
import { WeddingDocument } from '../../types/firestore';
import { Upload, Music, Image as ImageIcon, Sparkles } from 'lucide-react';
import { compressImage, formatFileSize } from '../../utils/compressImage';
import { CompressionModal } from './CompressionModal';

interface MediaFormProps {
  data: WeddingDocument | null;
  onSave: (fields: Partial<WeddingDocument>, files?: Record<string, File>, urlsToDelete?: string[]) => void;
  isSaving?: boolean;
  onDirty?: () => void;
  step?: number;
  totalSteps?: number;
}

interface MediaItem {
  label: string;
  field: 'musicUrl' | 'heroImage' | 'openingImage' | 'twibbonOverlay';
  accept: string;
  icon: any;
}

const MEDIA_ITEMS: MediaItem[] = [
  { label: 'Musik Latar', field: 'musicUrl', accept: 'audio/*', icon: Music },
  { label: 'Foto Sampul', field: 'openingImage', accept: 'image/*', icon: ImageIcon },
  { label: 'Foto Utama', field: 'heroImage', accept: 'image/*', icon: ImageIcon },
  { label: 'Twibbon', field: 'twibbonOverlay', accept: 'image/png', icon: Sparkles },
];

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const MAX_AUDIO_SIZE = 10 * 1024 * 1024;

export function MediaForm({ data, onSave, isSaving, onDirty, step, totalSteps }: MediaFormProps) {
  const [quranArabic, setQuranArabic] = useState(data?.quranArabic ?? '');
  const [quranTranslation, setQuranTranslation] = useState(data?.quranTranslation ?? '');
  const [quranReference, setQuranReference] = useState(data?.quranReference ?? '');
  const [error, setError] = useState('');
  const [previews, setPreviews] = useState<Record<string, string>>({
    musicUrl: data?.musicUrl ?? '',
    heroImage: data?.heroImage ?? '',
    openingImage: data?.openingImage ?? '',
    twibbonOverlay: data?.twibbonOverlay ?? '',
  });

  const [files, setFiles] = useState<Record<string, File>>({});
  const [isGenerating, setIsGenerating] = useState(false);
  const [isCompressing, setIsCompressing] = useState(false);
  const [compressionInfo, setCompressionInfo] = useState('');
  const [compressProgress, setCompressProgress] = useState({ current: 0, total: 0, fileName: '' });

  const handleFileChange = (field: string, file: File | undefined, accept: string) => {
    if (!file) return;
    const maxSize = accept.startsWith('audio') ? MAX_AUDIO_SIZE : MAX_IMAGE_SIZE;
    const label = accept.startsWith('audio') ? '10MB' : '5MB';
    if (file.size > maxSize) { setError(`Ukuran file maksimal ${label}`); return; }
    setError('');
    const url = URL.createObjectURL(file);
    setPreviews(prev => ({ ...prev, [field]: url }));
    setFiles(prev => ({ ...prev, [field]: file }));
    onDirty?.();
  };

  const handleGenerateOverlay = async () => {
    if (!data) return;
    setIsGenerating(true);
    try {
      const { drawOverlay } = await import('../../utils/twibbonOverlay');
      const { deriveDateDisplay } = await import('../../utils/weddingDerived');
      const canvas = document.createElement('canvas');
      canvas.width = 1080;
      canvas.height = 1920;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const locationDate = `${data.eventCity} ${deriveDateDisplay(data.eventDate)}`;
      drawOverlay(ctx, 1080, 1920, {
        groomNickname: data.groomNickname,
        brideNickname: data.brideNickname,
        locationDate,
        fonts: data.theme ? { decorative: data.theme.fonts.decorative, script: data.theme.fonts.script } : undefined,
      });

      const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, 'image/png'));
      if (blob) {
        const url = URL.createObjectURL(blob);
        const file = new File([blob], 'twibbon-overlay.png', { type: 'image/png' });
        setPreviews(prev => ({ ...prev, twibbonOverlay: url }));
        setFiles(prev => ({ ...prev, twibbonOverlay: file }));
        onDirty?.();
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const fileEntries = Object.entries(files);
    const imageEntries = fileEntries.filter(([, f]) => !f.type.startsWith('audio/'));
    const compressedFiles: Record<string, File> = {};
    fileEntries.filter(([, f]) => f.type.startsWith('audio/')).forEach(([k, f]) => { compressedFiles[k] = f; });
    if (imageEntries.length > 0) {
      setIsCompressing(true);
      setCompressionInfo('');
      try {
        const infos: string[] = [];
        for (let i = 0; i < imageEntries.length; i++) {
          const [key, file] = imageEntries[i];
          setCompressProgress({ current: i + 1, total: imageEntries.length, fileName: file.name });
          const isPng = key === 'twibbonOverlay';
          const result = await compressImage(file, isPng ? { maxWidth: 1080, maxHeight: 1920, forcePng: true } : undefined);
          compressedFiles[key] = result.file;
          if (result.wasCompressed) infos.push(`${key}: ${formatFileSize(result.originalSize)} → ${formatFileSize(result.compressedSize)}`);
        }
        if (infos.length > 0) setCompressionInfo(infos.join(' | '));
      } finally {
        setIsCompressing(false);
      }
    } else {
      fileEntries.forEach(([k, f]) => { compressedFiles[k] = f; });
    }
    onSave(
      {
        musicUrl: previews.musicUrl,
        heroImage: previews.heroImage,
        openingImage: previews.openingImage,
        twibbonOverlay: previews.twibbonOverlay,
        quranArabic: quranArabic.trim(),
        quranTranslation: quranTranslation.trim(),
        quranReference: quranReference.trim(),
      },
      Object.keys(compressedFiles).length > 0 ? compressedFiles : undefined,
    );
  };

  const inputClass = 'w-full px-3 py-2.5 border border-gold/20 rounded-xl text-sm bg-white focus:outline-none focus:border-gold/50 transition-colors';

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Media uploads card */}
      <div className="bg-white rounded-2xl border border-gold/10 shadow-sm overflow-hidden">
        <div className="border-l-4 border-gold px-4 py-3 bg-gold/[0.03]">
          <h3 className="font-base text-[13px] text-ink">Media Undangan</h3>
        </div>
        <div className="p-4 space-y-3">
          {MEDIA_ITEMS.map(({ label, field, accept, icon: Icon }) => {
            const hasPreview = !!previews[field];
            const isAudio = accept.startsWith('audio');
            const isImage = accept.startsWith('image');
            const isTwibbon = field === 'twibbonOverlay';

            return (
              <div key={field} className={`border border-gold/10 rounded-xl bg-ivory/30 ${isTwibbon && hasPreview ? 'p-3 space-y-3' : 'flex items-center gap-3 p-3'}`}>
                {isTwibbon && hasPreview && (
                  <div className="rounded-xl overflow-hidden border border-gold/10 bg-ivory/50">
                    <img src={previews[field]} alt={label} crossOrigin="anonymous" className="w-full object-contain max-h-60" />
                  </div>
                )}

                {!(isTwibbon && hasPreview) && (
                  <div className="w-14 h-14 rounded-xl overflow-hidden border border-gold/10 flex-shrink-0 bg-ivory/50 flex items-center justify-center">
                    {hasPreview && isImage && (
                      <img src={previews[field]} alt={label} crossOrigin="anonymous" className="w-full h-full object-cover" />
                    )}
                    {hasPreview && isAudio && (
                      <Music className="w-5 h-5 text-gold/70" />
                    )}
                    {!hasPreview && (
                      <Icon className="w-5 h-5 text-ink/80" />
                    )}
                  </div>
                )}

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-[11px] text-ink/80 font-medium">{label}</p>
                    <label className="flex items-center gap-1 px-2.5 py-1 border border-dashed border-gold/25 rounded-lg cursor-pointer hover:bg-gold/5 transition-colors flex-shrink-0">
                      <Upload className="w-3 h-3 text-gold" />
                      <span className="text-[9px] font-black text-gold uppercase tracking-widest">{hasPreview ? 'Ganti' : 'Pilih'}</span>
                      <input type="file" accept={accept} onChange={(e) => handleFileChange(field, e.target.files?.[0], accept)} className="hidden" />
                    </label>
                  </div>

                  {hasPreview && isAudio && (
                    <audio src={previews[field]} controls className="w-full h-7 mt-1.5" />
                  )}

                  {files[field] && (
                    <p className="text-[9px] text-ink/80 truncate font-mono mt-1">{files[field].name}</p>
                  )}

                  {field === 'twibbonOverlay' && (
                    <button
                      type="button"
                      onClick={handleGenerateOverlay}
                      disabled={isGenerating || !data?.groomNickname}
                      className="mt-1.5 px-3 py-1 bg-gold/5 border border-gold/15 rounded-lg text-[9px] tracking-widest uppercase text-gold font-black hover:bg-gold/10 transition-all disabled:opacity-30 flex items-center gap-1.5"
                    >
                      <Sparkles className={`w-2.5 h-2.5 ${isGenerating ? 'animate-spin' : ''}`} />
                      {isGenerating ? 'Membuat...' : 'Buat Otomatis'}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Quote / Verse card */}
      <div className="bg-white rounded-2xl border border-gold/10 shadow-sm overflow-hidden">
        <div className="border-l-4 border-gold px-4 py-3 bg-gold/[0.03]">
          <h3 className="font-base text-[13px] text-ink">Kutipan / Ayat</h3>
        </div>
        <div className="p-4 space-y-4">
          <div>
            <label htmlFor="quran-arabic" className="text-[11px] text-ink/80 font-medium block mb-1.5">Teks Asli</label>
            <textarea id="quran-arabic" value={quranArabic} onChange={(e) => { setQuranArabic(e.target.value); onDirty?.(); }} placeholder="Ayat Arab, Alkitab, Weda, atau bahasa lain" rows={2} maxLength={500} className={`${inputClass} resize-none`} dir="auto" />
            {quranArabic.length > 350 && (
              <p className={`text-[9px] text-right mt-0.5 ${quranArabic.length >= 500 ? 'text-red-500' : 'text-gold'}`}>{quranArabic.length}/500</p>
            )}
          </div>
          <div>
            <label htmlFor="quran-translation" className="text-[11px] text-ink/80 font-medium block mb-1.5">Terjemahan</label>
            <textarea id="quran-translation" value={quranTranslation} onChange={(e) => { setQuranTranslation(e.target.value); onDirty?.(); }} placeholder="Terjemahan atau arti" rows={2} maxLength={500} className={`${inputClass} resize-none`} />
            {quranTranslation.length > 350 && (
              <p className={`text-[9px] text-right mt-0.5 ${quranTranslation.length >= 500 ? 'text-red-500' : 'text-gold'}`}>{quranTranslation.length}/500</p>
            )}
          </div>
          <div>
            <label htmlFor="quran-reference" className="text-[11px] text-ink/80 font-medium block mb-1.5">Sumber</label>
            <input id="quran-reference" value={quranReference} onChange={(e) => { setQuranReference(e.target.value); onDirty?.(); }} placeholder="Contoh: QS. Ar-Rum: 21" maxLength={50} className={inputClass} />
          </div>
        </div>
      </div>

      {error && <p className="text-xs text-red-500 text-center">{error}</p>}
      {compressionInfo && <p className="text-[10px] text-green-600 text-center">{compressionInfo}</p>}

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

      <button type="submit" disabled={isSaving || isCompressing} className="w-full py-3 bg-gold text-ivory rounded-full text-xs tracking-[0.3em] font-black uppercase disabled:opacity-50 shadow-lg shadow-gold/20">{isSaving ? 'Menyimpan...' : 'Simpan & Lanjutkan'}</button>
      <CompressionModal isOpen={isCompressing} current={compressProgress.current} total={compressProgress.total} currentFileName={compressProgress.fileName} />
    </form>
  );
}
