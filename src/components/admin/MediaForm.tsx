import { useState } from 'react';
import { WeddingDocument } from '../../types/firestore';
import { Upload, Music, Image as ImageIcon, Sparkles, Trash2 } from 'lucide-react';

interface MediaFormProps {
  data: WeddingDocument | null;
  onSave: (fields: Partial<WeddingDocument>, files?: Record<string, File>, urlsToDelete?: string[]) => void;
  isSaving?: boolean;
}

interface MediaItem {
  label: string;
  field: 'musicUrl' | 'heroImage' | 'openingImage' | 'twibbonOverlay';
  accept: string;
  icon: any;
}

const MEDIA_ITEMS: MediaItem[] = [
  { label: 'Musik Latar', field: 'musicUrl', accept: 'audio/*', icon: Music },
  { label: 'Foto Hero (Pembuka)', field: 'heroImage', accept: 'image/*', icon: ImageIcon },
  { label: 'Foto Opening', field: 'openingImage', accept: 'image/*', icon: ImageIcon },
  { label: 'Twibbon Overlay', field: 'twibbonOverlay', accept: 'image/png', icon: Sparkles },
];

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const MAX_AUDIO_SIZE = 10 * 1024 * 1024;

export function MediaForm({ data, onSave, isSaving }: MediaFormProps) {
  const [error, setError] = useState('');
  const [previews, setPreviews] = useState<Record<string, string>>({
    musicUrl: data?.musicUrl ?? '',
    heroImage: data?.heroImage ?? '',
    openingImage: data?.openingImage ?? '',
    twibbonOverlay: data?.twibbonOverlay ?? '',
  });
  const [files, setFiles] = useState<Record<string, File>>({});
  const [urlsToDelete, setUrlsToDelete] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleFileChange = (field: string, file: File | undefined, accept: string) => {
    if (!file) return;
    const maxSize = accept.startsWith('audio') ? MAX_AUDIO_SIZE : MAX_IMAGE_SIZE;
    const label = accept.startsWith('audio') ? '10MB' : '5MB';
    if (file.size > maxSize) { setError(`Ukuran file maksimal ${label}`); return; }
    setError('');
    const url = URL.createObjectURL(file);
    setPreviews(prev => ({ ...prev, [field]: url }));
    setFiles(prev => ({ ...prev, [field]: file }));
  };

  const handleDelete = (field: string) => {
    const currentUrl = previews[field];
    if (currentUrl && currentUrl.includes('firebasestorage.googleapis.com')) {
      setUrlsToDelete(prev => [...prev, currentUrl]);
    }
    setPreviews(prev => ({ ...prev, [field]: '' }));
    setFiles(prev => {
      const next = { ...prev };
      delete next[field];
      return next;
    });
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
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(
      {
        musicUrl: previews.musicUrl,
        heroImage: previews.heroImage,
        openingImage: previews.openingImage,
        twibbonOverlay: previews.twibbonOverlay,
      },
      Object.keys(files).length > 0 ? files : undefined,
      urlsToDelete.length > 0 ? urlsToDelete : undefined,
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <label className="text-xs uppercase tracking-[0.3em] text-gold font-black block">Media</label>

      {MEDIA_ITEMS.map(({ label, field, accept, icon: Icon }) => (
        <div key={field} className="p-4 border border-gold/10 rounded-2xl space-y-4 bg-white/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Icon className="w-3.5 h-3.5 text-gold" />
              <span className="text-xs text-ink/80 font-black uppercase tracking-wider">{label}</span>
            </div>
            {previews[field] && (
              <button 
                type="button" 
                onClick={() => handleDelete(field)}
                className="p-1.5 text-red-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                title="Hapus media"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="space-y-3">
            {previews[field] && (
              <div className="relative rounded-xl overflow-hidden border border-gold/10 bg-ivory/50">
                {accept.startsWith('image') ? (
                  <img src={previews[field]} alt={label} crossOrigin="anonymous" className="w-full max-h-40 object-contain mx-auto" />
                ) : (
                  <div className="p-4 flex items-center justify-center">
                    <audio src={previews[field]} controls className="w-full h-8" />
                  </div>
                )}
              </div>
            )}

            <div className="space-y-2">
              <label className="flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-gold/30 rounded-xl cursor-pointer hover:bg-gold/5 transition-all group">
                <Upload className="w-4 h-4 text-gold group-hover:scale-110 transition-transform" />
                <span className="text-[10px] font-black text-gold uppercase tracking-[0.2em]">
                  {previews[field] ? 'Ganti File' : 'Pilih File'}
                </span>
                <input 
                  type="file" 
                  accept={accept} 
                  onChange={(e) => handleFileChange(field, e.target.files?.[0], accept)} 
                  className="hidden" 
                />
              </label>
              
              {files[field] && (
                <p className="text-[10px] text-ink/40 truncate font-mono text-center px-2">
                  {files[field].name}
                </p>
              )}

              {field === 'twibbonOverlay' && (
                <button
                  type="button"
                  onClick={handleGenerateOverlay}
                  disabled={isGenerating || !data?.groomNickname}
                  className="w-full py-2.5 bg-gold/5 border border-gold/20 rounded-xl text-[10px] tracking-[0.2em] uppercase text-gold font-black hover:bg-gold/10 transition-all disabled:opacity-30 flex items-center justify-center gap-2"
                >
                  <Sparkles className={`w-3 h-3 ${isGenerating ? 'animate-spin' : ''}`} />
                  {isGenerating ? 'Membuat...' : 'Buat Otomatis'}
                </button>
              )}
            </div>
          </div>
        </div>
      ))}

      {error && <p className="text-xs text-red-500 text-center">{error}</p>}
      <button type="submit" disabled={isSaving} className="w-full py-3 bg-gold text-ivory rounded-full text-xs tracking-[0.3em] font-black uppercase disabled:opacity-50 shadow-lg shadow-gold/20">{isSaving ? 'Menyimpan...' : 'Simpan'}</button>
    </form>
  );
}
