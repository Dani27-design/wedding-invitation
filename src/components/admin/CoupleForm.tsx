'use client';
import { useState } from "react";
import { WeddingDocument } from "../../types/firestore";
import { Upload, Trash2, Plus, Camera } from "lucide-react";
import { compressImage, formatFileSize } from "../../utils/compressImage";
import { CompressionModal } from "./CompressionModal";

interface CoupleFormProps {
  data: WeddingDocument | null;
  onSave: (
    fields: Partial<WeddingDocument>,
    files?: Record<string, File>,
    urlsToDelete?: string[],
  ) => void;
  isSaving?: boolean;
  onDirty?: () => void;
  step?: number;
  totalSteps?: number;
}

const MAX_IMAGE_SIZE = 25 * 1024 * 1024;

export function CoupleForm({ data, onSave, isSaving, onDirty, step, totalSteps }: CoupleFormProps) {
  const [error, setError] = useState("");
  const [isCompressing, setIsCompressing] = useState(false);
  const [compressionInfo, setCompressionInfo] = useState("");
  const [compressProgress, setCompressProgress] = useState({ current: 0, total: 0, fileName: '' });
  const [groomNickname, setGroomNickname] = useState(data?.groomNickname ?? "");
  const [groomName, setGroomName] = useState(data?.groomName ?? "");
  const [groomParents, setGroomParents] = useState(data?.groomParents ?? "");
  const [brideNickname, setBrideNickname] = useState(data?.brideNickname ?? "");
  const [brideName, setBrideName] = useState(data?.brideName ?? "");
  const [brideParents, setBrideParents] = useState(data?.brideParents ?? "");
  const [groomPhotoPreview, setGroomPhotoPreview] = useState(data?.groomPhoto ?? "");
  const [bridePhotoPreview, setBridePhotoPreview] = useState(data?.bridePhoto ?? "");
  const [groomSocialLinks, setGroomSocialLinks] = useState(data?.groomSocialLinks ?? []);
  const [brideSocialLinks, setBrideSocialLinks] = useState(data?.brideSocialLinks ?? []);
  const [groomPhotoFile, setGroomPhotoFile] = useState<File | null>(null);
  const [bridePhotoFile, setBridePhotoFile] = useState<File | null>(null);
  const [urlsToDelete, setUrlsToDelete] = useState<string[]>([]);

  const updateSocialLink = (side: "groom" | "bride", idx: number, field: "label" | "url", value: string) => {
    const setter = side === "groom" ? setGroomSocialLinks : setBrideSocialLinks;
    const current = side === "groom" ? groomSocialLinks : brideSocialLinks;
    const next = [...current];
    next[idx] = { ...next[idx], [field]: value };
    setter(next);
    onDirty?.();
  };

  const addSocialLink = (side: "groom" | "bride") => {
    const setter = side === "groom" ? setGroomSocialLinks : setBrideSocialLinks;
    const current = side === "groom" ? groomSocialLinks : brideSocialLinks;
    setter([...current, { label: "", url: "" }]);
    onDirty?.();
  };

  const removeSocialLink = (side: "groom" | "bride", idx: number) => {
    const setter = side === "groom" ? setGroomSocialLinks : setBrideSocialLinks;
    const current = side === "groom" ? groomSocialLinks : brideSocialLinks;
    setter(current.filter((_, i) => i !== idx));
    onDirty?.();
  };

  const getUrlPlaceholder = (platform: string) => {
    switch (platform) {
      case 'Instagram': return 'https://instagram.com/username';
      case 'LinkedIn': return 'https://linkedin.com/in/username';
      case 'WhatsApp': return '081234567890';
      case 'Threads': return 'https://threads.net/@username';
      case 'Twitter': return 'https://x.com/username';
      case 'Tiktok': return 'https://tiktok.com/@username';
      default: return 'https://...';
    }
  };

  const handlePhotoChange = (side: "groom" | "bride", file: File | undefined) => {
    if (!file) return;
    if (file.size > MAX_IMAGE_SIZE) { setError("Ukuran foto maksimal 25MB"); return; }
    setError("");
    const url = URL.createObjectURL(file);
    if (side === "groom") { setGroomPhotoFile(file); setGroomPhotoPreview(url); }
    else { setBridePhotoFile(file); setBridePhotoPreview(url); }
    onDirty?.();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const allLinks = [
      ...groomSocialLinks.filter((l) => l.label.trim() && l.url.trim()),
      ...brideSocialLinks.filter((l) => l.label.trim() && l.url.trim()),
    ];
    for (const link of allLinks) {
      if (link.label === 'WhatsApp') {
        if (!/^\+?[0-9\s-]{8,20}$/.test(link.url.trim())) {
          setError(`Nomor WhatsApp "${link.url}" tidak valid. Gunakan format: 081234567890`);
          return;
        }
      } else {
        try {
          const parsed = new URL(link.url.trim());
          if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') {
            setError(`URL "${link.url}" tidak valid. URL harus dimulai dengan https://`);
            return;
          }
        } catch {
          setError(`URL "${link.url}" tidak valid. Pastikan format URL benar (contoh: https://instagram.com/username)`);
          return;
        }
      }
    }

    const files: Record<string, File> = {};
    const fileEntries = [
      groomPhotoFile ? ['groomPhoto', groomPhotoFile] as const : null,
      bridePhotoFile ? ['bridePhoto', bridePhotoFile] as const : null,
    ].filter(Boolean) as [string, File][];
    if (fileEntries.length > 0) {
      setIsCompressing(true);
      setCompressionInfo("");
      try {
        const infos: string[] = [];
        for (let i = 0; i < fileEntries.length; i++) {
          const [key, file] = fileEntries[i];
          setCompressProgress({ current: i + 1, total: fileEntries.length, fileName: file.name });
          const result = await compressImage(file);
          files[key] = result.file;
          if (result.wasCompressed) infos.push(`${key}: ${formatFileSize(result.originalSize)} → ${formatFileSize(result.compressedSize)}`);
        }
        if (infos.length > 0) setCompressionInfo(infos.join(' | '));
      } finally {
        setIsCompressing(false);
      }
    }
    onSave(
      {
        groomNickname: groomNickname.trim(),
        groomName: groomName.trim(),
        groomParents: groomParents.trim(),
        groomSocialLinks: groomSocialLinks.filter((l) => l.label.trim()),
        brideNickname: brideNickname.trim(),
        brideName: brideName.trim(),
        brideParents: brideParents.trim(),
        brideSocialLinks: brideSocialLinks.filter((l) => l.label.trim()),
        groomPhoto: groomPhotoPreview,
        bridePhoto: bridePhotoPreview,
      },
      Object.keys(files).length > 0 ? files : undefined,
      urlsToDelete.length > 0 ? urlsToDelete : undefined,
    );
  };

  const inputClass = "w-full px-3 py-2.5 border border-gold/20 rounded-xl text-sm bg-white focus:outline-none focus:border-gold/50 transition-colors";

  const renderSide = (
    side: "groom" | "bride",
    sideLabel: string,
    sideDescription: string,
    nickname: string, setNickname: (v: string) => void,
    name: string, setName: (v: string) => void,
    parents: string, setParents: (v: string) => void,
    preview: string, file: File | null,
    links: { label: string; url: string }[],
  ) => (
    <div className="bg-white rounded-2xl border border-gold/10 shadow-sm overflow-hidden">
      {/* Card header with accent border */}
      <div className="border-l-4 border-gold px-4 py-3 bg-gold/[0.03]">
        <h3 className="font-base text-[13px] text-ink">{sideDescription}</h3>
      </div>

      <div className="p-4 space-y-4">
        {/* Photo */}
        <div>
          <label className="text-[11px] text-ink/80 font-medium block mb-1.5">Foto</label>
          <div className="flex items-center gap-3">
            <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-gold/10 flex-shrink-0 bg-ivory">
              {preview ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img src={preview} alt={side} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Upload className="w-5 h-5 text-ink/80" />
                </div>
              )}
              <label className="absolute inset-0 cursor-pointer flex items-center justify-center bg-ink/0 hover:bg-ink/30 transition-colors group">
                <Camera className="w-4 h-4 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                <input type="file" accept="image/*" onChange={(e) => handlePhotoChange(side, e.target.files?.[0])} className="hidden" />
              </label>
            </div>
            <div className="min-w-0">
              <label className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-gold/20 rounded-lg text-[11px] text-gold font-bold uppercase tracking-wider cursor-pointer hover:bg-gold/5 transition-colors">
                <Upload className="w-3 h-3" />
                Ubah Foto
                <input type="file" accept="image/*" onChange={(e) => handlePhotoChange(side, e.target.files?.[0])} className="hidden" />
              </label>
              {file && <p className="text-[9px] text-ink/80 truncate font-mono mt-1">{file.name}</p>}
            </div>
          </div>
        </div>

        {/* Nickname */}
        <div>
          <label htmlFor={`${side}-nickname`} className="text-[11px] text-ink/80 font-medium block mb-1.5">
            Nama Panggilan <span className="text-red-400">*</span>
          </label>
          <input
            id={`${side}-nickname`}
            value={nickname}
            onChange={(e) => { setNickname(e.target.value); onDirty?.(); }}
            placeholder="Contoh: Dani"
            required
            maxLength={30}
            className={inputClass}
          />
        </div>

        {/* Full name */}
        <div>
          <label htmlFor={`${side}-name`} className="text-[11px] text-ink/80 font-medium block mb-1.5">
            Nama Lengkap + Gelar <span className="text-red-400">*</span>
          </label>
          <input
            id={`${side}-name`}
            value={name}
            onChange={(e) => { setName(e.target.value); onDirty?.(); }}
            placeholder="Contoh: Dani Chusyaini, S.Kom."
            required
            maxLength={100}
            className={inputClass}
          />
        </div>

        {/* Parents */}
        <div>
          <label htmlFor={`${side}-parents`} className="text-[11px] text-ink/80 font-medium block mb-1.5">
            Putra/Putri dari <span className="text-red-400">*</span>
          </label>
          <input
            id={`${side}-parents`}
            value={parents}
            onChange={(e) => { setParents(e.target.value); onDirty?.(); }}
            placeholder="Contoh: Putra Bapak Ahmad & Ibu Siti"
            required
            maxLength={150}
            className={inputClass}
          />
        </div>

        {/* Social links */}
        <div>
          <label className="text-[11px] text-ink/80 font-medium block mb-1.5">Tautan Sosial</label>
          {links.length > 0 && (
            <div className="space-y-2 mb-2">
              {links.map((link, idx) => (
                <div key={idx} className="flex gap-2 items-start">
                  <div className="flex-1 space-y-1.5">
                    <select
                      value={link.label}
                      onChange={(e) => updateSocialLink(side, idx, "label", e.target.value)}
                      aria-label={`Platform tautan ${idx + 1}`}
                      className={inputClass}
                    >
                      <option value="">Pilih Platform</option>
                      <option value="Instagram">Instagram</option>
                      <option value="LinkedIn">LinkedIn</option>
                      <option value="WhatsApp">WhatsApp</option>
                      <option value="Threads">Threads</option>
                      <option value="Twitter">Twitter</option>
                      <option value="Tiktok">Tiktok</option>
                      <option value="Lainnya">Lainnya</option>
                    </select>
                    <input
                      type={link.label === 'WhatsApp' ? 'tel' : 'url'}
                      value={link.url}
                      onChange={(e) => updateSocialLink(side, idx, "url", e.target.value)}
                      placeholder={getUrlPlaceholder(link.label)}
                      aria-label={`URL tautan ${idx + 1}`}
                      className={inputClass}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => removeSocialLink(side, idx)}
                    className="mt-2 w-8 h-8 flex items-center justify-center rounded-lg text-red-300 hover:text-red-500 hover:bg-red-50 transition-colors flex-shrink-0"
                    aria-label="Hapus tautan"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
          <button
            type="button"
            onClick={() => addSocialLink(side)}
            className="text-gold text-[11px] font-bold flex items-center gap-1 hover:underline underline-offset-2"
          >
            <Plus className="w-3.5 h-3.5" /> Tambah Tautan
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {renderSide("groom", "Pengantin Pria", "Informasi Pengantin Pria", groomNickname, setGroomNickname, groomName, setGroomName, groomParents, setGroomParents, groomPhotoPreview, groomPhotoFile, groomSocialLinks)}
      {renderSide("bride", "Pengantin Wanita", "Informasi Pengantin Wanita", brideNickname, setBrideNickname, brideName, setBrideName, brideParents, setBrideParents, bridePhotoPreview, bridePhotoFile, brideSocialLinks)}

      {error && <p className="text-xs text-red-500 text-center">{error}</p>}
      {compressionInfo && <p className="text-[10px] text-green-600 text-center">{compressionInfo}</p>}

      {/* Progress bar */}
      {step != null && totalSteps != null && totalSteps > 0 && (() => {
        const pct = Math.round(((step + 1) / totalSteps) * 100);
        const barColor = pct <= 25 ? 'bg-red-400' : pct <= 50 ? 'bg-orange-400' : pct <= 75 ? 'bg-yellow-400' : 'bg-green-500';
        return (
          <div className="space-y-1">
            <div className="h-2 bg-ink/5 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${barColor}`}
                style={{ width: `${pct}%` }}
              />
            </div>
            <p className="text-[10px] text-ink/80 text-right">{step + 1} dari {totalSteps}</p>
          </div>
        );
      })()}

      <button type="submit" disabled={isSaving || isCompressing} className="w-full py-3 bg-gold text-ivory rounded-full text-xs tracking-[0.3em] font-black uppercase disabled:opacity-50 shadow-lg shadow-gold/20">
        {isSaving ? "Menyimpan..." : "Simpan & Lanjutkan"}
      </button>
      <CompressionModal isOpen={isCompressing} current={compressProgress.current} total={compressProgress.total} currentFileName={compressProgress.fileName} />
    </form>
  );
}
