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

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs uppercase tracking-[0.3em] text-gold font-black">Rangkaian Acara</label>
          <button type="button" onClick={addCeremony} className="text-gold" aria-label="Tambah acara"><Plus className="w-4 h-4" /></button>
        </div>
        {ceremonies.map((c, i) => (
          <div key={i} className="flex gap-2 items-start">
            <div className="flex-1 space-y-2">
              <input value={c.name} onChange={(e) => updateCeremony(i, 'name', e.target.value)} placeholder="Nama Acara" maxLength={50} aria-label={`Nama Acara ${i + 1}`} className={inputClass} />
              <div className="flex gap-2">
                <input type="time" value={c.start} onChange={(e) => updateCeremony(i, 'start', e.target.value)} aria-label={`Jam Mulai Acara ${i + 1}`} className={inputClass} />
                <input type="time" value={c.end} onChange={(e) => updateCeremony(i, 'end', e.target.value)} aria-label={`Jam Selesai Acara ${i + 1}`} className={inputClass} />
              </div>
            </div>
            {ceremonies.length > 1 && (
              <button type="button" onClick={() => removeCeremony(i)} className="text-red-400 mt-3" aria-label="Hapus acara"><Trash2 className="w-4 h-4" /></button>
            )}
          </div>
        ))}
      </div>

      <button type="submit" disabled={isSaving} className="w-full py-3 bg-gold text-ivory rounded-full text-xs tracking-[0.3em] font-black uppercase disabled:opacity-50">{isSaving ? 'Menyimpan...' : 'Simpan'}</button>
    </form>
  );
}
