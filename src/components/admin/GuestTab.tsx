'use client';
import { useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { WeddingDocument } from '@/types/firestore';
import { BASE_URL } from '@/constants/baseUrl';
import { buildGuestInvitationUrl } from '@/utils/guestInvitation';
import {
  buildGuestMessageVariableOptions,
  canonicalizeGuestMessageVariableKey,
  createGuestMessageContext,
  getDefaultGuestMessageTemplate,
  normalizeGuestMessageTemplate,
  replaceGuestMessageVariables,
  validateGuestMessageTemplate,
  type GuestMessageVariableOption,
  type GuestMessageWeddingFields,
} from '@/utils/guestMessageVariables';

interface GuestTabProps {
  data: WeddingDocument | null;
  slug: string;
  onSave: (fields: Partial<WeddingDocument>) => void;
  isSaving?: boolean;
  onDirty?: () => void;
  step?: number;
  totalSteps?: number;
}

const MAX_TEMPLATE_LENGTH = 1600;

function serializeMessageEditor(root: HTMLElement) {
  const walk = (node: ChildNode): string => {
    if (node.nodeType === Node.TEXT_NODE) return node.textContent ?? '';
    if (!(node instanceof HTMLElement)) return '';

    const variableKey = node.dataset.variableKey;
    if (variableKey) return `{${variableKey}}`;
    if (node.tagName === 'BR') return '\n';

    const childText = Array.from(node.childNodes).map(walk).join('');
    if (node !== root && node.tagName === 'DIV') return `${childText}\n`;
    return childText;
  };

  return Array.from(root.childNodes).map(walk).join('').replace(/\u00a0/g, ' ');
}

function insertTextAtCursor(editor: HTMLElement, text: string) {
  editor.focus();
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0 || !editor.contains(selection.anchorNode)) {
    editor.appendChild(document.createTextNode(text));
    return;
  }

  const range = selection.getRangeAt(0);
  range.deleteContents();
  range.insertNode(document.createTextNode(text));
  range.collapse(false);
  selection.removeAllRanges();
  selection.addRange(range);
}

function groupVariables(options: GuestMessageVariableOption[]) {
  return options.reduce<Record<string, GuestMessageVariableOption[]>>((groups, option) => {
    groups[option.group] = groups[option.group] ?? [];
    groups[option.group].push(option);
    return groups;
  }, {});
}

function labelForMissingVariable(key: string, options: GuestMessageVariableOption[]) {
  const direct = options.find(option => canonicalizeGuestMessageVariableKey(option.key) === key);
  if (direct) return direct.label;
  if (key === 'tanggal acara') return 'Tanggal acara';
  if (key === 'lokasi acara') return 'Lokasi acara';
  return key;
}

