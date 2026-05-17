# Guest Management System — Implementation Plan

> **Status:** COMPLETE — All 8 phases implemented
> **Target:** Gen-Z Indonesian couples managing wedding guest lists
> **Priority:** Core SaaS feature for customer self-service

---

## Table of Contents

1. [Data Model](#data-model)
2. [Page Architecture](#page-architecture)
3. [Dependencies](#dependencies)
4. [Feature Design](#feature-design)
5. [QR Code Design](#qr-code-design)
6. [Print Modes](#print-modes)
7. [Firestore Rules](#firestore-rules)
8. [Execution Order](#execution-order)

---

## Data Model

### New Firestore Sub-collection

**Path:** `weddings/{slug}/guests/{guestId}`

```typescript
interface Guest {
  id: string;
  name: string;
  phone: string;
  address: string;
  category: 'pria' | 'wanita';  // Tamu Pria (groom side) / Tamu Wanita (bride side)
  attendance: boolean;
  attendanceAt: Timestamp | null;
  createdAt: Timestamp;
}
```

### New Field in WeddingDocument

```typescript
greetingTemplate: string;  // Editable greeting with variables: {nama}, {pengantin}, {link}
```

**Default template:**
```
Assalamualaikum Wr. Wb.

Kepada Yth.
{nama}

Dengan memohon rahmat dan ridho Allah SWT, kami mengundang Bapak/Ibu/Saudara/i untuk hadir di acara pernikahan kami:

{pengantin}

Buka undangan: {link}

Merupakan suatu kehormatan dan kebahagiaan bagi kami apabila Bapak/Ibu/Saudara/i berkenan hadir.

Wassalamualaikum Wr. Wb.
```

---

## Page Architecture

| Location | Purpose | Complexity |
|----------|---------|-----------|
| **Admin tab "Tamu"** | Summary view: total guests, attendance stats, quick-add form, greeting template editor, link to full page | Light |
| **`/admin/{slug}/guests`** | Full guest management: paginated table, import/export, QR generation, print modes | Full |

Both share the same Firestore data. The tab is a lightweight entry point; the full page is the power tool.

### Integration with Existing Admin

- Add "Tamu" as tab #5 (after "Media", before "Hadiah") in the STEPS array
- Tab shows stats + quick-add + greeting editor
- "Kelola Semua Tamu" button links to the full page
- Full page has its own header with back-to-admin link

---

## Dependencies

| Package | Purpose | Size (gzipped) | Justification |
|---------|---------|----------------|---------------|
| `qrcode` | QR code SVG generation | ~33KB | Fastest pure-JS QR generator, generates SVG directly (sharp at any print size), zero canvas dependency |
| `xlsx` (SheetJS) | Excel (.xlsx) + CSV read/write | ~90KB tree-shaken | Industry standard, handles import and export in one library, battle-tested, extremely fast parsing |

### Performance Strategy

- Both packages are **lazy-loaded** via dynamic `import()` — only loaded when user clicks import/export/QR
- Zero impact on initial page load or admin panel bundle
- QR generation is SVG-based (no canvas, no image encoding overhead)
- Excel parsing runs in a single pass (SheetJS is optimized for speed)

---

## Feature Design

### 1. Guest List

**Tab view (summary):**
- Stats cards: "Total Tamu: 150 | Hadir: 89 | Belum: 61 | Pria: 80 | Wanita: 70"
- Quick-add form (name + phone + category)
- Button: "Kelola Semua Tamu" links to full page

**Full page (`/admin/{slug}/guests`):**
- Searchable (by name/phone)
- Filterable: category (pria/wanita), attendance (hadir/belum)
- Paginated: 20 per page, Firestore cursor-based (`startAfter`)
- Sortable by name or date added
- Columns: Name, Phone, Category, Attendance, Actions
- Actions per row: Edit, Delete, Send WhatsApp, View QR

### 2. Add/Edit Guest

- Modal form with fields:
  - Nama (required, max 100)
  - Nomor HP (optional, phone format)
  - Alamat (optional, max 200)
  - Kategori: Pihak Pria / Pihak Wanita (dropdown)
  - Kehadiran: toggle (default: false)
- Inline validation
- Save to Firestore sub-collection

### 3. Import/Export

**Import flow:**
1. User clicks "Import" button
2. File picker opens (accepts .csv, .xlsx)
3. Parse file → show preview table (first 5 rows)
4. Map columns: system auto-detects "nama", "phone", "alamat", "kategori"
5. User confirms → batch write to Firestore
6. Show result: "125 tamu berhasil diimport"

**Export flow:**
1. User clicks "Export" button
2. Choose format: CSV or Excel
3. All guests downloaded as file
4. Filename: `tamu-{slug}-{date}.csv` or `.xlsx`

**Column mapping for import:**
| CSV/Excel Column | Maps To | Required |
|-----------------|---------|----------|
| nama / name | `name` | Yes |
| hp / phone / telepon | `phone` | No |
| alamat / address | `address` | No |
| kategori / category / pihak | `category` | No (default: 'pria') |

### 4. Greeting Template

- Textarea input stored in `wedding.greetingTemplate`
- Available variables displayed as chips/buttons above textarea:
  - `{nama}` — Guest name
  - `{pengantin}` — Couple nicknames (e.g., "Dani & Marini")
  - `{link}` — Personalized invitation URL
- Live preview section showing rendered greeting with sample data
- Default template pre-filled on first use
- Saved via the existing admin save flow (handleSave)

### 5. WhatsApp Send Button

- Per-guest button in the table and in QR view
- Opens: `https://wa.me/{phone}?text={encodedGreeting}`
- Greeting auto-filled:
  - `{nama}` replaced with guest name
  - `{pengantin}` replaced with couple nicknames
  - `{link}` replaced with `https://domain.com/{slug}?to={encodedGuestName}`
- Phone number cleaned (remove spaces, dashes, add country code if needed)
- Button disabled if no phone number

### 6. QR Code Generation

- Generated client-side using `qrcode` package (SVG output)
- QR encodes: `https://domain.com/{slug}?to={encodedGuestName}`
- Themed card wrapping the QR (see design below)
- Individual view: modal with QR card + download/print/WhatsApp buttons
- Batch generation: all guests' QR codes generated on demand

---

## QR Code Design

### Single QR Card Layout

```
┌──────────────────────────────────┐
│          border: gold/20          │
│                                   │
│    ── ♡ ──                        │  decorative gold separator
│                                   │
│    [Couple Names]                 │  "Dani & Marini" — font-dayland, gold
│                                   │
│        ┌───────────────┐          │
│        │               │          │
│        │   QR CODE     │          │  SVG, ~200x200px
│        │   (themed)    │          │
│        │               │          │
│        └───────────────┘          │
│                                   │
│    [Guest Name]                   │  "Budi Santoso" — font-serif, ink
│                                   │
│    ── ♡ ──                        │  decorative gold separator
│                                   │
│    Scan untuk membuka             │  font-sans, text-xs, ink/40
│    undangan pernikahan            │
│                                   │
└──────────────────────────────────┘
```

### Design Tokens

- Background: `ivory` (#FDFCF8)
- Border: `gold/20` with rounded-2xl
- Couple name: `font-dayland`, `text-gold`
- Guest name: `font-serif italic`, `text-ink`
- Helper text: `font-sans`, `text-ink/40`, `text-xs`
- Heart separator: `text-gold/30`
- QR: black modules on white background (standard for scan reliability)
- Card size: ~300x400px (fits 4 per A4 page)

---

## Print Modes

### Single Print

- User clicks "Print" on a specific guest
- Opens a print-optimized view (`@media print`)
- Shows single QR card centered on page
- Hides all navigation/UI elements
- `window.print()` triggered

### Bulk Print

- User clicks "Print Semua QR"
- Generates a dedicated print page with all guests' QR cards
- Grid layout: 2 columns x 4 rows = 8 per A4 page (or 2x2 = 4 for larger cards)
- CSS `break-after: page` every 8 cards
- Each card shows: couple name + QR + guest name
- Page header (print only): "{slug} — Daftar QR Tamu"
- `window.print()` triggered

### Print CSS Strategy

```css
@media print {
  /* Hide everything except print content */
  body > *:not(.print-area) { display: none; }

  .print-area {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
    padding: 16px;
  }

  .qr-card {
    break-inside: avoid;
    page-break-inside: avoid;
  }

  .qr-card:nth-child(8n) {
    break-after: page;
  }
}
```

---

## Firestore Rules

### New rule for guests sub-collection

```
// ─── Guests (per-wedding sub-collection) ─────────────────
match /weddings/{slug}/guests/{guestId} {
  // Public read: allows attendance tracking from invitation page (future feature)
  allow read: if true;

  // Write: only wedding admins or super admin
  allow create, update, delete: if request.auth != null
    && (get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'super'
        || request.auth.uid in get(/databases/$(database)/documents/weddings/$(slug)).data.adminIds);
}
```

---

## Execution Order

| Phase | Scope | Files |
|-------|-------|-------|
| **1. Foundation** | ~~Guest type definition, Firestore rules, greeting template field in WeddingDocument~~ DONE | `types/firestore.ts`, `firestore.rules`, `lib/guests.ts`, `admin/page.tsx` |
| **2. Full Page** | ~~`/admin/{slug}/guests` — CRUD + paginated list + search + filter~~ DONE | `app/admin/[slug]/guests/page.tsx` |
| **3. Admin Tab** | ~~"Tamu" tab in admin panel — stats, quick-add, greeting editor~~ DONE | `admin/[slug]/page.tsx`, `components/admin/GuestTab.tsx` |
| **4. Import/Export** | ~~CSV + Excel import with preview, export with format choice~~ DONE | `utils/guestImport.ts`, `utils/guestExport.ts`, `components/admin/GuestImportModal.tsx` |
| **5. Greeting Template** | ~~Editable template + variable chips + live preview~~ DONE | In GuestTab (Phase 3) |
| **6. WhatsApp** | ~~Send button per guest, auto-fill greeting, phone cleaning~~ DONE | In guests page (Phase 2) |
| **7. QR Generation** | ~~Themed QR card component, individual view modal~~ DONE | `utils/qrGenerate.ts`, `components/admin/GuestQRCard.tsx`, `components/admin/GuestQRModal.tsx` |
| **8. Print** | ~~Single print + bulk print modes with CSS print optimization~~ DONE | `components/admin/GuestQRPrintView.tsx` |

---

## What Stays Unchanged

- Existing wedding page renders guest name from `?to=` param (no change)
- Existing RSVP/wishes system (independent — guests can still RSVP without being in the guest list)
- All current admin forms and features
- Wedding page performance (no new JS added to guest-facing pages)

---

## File Structure (Planned)

```
src/
  app/
    admin/
      [slug]/
        guests/
          page.tsx              # Full guest management page
  components/
    admin/
      GuestTab.tsx             # Tab view (stats + quick-add + greeting)
      GuestTable.tsx           # Paginated table with actions
      GuestFormModal.tsx       # Add/edit guest modal
      GuestImportModal.tsx     # Import preview + confirm
      GuestQRCard.tsx          # Themed QR card component
      GuestQRPrintView.tsx     # Bulk print layout
      GreetingTemplateEditor.tsx  # Template editor with preview
  lib/
    guests.ts                  # Firestore CRUD helpers for guests
  utils/
    guestImport.ts             # CSV/Excel parsing logic
    guestExport.ts             # CSV/Excel generation logic
    qrGenerate.ts              # QR code SVG generation wrapper
```
