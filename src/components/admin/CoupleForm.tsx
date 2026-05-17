'use client';
import { useState } from "react";
import { WeddingDocument } from "../../types/firestore";
import { Upload, Trash2, Plus } from "lucide-react";
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
}

const MAX_IMAGE_SIZE = 25 * 1024 * 1024;

export function CoupleForm({ data, onSave, isSaving, onDirty }: CoupleFormProps) {
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

  const inputClass = "w-full px-3 py-2 border border-gold/20 rounded-lg text-sm bg-white focus:outline-none focus:border-gold/50";

  const renderSide = (
    side: "groom" | "bride",
    label: string,
    nickname: string, setNickname: (v: string) => void,
    name: string, setName: (v: string) => void,
    parents: string, setParents: (v: string) => void,
    preview: string, file: File | null,
    links: { label: string; url: string }[],
  ) => (
    <fieldset className="space-y-2">
      <legend className="text-xs uppercase tracking-[0.3em] text-gold font-black mb-1">{label}</legend>

      {/* Photo + nickname inline */}
      <div className="flex items-center gap-3">
        <div className="relative w-14 h-14 rounded-xl overflow-hidden border border-gold/10 flex-shrink-0 bg-ivory">
          {preview ? (
            <img src={preview} alt={side} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Upload className="w-4 h-4 text-ink/10" />
            </div>
          )}
          <label className="absolute inset-0 cursor-pointer">
            <input type="file" accept="image/*" onChange={(e) => handlePhotoChange(side, e.target.files?.[0])} className="hidden" />
          </label>
        </div>
        <div className="flex-1 min-w-0 space-y-1.5">
          <input value={nickname} onChange={(e) => { setNickname(e.target.value); onDirty?.(); }} placeholder="Nama Panggilan" required maxLength={30} aria-label={`Nama Panggilan ${label}`} className={inputClass} />
          {file && <p className="text-[8px] text-ink/30 truncate font-mono">{file.name}</p>}
        </div>
      </div>

      <input value={name} onChange={(e) => { setName(e.target.value); onDirty?.(); }} placeholder="Nama Lengkap + Gelar" required maxLength={100} aria-label={`Nama Lengkap ${label}`} className={inputClass} />
      <input value={parents} onChange={(e) => { setParents(e.target.value); onDirty?.(); }} placeholder="Putra/Putri dari..." required maxLength={150} aria-label={`Orang Tua ${label}`} className={inputClass} />

      {/* Social links */}
      {links.length > 0 && (
        <div className="space-y-2 pt-1">
          {links.map((link, idx) => (
            <div key={idx} className="p-2 border border-gold/10 rounded-xl bg-white/30 space-y-1.5">
              <div className="flex gap-1.5 items-center">
                <select
                  value={link.label}
                  onChange={(e) => updateSocialLink(side, idx, "label", e.target.value)}
                  aria-label={`Platform tautan ${idx + 1}`}
                  className={`${inputClass} flex-1`}
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
                <button type="button" onClick={() => removeSocialLink(side, idx)} className="w-7 h-7 flex items-center justify-center rounded-lg text-red-300 hover:text-red-500 hover:bg-red-50 transition-colors flex-shrink-0" aria-label="Hapus tautan">
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
              <input
                type={link.label === 'WhatsApp' ? 'tel' : 'url'}
                value={link.url}
                onChange={(e) => updateSocialLink(side, idx, "url", e.target.value)}
                placeholder={getUrlPlaceholder(link.label)}
                aria-label={`URL tautan ${idx + 1}`}
                className={inputClass}
              />
            </div>
          ))}
        </div>
      )}
      <button type="button" onClick={() => addSocialLink(side)} className="text-gold text-[10px] font-black uppercase tracking-widest flex items-center gap-1 hover:underline">
        <Plus className="w-3 h-3" /> Tambah Tautan
      </button>
    </fieldset>
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {renderSide("groom", "Pengantin Pria", groomNickname, setGroomNickname, groomName, setGroomName, groomParents, setGroomParents, groomPhotoPreview, groomPhotoFile, groomSocialLinks)}
      {renderSide("bride", "Pengantin Wanita", brideNickname, setBrideNickname, brideName, setBrideName, brideParents, setBrideParents, bridePhotoPreview, bridePhotoFile, brideSocialLinks)}

      {error && <p className="text-xs text-red-500 text-center">{error}</p>}
      {compressionInfo && <p className="text-[10px] text-green-600 text-center">{compressionInfo}</p>}
      <button type="submit" disabled={isSaving || isCompressing} className="w-full py-3 bg-gold text-ivory rounded-full text-xs tracking-[0.3em] font-black uppercase disabled:opacity-50 shadow-lg shadow-gold/20">
        {isSaving ? "Menyimpan..." : "Simpan"}
      </button>
      <CompressionModal isOpen={isCompressing} current={compressProgress.current} total={compressProgress.total} currentFileName={compressProgress.fileName} />
    </form>
  );
}