export function GuestTab({ data, slug, onSave, isSaving, onDirty, step, totalSteps }: GuestTabProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [defaultGuest, setDefaultGuest] = useState(data?.defaultGuest ?? '');
  const [templateError, setTemplateError] = useState('');
  const [greetingTemplate, setGreetingTemplate] = useState(
    normalizeGuestMessageTemplate(data?.greetingTemplate ?? getDefaultGuestMessageTemplate()),
  );

  const sampleGuestName = defaultGuest.trim() || 'Budi Santoso';
  const invitationUrl = buildGuestInvitationUrl(BASE_URL, slug, sampleGuestName);
  const weddingForVariables: GuestMessageWeddingFields = useMemo(() => ({
    greetingTemplate,
    groomNickname: data?.groomNickname ?? 'Pria',
    brideNickname: data?.brideNickname ?? 'Wanita',
    groomName: data?.groomName ?? data?.groomNickname ?? 'Pengantin Pria',
    brideName: data?.brideName ?? data?.brideNickname ?? 'Pengantin Wanita',
    groomParents: data?.groomParents ?? '',
    brideParents: data?.brideParents ?? '',
    eventDate: data?.eventDate ?? '',
    eventCity: data?.eventCity ?? '',
    ceremonies: data?.ceremonies ?? [],
  }), [data, greetingTemplate]);

  const variableOptions = useMemo(
    () => buildGuestMessageVariableOptions({
      guestName: sampleGuestName,
      invitationUrl,
      wedding: weddingForVariables,
    }),
    [invitationUrl, sampleGuestName, weddingForVariables],
  );

  const optionByKey = useMemo(() => {
    return new Map(variableOptions.map(option => [canonicalizeGuestMessageVariableKey(option.key), option]));
  }, [variableOptions]);

  const groupedVariables = useMemo(() => groupVariables(variableOptions), [variableOptions]);
  const validation = useMemo(() => validateGuestMessageTemplate(greetingTemplate, variableOptions), [greetingTemplate, variableOptions]);
  const previewText = replaceGuestMessageVariables(
    greetingTemplate,
    createGuestMessageContext({
      guest: { name: sampleGuestName },
      wedding: weddingForVariables,
      invitationUrl,
    }),
  );

  const syncTemplateFromEditor = () => {
    if (!editorRef.current) return;
    const nextTemplate = normalizeGuestMessageTemplate(serializeMessageEditor(editorRef.current)).slice(0, MAX_TEMPLATE_LENGTH);
    setGreetingTemplate(nextTemplate);
    setTemplateError('');
    onDirty?.();
  };

  const insertVariable = (variableKey: string) => {
    const tokenText = `{${variableKey}}`;
    if (editorRef.current) {
      insertTextAtCursor(editorRef.current, tokenText);
      syncTemplateFromEditor();
      return;
    }

    setGreetingTemplate((prev) => normalizeGuestMessageTemplate(`${prev}${prev.endsWith('\n') || prev.endsWith(' ') || !prev ? '' : ' '}${tokenText}`));
    setTemplateError('');
    onDirty?.();
  };

  const handleSaveTemplate = (e: React.FormEvent) => {
    e.preventDefault();
    const normalizedTemplate = normalizeGuestMessageTemplate(greetingTemplate).trim();
    const nextValidation = validateGuestMessageTemplate(normalizedTemplate, variableOptions);

    if (normalizedTemplate.length > MAX_TEMPLATE_LENGTH) {
      setTemplateError(`Template terlalu panjang. Maksimal ${MAX_TEMPLATE_LENGTH} karakter.`);
      return;
    }

    if (!nextValidation.isValid) {
      setTemplateError('Perbaiki variable pesan sebelum menyimpan.');
      return;
    }

    setTemplateError('');
    onSave({ greetingTemplate: normalizedTemplate, defaultGuest: defaultGuest.trim() });
  };

  const renderTemplateParts = () => {
    const parts: ReactNode[] = [];
    const tokenPattern = /\{([^{}]+)\}/g;
    let lastIndex = 0;
    let partIndex = 0;
    let match: RegExpExecArray | null;

    while ((match = tokenPattern.exec(greetingTemplate)) !== null) {
      if (match.index > lastIndex) parts.push(greetingTemplate.slice(lastIndex, match.index));

      const canonicalKey = canonicalizeGuestMessageVariableKey(match[1]);
      const option = optionByKey.get(canonicalKey);
      if (option) {
        parts.push(
          <span
            key={`${option.key}-${partIndex}`}
            contentEditable={false}
            data-variable-key={option.key}
            className="mx-0.5 inline-flex align-baseline rounded-full bg-gold px-2 py-0.5 text-[10px] font-black uppercase tracking-wide text-ivory shadow-sm"
          >
            {option.label}
          </span>,
        );
      } else {
        parts.push(match[0]);
      }

      lastIndex = tokenPattern.lastIndex;
      partIndex += 1;
    }

    if (lastIndex < greetingTemplate.length) parts.push(greetingTemplate.slice(lastIndex));
    return parts;
  };

  const renderValidationMessages = validation.isValid && greetingTemplate.length <= MAX_TEMPLATE_LENGTH ? null : (
    <div className="rounded-xl border border-red-100 bg-red-50/50 px-3 py-2 text-[10px] leading-relaxed text-red-600">
      {templateError && <p className="font-bold">{templateError}</p>}
      {validation.missingRequired.length > 0 && (
        <p>Variable wajib belum lengkap: {validation.missingRequired.map(key => labelForMissingVariable(key, variableOptions)).join(', ')}.</p>
      )}
      {validation.unknownPlaceholders.length > 0 && (
        <p>Placeholder tidak dikenal: {validation.unknownPlaceholders.map(key => `{${key}}`).join(', ')}.</p>
      )}
      {validation.brokenFragments.length > 0 && (
        <p>Placeholder belum utuh: {validation.brokenFragments.join(', ')}.</p>
      )}
      {greetingTemplate.length > MAX_TEMPLATE_LENGTH && (
        <p>Template terlalu panjang. Maksimal {MAX_TEMPLATE_LENGTH} karakter.</p>
      )}
    </div>
  );

  return (
    <form onSubmit={handleSaveTemplate} className="space-y-4">
      {/* Default guest name card */}
      <div className="bg-white rounded-2xl border border-gold/10 shadow-sm overflow-hidden">
        <div className="border-l-4 border-gold px-4 py-3 bg-gold/[0.03]">
          <h3 className="font-base text-[13px] text-ink">Nama Tamu Default</h3>
        </div>
        <div className="p-4">
          <label htmlFor="default-guest" className="text-[11px] text-ink/80 font-medium block mb-1.5">
            Dipakai untuk preview dan tautan undangan tanpa parameter nama tamu.
          </label>
          <input
            id="default-guest"
            value={defaultGuest}
            onChange={(e) => { setDefaultGuest(e.target.value); onDirty?.(); }}
            placeholder="Contoh: Tamu Undangan"
            maxLength={50}
            className="w-full px-3 py-2.5 border border-gold/20 rounded-xl text-sm bg-white focus:outline-none focus:border-gold/50 transition-colors"
          />
        </div>
      </div>

      {/* Greeting Template card */}
      <div className="bg-white rounded-2xl border border-gold/10 shadow-sm overflow-hidden">
        <div className="border-l-4 border-gold px-4 py-3 bg-gold/[0.03]">
          <h3 className="font-base text-[13px] text-ink">Template WhatsApp</h3>
        </div>
        <div className="p-4 space-y-3">
          <p className="text-[11px] leading-relaxed text-ink/80">
            Template ini digunakan saat mengirim undangan dari tab Tamu. Sisipkan variable dari tombol di bawah agar nama, link, dan detail acara tidak salah format.
          </p>

          <div className="space-y-2">
            {Object.entries(groupedVariables).map(([group, options]) => (
              <details key={group} open={group === 'Tamu' || group === 'Pengantin'} className="rounded-xl border border-gold/10 bg-ivory/30 px-3 py-2">
                <summary className="cursor-pointer text-[10px] font-black uppercase tracking-widest text-gold">
                  {group}
                </summary>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {options.map((option) => (
                    <button
                      key={option.key}
                      type="button"
                      onClick={() => insertVariable(option.key)}
                      className="rounded-full bg-gold/10 px-2.5 py-1 text-[10px] font-bold text-gold transition-colors hover:bg-gold hover:text-ivory"
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </details>
            ))}
          </div>

          <div
            ref={editorRef}
            contentEditable
            suppressContentEditableWarning
            role="textbox"
            aria-label="Template pesan undangan"
            tabIndex={0}
            onInput={syncTemplateFromEditor}
            onBlur={syncTemplateFromEditor}
            onKeyDown={(e) => {
              if (e.key !== 'Enter' || !editorRef.current) return;
              e.preventDefault();
              insertTextAtCursor(editorRef.current, '\n');
              syncTemplateFromEditor();
            }}
            onPaste={(e) => {
              if (!editorRef.current) return;
              e.preventDefault();
              insertTextAtCursor(editorRef.current, e.clipboardData.getData('text/plain'));
              syncTemplateFromEditor();
            }}
            className="min-h-[240px] w-full whitespace-pre-wrap break-words rounded-xl border border-gold/20 bg-white px-3 py-2.5 font-mono text-xs leading-relaxed text-ink focus:border-gold/50 focus:outline-none"
          >
            {renderTemplateParts()}
          </div>

          <p className={`text-[9px] text-right ${greetingTemplate.length > MAX_TEMPLATE_LENGTH ? 'text-red-500' : 'text-gold'}`}>
            {greetingTemplate.length}/{MAX_TEMPLATE_LENGTH}
          </p>

          {renderValidationMessages}

          {/* Preview */}
          <details className="border border-gold/10 rounded-xl overflow-hidden">
            <summary className="px-4 py-2.5 text-[10px] uppercase tracking-widest text-gold font-black cursor-pointer hover:bg-gold/5 transition-colors">
              Contoh Pesan dari Tab Tamu
            </summary>
            <div className="px-4 py-3 bg-paper/50 border-t border-gold/5">
              <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-ink/60">Untuk: {sampleGuestName}</p>
              <p className="text-xs text-ink/80 whitespace-pre-line leading-relaxed break-words">{previewText}</p>
            </div>
          </details>
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

      <button
        type="submit"
        disabled={isSaving}
        className="w-full py-3 bg-gold text-ivory rounded-full text-xs tracking-[0.3em] font-black uppercase disabled:opacity-50 shadow-lg shadow-gold/20"
      >
        {isSaving ? 'Menyimpan...' : 'Simpan & Lanjutkan'}
      </button>
    </form>
  );
}
