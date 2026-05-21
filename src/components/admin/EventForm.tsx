'use client';
import { useState } from 'react';
import { WeddingDocument, Ceremony } from '../../types/firestore';
import { Plus, Trash2 } from 'lucide-react';
import { ConfirmDeleteModal } from './ConfirmDeleteModal';

interface EventFormProps {
  data: WeddingDocument | null;
  onSave: (fields: Partial<WeddingDocument>, files?: Record<string, File>, urlsToDelete?: string[]) => void;
  isSaving?: boolean;
  onDirty?: () => void;
}

export function EventForm({ data, onSave, isSaving, onDirty }: EventFormProps) {
  const [eventDate, setEventDate] = useState(data?.eventDate ?? '');
  const [eventCity, setEventCity] = useState(data?.eventCity ?? '');
  const [venueName, setVenueName] = useState(data?.venueName ?? '');
  const [venueAddress, setVenueAddress] = useState(data?.venueAddress ?? '');
  const [venueMapsUrl, setVenueMapsUrl] = useState(data?.venueMapsUrl ?? '');
  const [ceremonies, setCeremonies] = useState<Ceremony[]>(data?.ceremonies ?? [{ name: '', start: '', end: '' }]);
  const [deleteTarget, setDeleteTarget] = useState<number | null>(null);

  const addCeremony = () => { setCeremonies([...ceremonies, { name: '', start: '', end: '' }]); onDirty?.(); };
  const removeCeremony = (i: number) => { setCeremonies(ceremonies.filter((_, idx) => idx !== i)); onDirty?.(); };
  const updateCeremony = (i: number, field: keyof Ceremony, value: string) => {
    setCeremonies(ceremonies.map((c, idx) => idx === i ? { ...c, [field]: value } : c));
    onDirty?.();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      eventDate,
      eventCity: eventCity.trim(),
      venueName: venueName.trim(),
      venueAddress: venueAddress.trim(),
      venueMapsUrl: venueMapsUrl.trim(),
      ceremonies: ceremonies.filter(c => c.name.trim()),
    });
  };

  const inputClass = 'w-full px-3 py-2 border border-gold/20 rounded-lg text-sm bg-white focus:outline-none focus:border-gold/50';

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <fieldset className="space-y-2">
        <legend className="text-xs uppercase tracking-[0.3em] text-gold font-black mb-1">Tanggal & Lokasi</legend>
        <input type="date" value={eventDate} onChange={(e) => { setEventDate(e.target.value); onDirty?.(); }} required aria-label="Tanggal Acara" className={inputClass} />
        <input value={eventCity} onChange={(e) => { setEventCity(e.target.value); onDirty?.(); }} placeholder="Kota" required maxLength={50} aria-label="Kota" className={inputClass} />
        <input value={venueName} onChange={(e) => { setVenueName(e.target.value); onDirty?.(); }} placeholder="Nama Gedung" required maxLength={100} aria-label="Nama Gedung" className={inputClass} />
        <input value={venueAddress} onChange={(e) => { setVenueAddress(e.target.value); onDirty?.(); }} placeholder="Alamat Lengkap" required maxLength={200} aria-label="Alamat Lengkap" className={inputClass} />
        <input value={venueMapsUrl} onChange={(e) => { setVenueMapsUrl(e.target.value); onDirty?.(); }} placeholder="Google Maps URL" type="url" maxLength={500} aria-label="Google Maps URL" className={inputClass} />
      </fieldset>

      <fieldset className="space-y-2">
        <div className="flex items-center justify-between mb-1">
          <legend className="text-xs uppercase tracking-[0.3em] text-gold font-black">Rangkaian Acara</legend>
          <span className="text-[10px] text-ink/30 font-mono">{ceremonies.length} acara</span>
        </div>
        {ceremonies.map((c, i) => (
          <div key={i} className="p-3 border border-gold/10 rounded-2xl bg-white/40 space-y-2">
            <div className="flex gap-2 items-center">
              <input value={c.name} onChange={(e) => updateCeremony(i, 'name', e.target.value)} placeholder="Nama Acara" maxLength={50} aria-label={`Nama Acara ${i + 1}`} className={`${inputClass} flex-1`} />
              <button
                type="button"
                onClick={() => setDeleteTarget(i)}
                className="w-7 h-7 flex items-center justify-center rounded-lg text-red-300 hover:text-red-500 hover:bg-red-50 transition-colors flex-shrink-0"
                aria-label={`Hapus acara ${i + 1}`}
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="flex gap-2">
              <input type="time" value={c.start} onChange={(e) => updateCeremony(i, 'start', e.target.value)} aria-label={`Jam Mulai Acara ${i + 1}`} className={`${inputClass} flex-1`} />
              <input type="time" value={c.end} onChange={(e) => updateCeremony(i, 'end', e.target.value)} aria-label={`Jam Selesai Acara ${i + 1}`} className={`${inputClass} flex-1`} />
            </div>
          </div>
        ))}
      </fieldset>

      <button
        type="button"
        onClick={addCeremony}
        className="w-full py-2.5 border-2 border-dashed border-gold/25 rounded-2xl flex items-center justify-center gap-2 hover:bg-gold/5 transition-all text-gold"
      >
        <Plus className="w-4 h-4" />
        <span className="text-[10px] font-black uppercase tracking-widest">Tambah Acara</span>
      </button>

      <button type="submit" disabled={isSaving} className="w-full py-3 bg-gold text-ivory rounded-full text-xs tracking-[0.3em] font-black uppercase disabled:opacity-50 shadow-lg shadow-gold/20">{isSaving ? 'Menyimpan...' : 'Simpan'}</button>
      <ConfirmDeleteModal
        isOpen={deleteTarget !== null}
        message="Apakah Anda yakin ingin menghapus acara ini?"
        onConfirm={() => { if (deleteTarget !== null) removeCeremony(deleteTarget); setDeleteTarget(null); }}
        onCancel={() => setDeleteTarget(null)}
      />
    </form>
  );
}
