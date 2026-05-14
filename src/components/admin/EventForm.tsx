'use client';
import { useState } from 'react';
import { WeddingDocument, Ceremony } from '../../types/firestore';
import { Plus, Trash2 } from 'lucide-react';

interface EventFormProps {
  data: WeddingDocument | null;
  onSave: (fields: Partial<WeddingDocument>, files?: Record<string, File>, urlsToDelete?: string[]) => void;
  isSaving?: boolean;
}

export function EventForm({ data, onSave, isSaving }: EventFormProps) {
  const [eventDate, setEventDate] = useState(data?.eventDate ?? '');
  const [eventCity, setEventCity] = useState(data?.eventCity ?? '');
  const [venueName, setVenueName] = useState(data?.venueName ?? '');
  const [venueAddress, setVenueAddress] = useState(data?.venueAddress ?? '');
  const [venueMapsUrl, setVenueMapsUrl] = useState(data?.venueMapsUrl ?? '');
  const [defaultGuest, setDefaultGuest] = useState(data?.defaultGuest ?? '');
  const [ceremonies, setCeremonies] = useState<Ceremony[]>(data?.ceremonies ?? [{ name: '', start: '', end: '' }]);

  const addCeremony = () => setCeremonies([...ceremonies, { name: '', start: '', end: '' }]);
  const removeCeremony = (i: number) => setCeremonies(ceremonies.filter((_, idx) => idx !== i));
  const updateCeremony = (i: number, field: keyof Ceremony, value: string) => {
    setCeremonies(ceremonies.map((c, idx) => idx === i ? { ...c, [field]: value } : c));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      eventDate,
      eventCity: eventCity.trim(),
      venueName: venueName.trim(),
      venueAddress: venueAddress.trim(),
      venueMapsUrl: venueMapsUrl.trim(),
      defaultGuest: defaultGuest.trim(),
      ceremonies: ceremonies.filter(c => c.name.trim()),
    });
  };

  const inputClass = 'w-full px-4 py-3 border border-gold/20 rounded-xl text-sm bg-white focus:outline-none focus:border-gold/50';

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-3">
        <label className="text-xs uppercase tracking-[0.3em] text-gold font-black block">Tanggal & Lokasi</label>
        <input type="date" value={eventDate} onChange={(e) => setEventDate(e.target.value)} required aria-label="Tanggal Acara" className={inputClass} />
        <input value={eventCity} onChange={(e) => setEventCity(e.target.value)} placeholder="Kota" required maxLength={50} aria-label="Kota" className={inputClass} />
        <input value={venueName} onChange={(e) => setVenueName(e.target.value)} placeholder="Nama Gedung" required maxLength={100} aria-label="Nama Gedung" className={inputClass} />
        <input value={venueAddress} onChange={(e) => setVenueAddress(e.target.value)} placeholder="Alamat Lengkap" required maxLength={200} aria-label="Alamat Lengkap" className={inputClass} />
        <input value={venueMapsUrl} onChange={(e) => setVenueMapsUrl(e.target.value)} placeholder="Google Maps URL" type="url" maxLength={500} aria-label="Google Maps URL" className={inputClass} />
        <input value={defaultGuest} onChange={(e) => setDefaultGuest(e.target.value)} placeholder="Nama Tamu Default (jika tanpa ?to=)" maxLength={50} aria-label="Nama Tamu Default" className={inputClass} />
      </div>

      <fieldset className="space-y-4">
        <legend className="text-xs uppercase tracking-[0.3em] text-gold font-black mb-3">Rangkaian Acara</legend>
        {ceremonies.map((c, i) => (
          <div key={i} className="p-4 border border-gold/10 rounded-2xl space-y-3 bg-white/50">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase tracking-widest text-ink/60 font-black">Acara {i + 1}</span>
              <button 
                type="button" 
                onClick={() => {
                  if (confirm('Apakah Anda yakin ingin menghapus acara ini?')) {
                    removeCeremony(i);
                  }
                }} 
                className="text-red-400 p-1 hover:scale-110 transition-transform" 
                aria-label="Hapus acara"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
            <input value={c.name} onChange={(e) => updateCeremony(i, 'name', e.target.value)} placeholder="Nama Acara" maxLength={50} aria-label={`Nama Acara ${i + 1}`} className={inputClass} />
            <div className="flex gap-2">
              <input type="time" value={c.start} onChange={(e) => updateCeremony(i, 'start', e.target.value)} aria-label={`Jam Mulai Acara ${i + 1}`} className={inputClass} />
              <input type="time" value={c.end} onChange={(e) => updateCeremony(i, 'end', e.target.value)} aria-label={`Jam Selesai Acara ${i + 1}`} className={inputClass} />
            </div>
          </div>
        ))}
      </fieldset>

      <button
        type="button"
        onClick={addCeremony}
        className="w-full py-4 border-2 border-dashed border-gold/30 rounded-3xl flex flex-col items-center justify-center gap-2 hover:bg-gold/5 transition-all group"
      >
        <div className="w-10 h-10 rounded-full bg-gold/10 flex items-center justify-center group-hover:scale-110 transition-transform">
          <Plus className="w-5 h-5 text-gold" />
        </div>
        <span className="text-[10px] font-black text-gold uppercase tracking-widest">Tambah Acara</span>
      </button>

      <button type="submit" disabled={isSaving} className="w-full py-3 bg-gold text-ivory rounded-full text-xs tracking-[0.3em] font-black uppercase disabled:opacity-50 shadow-lg shadow-gold/20">{isSaving ? 'Menyimpan...' : 'Simpan'}</button>
    </form>
  );
}
