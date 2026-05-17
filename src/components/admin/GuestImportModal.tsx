'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Upload, X, FileSpreadsheet, AlertCircle } from 'lucide-react';
import { parseFile, parseGuestData, ImportedGuest } from '@/utils/guestImport';

interface GuestImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (guests: ImportedGuest[]) => Promise<void>;
}

export function GuestImportModal({ isOpen, onClose, onImport }: GuestImportModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<ImportedGuest[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [step, setStep] = useState<'upload' | 'preview'>('upload');

  const handleFileSelect = async (selectedFile: File | undefined) => {
    if (!selectedFile) return;
    if (selectedFile.size > 5 * 1024 * 1024) {
      setErrors(['File terlalu besar. Maksimal 5MB.']);
      return;
    }
    setFile(selectedFile);
    setErrors([]);
    setIsProcessing(true);
    try {
      const rows = await parseFile(selectedFile);
      const { guests, errors: parseErrors } = parseGuestData(rows);
      if (parseErrors.length > 0) {
        setErrors(parseErrors);
        setStep('upload');
      } else {
        setPreview(guests);
        setStep('preview');
      }
    } catch (err) {
      setErrors(['Gagal membaca file. Pastikan format CSV atau Excel (.xlsx) yang valid.']);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleConfirmImport = async () => {
    setIsImporting(true);
    try {
      await onImport(preview);
      handleReset();
      onClose();
    } catch (err) {
      setErrors([(err as Error).message]);
    } finally {
      setIsImporting(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setPreview([]);
    setErrors([]);
    setStep('upload');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-ink/40 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative bg-white rounded-[2rem] p-6 shadow-2xl border border-gold/10 w-full max-w-md max-h-[85vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-serif italic text-lg text-ink">Import Tamu</h3>
              <button onClick={onClose} className="p-1 text-ink/20 hover:text-ink/40">
                <X className="w-5 h-5" />
              </button>
            </div>

            {step === 'upload' && (
              <div className="space-y-4">
                <p className="text-xs text-ink/60 leading-relaxed">
                  Upload file CSV atau Excel (.xlsx) dengan kolom: <strong>Nama</strong> (wajib), No HP, Alamat, Kategori.
                </p>

                <label className="flex flex-col items-center justify-center gap-3 p-8 border-2 border-dashed border-gold/30 rounded-2xl cursor-pointer hover:bg-gold/5 transition-colors">
                  <FileSpreadsheet className="w-8 h-8 text-gold/60" />
                  <span className="text-xs font-black text-gold uppercase tracking-widest">
                    {isProcessing ? 'Memproses...' : file ? file.name : 'Pilih File'}
                  </span>
                  <span className="text-[9px] text-ink/30">CSV atau Excel (.xlsx)</span>
                  <input
                    type="file"
                    accept=".csv,.xlsx,.xls"
                    onChange={(e) => handleFileSelect(e.target.files?.[0])}
                    disabled={isProcessing}
                    className="hidden"
                  />
                </label>

                {errors.length > 0 && (
                  <div className="p-3 bg-red-50 border border-red-100 rounded-xl space-y-1">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                      <p className="text-xs text-red-600 font-bold">Gagal Import</p>
                    </div>
                    {errors.map((err, i) => (
                      <p key={i} className="text-[10px] text-red-500 ml-6">{err}</p>
                    ))}
                  </div>
                )}
              </div>
            )}

            {step === 'preview' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-xs text-ink/60">
                    <strong className="text-ink">{preview.length}</strong> tamu ditemukan
                  </p>
                  <button onClick={handleReset} className="text-[10px] text-gold underline underline-offset-4">
                    Pilih file lain
                  </button>
                </div>

                <div className="max-h-60 overflow-y-auto border border-gold/10 rounded-xl">
                  <table className="w-full text-xs">
                    <thead className="bg-paper/80 sticky top-0">
                      <tr>
                        <th className="text-left px-3 py-2 text-[9px] uppercase tracking-wider text-ink/40 font-black">Nama</th>
                        <th className="text-left px-3 py-2 text-[9px] uppercase tracking-wider text-ink/40 font-black">HP</th>
                        <th className="text-left px-3 py-2 text-[9px] uppercase tracking-wider text-ink/40 font-black">Pihak</th>
                      </tr>
                    </thead>
                    <tbody>
                      {preview.slice(0, 50).map((g, i) => (
                        <tr key={i} className="border-t border-gold/5">
                          <td className="px-3 py-2 text-ink truncate max-w-[120px]">{g.name}</td>
                          <td className="px-3 py-2 text-ink/60">{g.phone || '—'}</td>
                          <td className="px-3 py-2">
                            <span className={`text-[8px] px-1.5 py-0.5 rounded-full uppercase font-black ${
                              g.category === 'pria' ? 'bg-blue-50 text-blue-600' : 'bg-pink-50 text-pink-600'
                            }`}>
                              {g.category === 'pria' ? 'Pria' : 'Wanita'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {preview.length > 50 && (
                    <p className="text-[9px] text-ink/30 text-center py-2">...dan {preview.length - 50} tamu lainnya</p>
                  )}
                </div>

                {errors.length > 0 && (
                  <p className="text-xs text-red-500">{errors[0]}</p>
                )}

                <div className="flex gap-3">
                  <button
                    onClick={onClose}
                    className="flex-1 py-2.5 border border-gold/20 text-ink/60 rounded-full text-[10px] font-black uppercase tracking-[0.2em]"
                  >
                    Batal
                  </button>
                  <button
                    onClick={handleConfirmImport}
                    disabled={isImporting}
                    className="flex-1 py-2.5 bg-gold text-ivory rounded-full text-[10px] font-black uppercase tracking-[0.2em] disabled:opacity-50"
                  >
                    {isImporting ? 'Mengimport...' : `Import ${preview.length} Tamu`}
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
