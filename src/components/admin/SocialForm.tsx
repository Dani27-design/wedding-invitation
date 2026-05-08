import { useState } from 'react';
import { WeddingDocument } from '../../types/firestore';

interface SocialFormProps {
  data: WeddingDocument | null;
  onSave: (fields: Partial<WeddingDocument>, files?: Record<string, File>, urlsToDelete?: string[]) => void;
  isSaving?: boolean;
}

interface SocialField {
  key: keyof WeddingDocument;
  label: string;
  placeholder: string;
  type: 'url' | 'tel';
}

const GROOM_FIELDS: SocialField[] = [
  { key: 'groomInstagram', label: 'Instagram', placeholder: 'https://instagram.com/...', type: 'url' },
  { key: 'groomLinkedin', label: 'LinkedIn', placeholder: 'https://linkedin.com/in/...', type: 'url' },
  { key: 'groomWhatsapp', label: 'WhatsApp', placeholder: '628xxxxxxxxxx', type: 'tel' },
];

const BRIDE_FIELDS: SocialField[] = [
  { key: 'brideInstagram', label: 'Instagram', placeholder: 'https://instagram.com/...', type: 'url' },
  { key: 'brideThreads', label: 'Threads', placeholder: 'https://threads.com/@...', type: 'url' },
  { key: 'brideWhatsapp', label: 'WhatsApp', placeholder: '628xxxxxxxxxx', type: 'tel' },
];

export function SocialForm({ data, onSave, isSaving }: SocialFormProps) {
  const [values, setValues] = useState<Record<string, string>>({
    groomInstagram: data?.groomInstagram ?? '',
    groomLinkedin: data?.groomLinkedin ?? '',
    groomWhatsapp: data?.groomWhatsapp ?? '',
    brideInstagram: data?.brideInstagram ?? '',
    brideThreads: data?.brideThreads ?? '',
    brideWhatsapp: data?.brideWhatsapp ?? '',
  });

  const handleChange = (key: string, value: string) => {
    setValues(prev => ({ ...prev, [key]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed: Record<string, string> = {};
    Object.entries(values).forEach(([k, v]) => { trimmed[k] = v.trim(); });
    onSave(trimmed);
  };

  const inputClass = 'w-full px-4 py-3 border border-gold/20 rounded-xl text-sm bg-white focus:outline-none focus:border-gold/50';

  const renderFields = (title: string, fields: SocialField[]) => (
    <fieldset className="space-y-3">
      <legend className="text-xs uppercase tracking-[0.3em] text-gold font-black mb-3">{title}</legend>
      {fields.map(({ key, label, placeholder, type }) => (
        <div key={key}>
          <label htmlFor={`social-${key}`} className="text-xs text-ink/60 mb-1 block">{label}</label>
          <input id={`social-${key}`} value={values[key]} onChange={(e) => handleChange(key, e.target.value)} placeholder={placeholder} type={type} maxLength={200} inputMode={type === 'tel' ? 'numeric' : undefined} className={inputClass} />
        </div>
      ))}
    </fieldset>
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {renderFields(`Sosial ${data?.groomNickname ?? 'Pengantin Pria'}`, GROOM_FIELDS)}
      {renderFields(`Sosial ${data?.brideNickname ?? 'Pengantin Wanita'}`, BRIDE_FIELDS)}
      <button type="submit" disabled={isSaving} className="w-full py-3 bg-gold text-ivory rounded-full text-xs tracking-[0.3em] font-black uppercase disabled:opacity-50">{isSaving ? 'Menyimpan...' : 'Simpan'}</button>
    </form>
  );
}
