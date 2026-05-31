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
  step?: number;
  totalSteps?: number;
}

const EMPTY_CEREMONY: Ceremony = { name: '', date: '', start: '', end: '', venueName: '', venueAddress: '', venueMapsUrl: '' };

export function EventForm({ data, onSave, isSaving, onDirty, step, totalSteps }: EventFormProps) {
  const [eventDate, setEventDate] = useState(data?.eventDate ?? '');
  const [eventCity, setEventCity] = useState(data?.eventCity ?? '');
  const [ceremonies, setCeremonies] = useState<Ceremony[]>(() => {
    const existing = data?.ceremonies ?? [];
    if (existing.length === 0) return [{ ...EMPTY_CEREMONY }];
    // Backwards compatibility: fill missing venue fields from top-level data
    return existing.map(c => ({
      ...EMPTY_CEREMONY,
      ...c,
      date: c.date || data?.eventDate || '',
      venueName: c.venueName || (data as any)?.venueName || '',
      venueAddress: c.venueAddress || (data as any)?.venueAddress || '',
      venueMapsUrl: c.venueMapsUrl || (data as any)?.venueMapsUrl || '',
    }));
  });
  const [deleteTarget, setDeleteTarget] = useState<number | null>(null);

  const addCeremony = () => {
    setCeremonies([...ceremonies, { ...EMPTY_CEREMONY, date: eventDate }]);
    onDirty?.();
  };
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
      ceremonies: ceremonies.filter(c => c.name.trim()).map(c => ({
        ...c,
        name: c.name.trim(),
        venueName: c.venueName.trim(),
        venueAddress: c.venueAddress.trim(),
        venueMapsUrl: c.venueMapsUrl.trim(),
      })),
    });
  };

  const inputClass = 'w-full px-3 py-2.5 border border-gold/20 rounded-xl text-sm bg-white focus:outline-none focus:border-gold/50 transition-colors';

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Date & City card */}
      <div className="bg-white rounded-2xl border border-gold/10 shadow-sm overflow-hidden">
        <div className="border-l-4 border-gold px-4 py-3 bg-gold/[0.03]">
          <h3 className="font-base text-[13px] text-ink">Tanggal & Kota Utama</h3>
        </div>
        <div className="p-4 space-y-4">
          <div>
            <label htmlFor="event-date" className="text-[11px] text-ink/80 font-medium block mb-1.5">
              Tanggal Utama <span className="text-red-400">*</span>
            </label>
            <input id="event-date" type="date" value={eventDate} onChange={(e) => { setEventDate(e.target.value); onDirty?.(); }} required className={inputClass} />
          </div>
          <div>
            <label htmlFor="event-city" className="text-[11px] text-ink/80 font-medium block mb-1.5">
              Kota <span className="text-red-400">*</span>
            </label>
            <input id="event-city" value={eventCity} onChange={(e) => { setEventCity(e.target.value); onDirty?.(); }} placeholder="Contoh: Surabaya" required maxLength={50} className={inputClass} />
          </div>
        </div>
      </div>

      {/* Ceremonies card */}
      <div className="bg-white rounded-2xl border border-gold/10 shadow-sm overflow-hidden">
        <div className="border-l-4 border-gold px-4 py-3 bg-gold/[0.03] flex items-center justify-between">
          <h3 className="font-base text-[13px] text-ink">Rangkaian Acara</h3>
          <span className="text-[10px] text-ink/80 font-mono">{ceremonies.length} acara</span>
        </div>
        <div className="p-4 space-y-3">
          {ceremonies.map((c, i) => (
            <div key={i} className="p-3 border border-gold/10 rounded-xl bg-ivory/30 space-y-3">
              <div className="flex gap-2 items-center">
                <input value={c.name} onChange={(e) => updateCeremony(i, 'name', e.target.value)} placeholder="Nama Acara (cth: Akad Nikah)" maxLength={50} aria-label={`Nama Acara ${i + 1}`} className={`${inputClass} flex-1`} />
                <button
                  type="button"
                  onClick={() => setDeleteTarget(i)}
                  className="w-8 h-8 flex items-center justify-center rounded-lg text-red-300 hover:text-red-500 hover:bg-red-50 transition-colors flex-shrink-0"
                  aria-label={`Hapus acara ${i + 1}`}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Date + Time */}
              <div className="flex gap-2">
                <div className="flex-1">
                  <label className="text-[10px] text-ink/80 block mb-1">Tanggal</label>
                  <input type="date" value={c.date} onChange={(e) => updateCeremony(i, 'date', e.target.value)} aria-label={`Tanggal Acara ${i + 1}`} className={inputClass} />
                </div>
                <div className="flex-1">
                  <label className="text-[10px] text-ink/80 block mb-1">Mulai</label>
                  <input type="time" value={c.start} onChange={(e) => updateCeremony(i, 'start', e.target.value)} aria-label={`Jam Mulai Acara ${i + 1}`} className={inputClass} />
                </div>
                <div className="flex-1">
                  <label className="text-[10px] text-ink/80 block mb-1">Selesai</label>
                  <input type="time" value={c.end} onChange={(e) => updateCeremony(i, 'end', e.target.value)} aria-label={`Jam Selesai Acara ${i + 1}`} className={inputClass} />
                </div>
              </div>

              {/* Venue */}
              <div>
                <label className="text-[10px] text-ink/80 block mb-1">Nama Gedung</label>
                <input value={c.venueName} onChange={(e) => updateCeremony(i, 'venueName', e.target.value)} placeholder="Contoh: Masjid Al-Akbar" maxLength={100} aria-label={`Nama Gedung Acara ${i + 1}`} className={inputClass} />
              </div>
              <div>
                <label className="text-[10px] text-ink/80 block mb-1">Alamat</label>
                <input value={c.venueAddress} onChange={(e) => updateCeremony(i, 'venueAddress', e.target.value)} placeholder="Contoh: Jl. Raya No. 123" maxLength={200} aria-label={`Alamat Acara ${i + 1}`} className={inputClass} />
              </div>
              <div>
                <label className="text-[10px] text-ink/80 block mb-1">Google Maps URL</label>
                <input value={c.venueMapsUrl} onChange={(e) => updateCeremony(i, 'venueMapsUrl', e.target.value)} placeholder="https://maps.google.com/..." type="url" maxLength={500} aria-label={`Maps URL Acara ${i + 1}`} className={inputClass} />
              </div>
            </div>
          ))}

          <button
            type="button"
            onClick={addCeremony}
            className="w-full py-2.5 border-2 border-dashed border-gold/25 rounded-xl flex items-center justify-center gap-2 hover:bg-gold/5 transition-all text-gold"
          >
            <Plus className="w-4 h-4" />
            <span className="text-[11px] font-bold">Tambah Acara</span>
          </button>
        </div>
      </div>

      {/* Progress bar */}
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
      <ConfirmDeleteModal
        isOpen={deleteTarget !== null}
        message="Apakah Anda yakin ingin menghapus acara ini?"
        onConfirm={() => { if (deleteTarget !== null) removeCeremony(deleteTarget); setDeleteTarget(null); }}
        onCancel={() => setDeleteTarget(null)}
      />
    </form>
  );
}
