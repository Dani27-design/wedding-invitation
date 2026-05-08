import { useState } from "react";
import { WeddingDocument } from "../../types/firestore";
import { Upload, Trash2, Plus } from "lucide-react";

interface CoupleFormProps {
  data: WeddingDocument | null;
  onSave: (
    fields: Partial<WeddingDocument>,
    files?: Record<string, File>,
    urlsToDelete?: string[],
  ) => void;
  isSaving?: boolean;
}

const MAX_IMAGE_SIZE = 100 * 1024 * 1024;

export function CoupleForm({ data, onSave, isSaving }: CoupleFormProps) {
  const [error, setError] = useState("");
  const [groomNickname, setGroomNickname] = useState(data?.groomNickname ?? "");
  const [groomName, setGroomName] = useState(data?.groomName ?? "");
  const [groomParents, setGroomParents] = useState(data?.groomParents ?? "");
  const [brideNickname, setBrideNickname] = useState(data?.brideNickname ?? "");
  const [brideName, setBrideName] = useState(data?.brideName ?? "");
  const [brideParents, setBrideParents] = useState(data?.brideParents ?? "");
  const [groomPhotoPreview, setGroomPhotoPreview] = useState(
    data?.groomPhoto ?? "",
  );
  const [bridePhotoPreview, setBridePhotoPreview] = useState(
    data?.bridePhoto ?? "",
  );

  console.log("CoupleForm previews:", {
    groom: groomPhotoPreview,
    bride: bridePhotoPreview,
  });
  const [groomSocialLinks, setGroomSocialLinks] = useState(
    data?.groomSocialLinks ?? [],
  );
  const [brideSocialLinks, setBrideSocialLinks] = useState(
    data?.brideSocialLinks ?? [],
  );
  const [groomPhotoFile, setGroomPhotoFile] = useState<File | null>(null);
  const [bridePhotoFile, setBridePhotoFile] = useState<File | null>(null);
  const [urlsToDelete, setUrlsToDelete] = useState<string[]>([]);

  const updateSocialLink = (
    side: "groom" | "bride",
    idx: number,
    field: "label" | "url",
    value: string,
  ) => {
    const setter = side === "groom" ? setGroomSocialLinks : setBrideSocialLinks;
    const current = side === "groom" ? groomSocialLinks : brideSocialLinks;
    const next = [...current];
    next[idx] = { ...next[idx], [field]: value };
    setter(next);
  };

  const addSocialLink = (side: "groom" | "bride") => {
    const setter = side === "groom" ? setGroomSocialLinks : setBrideSocialLinks;
    const current = side === "groom" ? groomSocialLinks : brideSocialLinks;
    setter([...current, { label: "", url: "" }]);
  };

  const removeSocialLink = (side: "groom" | "bride", idx: number) => {
    const setter = side === "groom" ? setGroomSocialLinks : setBrideSocialLinks;
    const current = side === "groom" ? groomSocialLinks : brideSocialLinks;
    setter(current.filter((_, i) => i !== idx));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const files: Record<string, File> = {};
    if (groomPhotoFile) files.groomPhoto = groomPhotoFile;
    if (bridePhotoFile) files.bridePhoto = bridePhotoFile;
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

  const renderUploadField = (
    side: "groom" | "bride",
    preview: string,
    file: File | null,
  ) => (
    <div className="space-y-2">
      <label className="text-xs text-ink/60 block">Foto</label>
      <div className="flex items-center gap-4">
        {preview !== "" && (
          <div className="relative w-16 h-16 flex-shrink-0">
            <img
              src={preview}
              alt={side}
              className="w-full h-full object-cover rounded-xl border border-gold/10"
            />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <label className="flex items-center justify-center gap-2 px-4 py-2.5 border-2 border-dashed border-gold/30 rounded-xl cursor-pointer hover:bg-gold/5 transition-colors group">
            <Upload className="w-4 h-4 text-gold group-hover:scale-110 transition-transform" />
            <span className="text-[10px] font-black text-gold uppercase tracking-widest">
              Pilih Foto
            </span>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handlePhotoChange(side, e.target.files?.[0])}
              className="hidden"
            />
          </label>
          {file && (
            <p className="mt-1.5 text-[10px] text-ink/40 truncate font-mono text-center">
              {file.name}
            </p>
          )}
        </div>
      </div>
    </div>
  );

  const inputClass =
    "w-full px-4 py-3 border border-gold/20 rounded-xl text-sm bg-white focus:outline-none focus:border-gold/50 transition-all";

  const handlePhotoChange = (
    side: "groom" | "bride",
    file: File | undefined,
  ) => {
    if (!file) return;
    if (file.size > MAX_IMAGE_SIZE) {
      setError("Ukuran foto maksimal 100MB");
      return;
    }
    setError("");
    const url = URL.createObjectURL(file);
    if (side === "groom") {
      setGroomPhotoFile(file);
      setGroomPhotoPreview(url);
    } else {
      setBridePhotoFile(file);
      setBridePhotoPreview(url);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <fieldset className="space-y-3">
        <legend className="text-xs uppercase tracking-[0.3em] text-gold font-black mb-3">
          Pengantin Pria
        </legend>
        <input
          value={groomNickname}
          onChange={(e) => setGroomNickname(e.target.value)}
          placeholder="Nama Panggilan"
          required
          maxLength={30}
          aria-label="Nama Panggilan Pria"
          className={inputClass}
        />
        <input
          value={groomName}
          onChange={(e) => setGroomName(e.target.value)}
          placeholder="Nama Lengkap + Gelar"
          required
          maxLength={100}
          aria-label="Nama Lengkap Pria"
          className={inputClass}
        />
        <input
          value={groomParents}
          onChange={(e) => setGroomParents(e.target.value)}
          placeholder="Putra/Putri dari..."
          required
          maxLength={150}
          aria-label="Orang Tua Pria"
          className={inputClass}
        />
        {renderUploadField("groom", groomPhotoPreview, groomPhotoFile)}
        <div className="space-y-2 pt-2 border-t border-gold/10">
          <label className="text-xs text-ink/60 block">Tautan Sosial</label>
          {groomSocialLinks.map((link, idx) => (
            <div key={idx} className="flex gap-2">
              <select
                value={link.label}
                onChange={(e) =>
                  updateSocialLink("groom", idx, "label", e.target.value)
                }
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
                value={link.url}
                onChange={(e) =>
                  updateSocialLink("groom", idx, "url", e.target.value)
                }
                placeholder="URL"
                className={inputClass}
              />
              <button
                type="button"
                onClick={() => removeSocialLink("groom", idx)}
                className="text-red-400 p-2"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => addSocialLink("groom")}
            className="text-gold text-[10px] font-black uppercase tracking-widest flex items-center gap-1 hover:underline"
          >
            <Plus className="w-3 h-3" /> Tambah Tautan
          </button>
        </div>
      </fieldset>

      <fieldset className="space-y-3">
        <legend className="text-xs uppercase tracking-[0.3em] text-gold font-black mb-3">
          Pengantin Wanita
        </legend>
        <input
          value={brideNickname}
          onChange={(e) => setBrideNickname(e.target.value)}
          placeholder="Nama Panggilan"
          required
          maxLength={30}
          aria-label="Nama Panggilan Wanita"
          className={inputClass}
        />
        <input
          value={brideName}
          onChange={(e) => setBrideName(e.target.value)}
          placeholder="Nama Lengkap + Gelar"
          required
          maxLength={100}
          aria-label="Nama Lengkap Wanita"
          className={inputClass}
        />
        <input
          value={brideParents}
          onChange={(e) => setBrideParents(e.target.value)}
          placeholder="Putra/Putri dari..."
          required
          maxLength={150}
          aria-label="Orang Tua Wanita"
          className={inputClass}
        />
        {renderUploadField("bride", bridePhotoPreview, bridePhotoFile)}
        <div className="space-y-2 pt-2 border-t border-gold/10">
          <label className="text-xs text-ink/60 block">Tautan Sosial</label>
          {brideSocialLinks.map((link, idx) => (
            <div key={idx} className="flex gap-2">
              <select
                value={link.label}
                onChange={(e) =>
                  updateSocialLink("bride", idx, "label", e.target.value)
                }
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
                value={link.url}
                onChange={(e) =>
                  updateSocialLink("bride", idx, "url", e.target.value)
                }
                placeholder="URL"
                className={inputClass}
              />
              <button
                type="button"
                onClick={() => removeSocialLink("bride", idx)}
                className="text-red-400 p-2"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => addSocialLink("bride")}
            className="text-gold text-[10px] font-black uppercase tracking-widest flex items-center gap-1 hover:underline"
          >
            <Plus className="w-3 h-3" /> Tambah Tautan
          </button>
        </div>
      </fieldset>

      {error && <p className="text-xs text-red-500 text-center">{error}</p>}
      <button
        type="submit"
        disabled={isSaving}
        className="w-full py-3 bg-gold text-ivory rounded-full text-xs tracking-[0.3em] font-black uppercase disabled:opacity-50"
      >
        {isSaving ? "Menyimpan..." : "Simpan"}
      </button>
    </form>
  );
}
