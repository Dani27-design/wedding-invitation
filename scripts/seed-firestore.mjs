/**
 * Seed Firestore with initial wedding data.
 * Uses Firebase Admin SDK to bypass security rules.
 *
 * Pre-requisite:
 *   1. Create .env file with Firebase Admin credentials (see .env.example)
 *   2. Run: node scripts/seed-firestore.mjs
 *
 * Idempotent: Checks if weddings/dani-marini exists before writing.
 */

import 'dotenv/config';
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';

const projectId = process.env.FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
const privateKey = process.env.FIREBASE_PRIVATE_KEY;

if (!projectId || !clientEmail || !privateKey) {
  console.error('Missing Firebase Admin env vars: FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY');
  process.exit(1);
}

initializeApp({
  credential: cert({
    projectId,
    clientEmail,
    privateKey: privateKey.replace(/\\n/g, '\n'),
  }),
});

const db = getFirestore();

const SLUG = 'dani-marini';

// ─── Wedding Document ─────────────────────────────────────────────────────────

const weddingData = {
  adminIds: [],
  status: 'published',
  createdAt: FieldValue.serverTimestamp(),
  updatedAt: FieldValue.serverTimestamp(),

  // Couple — Groom
  groomNickname: 'Dani',
  groomName: 'M. Daniansyah Chusyaidin, S.Kom',
  groomParents: 'Putra Bapak M. Safiudin Sukri & Ibu Indiarti',
  groomPhoto: '/images/bride_and_groom_full_body_potrait.jpeg',
  groomSocialLinks: [
    { label: 'Instagram', url: 'https://instagram.com/danichusyaidin' },
    { label: 'LinkedIn', url: 'https://id.linkedin.com/in/daniansyahchusyaidin' }
  ],

  // Couple — Bride
  brideNickname: 'Marini',
  brideName: 'Siti Nur Marini, A.Md.M',
  brideParents: 'Putri Bapak Margono & Ibu (Almh) Sulami',
  bridePhoto: '/images/bride_and_groom_full_body_potrait.jpeg',
  brideSocialLinks: [
    { label: 'Instagram', url: 'https://instagram.com/mariniw_' },
    { label: 'Threads', url: 'https://threads.com/@mariniw_' }
  ],

  defaultGuest: 'Tamu Terkasih Kami',

  // Event
  eventDate: '2026-08-29',
  eventCity: 'Surabaya',
  venueName: 'Gedung Wanita Candra Kencana',
  venueAddress: 'Jl. Kalibokor Selatan No.2, Baratajaya, Gubeng, Surabaya',
  venueMapsUrl: 'https://www.google.com/maps/dir//GEDUNG+WANITA+Candra+Kencana,+Pucang+Sewu,+Jl.+Kalibokor+Selatan+No.2,+Baratajaya,+Kec.+Gubeng,+Surabaya,+Jawa+Timur+60284/@-7.3571367,112.7509655,15z/data=!4m8!4m7!1m0!1m5!1m1!1s0x2dd7fbb53b29cbb7:0xee33be91a97dbb70!2m2!1d112.7618051!2d-7.2878229?entry=ttu&g_ep=EgoyMDI2MDQyOC4wIKXMDSoASAFQAw%3D%3D',
  ceremonies: [
    { name: 'Akad Nikah', start: '09:00', end: '10:00' },
    { name: 'Resepsi', start: '10:00', end: '13:00' },
  ],

  // Story
  story: [
    { year: '2016 — 2017', text: 'Berawal dari chat sederhana,\nlalu kita dipertemukan di dunia nyata.\n\nCappucino cincau dan Indomaret Point—\njadi saksi awal cerita kita.', bgImage: '/images/bride_and_groom_full_body_potrait.jpeg' },
    { year: '2018 — 2022', text: 'Kita berjalan beriringan,\nmelewati hari-hari yang mungkin terlihat biasa,\ntapi selalu terasa berbeda saat dijalani bersama.', bgImage: '/images/bride_and_groom_full_body_potrait.jpeg' },
    { year: '2023', text: 'Kita sampai di satu titik,\nsaling menyaksikan langkah masing-masing,\ndan tetap memilih untuk ada di sisi satu sama lain.', bgImage: '/images/bride_and_groom_full_body_potrait.jpeg' },
    { year: '2024 — 2025', text: 'Hubungan ini tidak lagi sekadar berjalan,\ntapi mulai menuju arah yang sama.\n\nDari cerita yang kita jalani,\nperlahan menjadi tujuan yang kita pilih.', bgImage: '/images/bride_and_groom_full_body_potrait.jpeg' },
    { year: '2026', text: 'Setelah semua perjalanan ini,\nkita memutuskan untuk melangkah lebih jauh—\nbersama, selamanya.', bgImage: '/images/bride_and_groom_full_body_potrait.jpeg' },
    { year: 'Ikrar', text: 'Bukan perjalanan yang singkat,\ndan tidak selalu mudah.\nAda waktu yang menguji,\nada langkah yang sempat rapuh.\n\nNamun kami tetap memilih,\nuntuk tidak berhenti satu sama lain.\n\nHingga akhirnya kami sampai di titik ini,\ntapi karena kami memutuskan\nuntuk tetap melaluinya bersama.', bgImage: '/images/bride_and_groom_full_body_potrait.jpeg' },
  ],

  // Gallery
  gallery: [
    '/images/bride_and_groom_full_body_potrait.jpeg',
    '/images/bride_and_groom_full_body_potrait.jpeg',
    '/images/bride_and_groom_full_body_potrait.jpeg',
    '/images/bride_and_groom_full_body_potrait.jpeg',
    '/images/bride_and_groom_full_body_potrait.jpeg',
    '/images/bride_and_groom_full_body_potrait.jpeg',
    '/images/bride_and_groom_full_body_potrait.jpeg',
    '/images/bride_and_groom_full_body_potrait.jpeg',
    '/images/bride_and_groom_full_body_potrait.jpeg',
    '/images/bride_and_groom_full_body_potrait.jpeg',
    '/images/bride_and_groom_full_body_potrait.jpeg',
    '/images/bride_and_groom_full_body_potrait.jpeg',
  ],

  // Gift accounts
  giftAccounts: [
    { bank: 'BCA', account: '1234567890', owner: 'M. Daniansyah Chusyaidin' },
    { bank: 'BRI', account: '0987654321', owner: 'Siti Nur Marini' },
    { bank: 'Jenius', account: '111222333444', owner: 'M. Daniansyah Chusyaidin' },
    { bank: 'BTN', account: '777888999000', owner: 'Siti Nur Marini' },
    { bank: 'Gopay', account: '08123456789', owner: 'M. Daniansyah Chusyaidin' },
    { bank: 'Seabank', account: '08987654321', owner: 'Siti Nur Marini' },
  ],

  // Media
  musicUrl: '/musics/adele-make-you-feel-my-love.mp3',
  twibbonOverlay: '/images/twibbon-overlay.png',
  heroImage: '/images/bride_and_groom_full_body_potrait.jpeg',
  openingImage: '/images/bride_and_groom_full_body_potrait.jpeg',

  // Quran verse
  quranArabic: 'وَمِنْ آيَاتِهِ أَنْ خَلَقَ لَكُم مِّنْ أَنفُسِكُمْ أَزْوَاجًا لِّتَسْكُنُوا إِلَيْهَا وَجَعَلَ بَيْنَكُم مَّوَدَّةً وَرَحْمَةً ۚ إِنَّ فِي ذَٰلِكَ لَآيَاتٍ لِّقَوْمٍ يَتَفَكَّرُونَ',
  quranTranslation: 'Dan di antara tanda-tanda kekuasaan-Nya ialah Dia menciptakan untukmu pasangan hidup dari jenismu sendiri, supaya kamu merasa tenteram kepadanya, dan dijadikan-Nya di antaramu rasa kasih dan sayang. Sesungguhnya pada yang demikian itu benar-benar terdapat tanda-tanda bagi kaum yang berpikir.',
  quranReference: 'QS. Ar-Rum: 21',

  // Theme
  theme: {
    template: 'cinematic',
    colors: {
      accent: '#B48D3E',
      background: '#FDFCF8',
      text: '#1A1A1A',
      surface: '#F5F2ED',
      button: '#F8BBD0',
    },
    fonts: {
      heading: 'Cormorant Garamond',
      body: 'Montserrat',
      decorative: 'Playfair Display',
      script: 'Dayland',
    },
  },

  // Credits
  credits: [
    {
      name: 'M. Daniansyah C.',
      role: 'developer',
      description: 'Menulis setiap baris code di balik halaman ini, merangkainya satu per satu sampai akhirnya bisa bercerita tentang kami.',
      socialLinks: []
    },
    {
      name: 'Siti Nur Marini',
      role: 'designer',
      description: 'Memperindah setiap bagian di balik halaman ini, menyusunnya satu per satu sampai akhirnya benar-benar terasa seperti kami.',
      socialLinks: []
    },
  ],
};

// ─── Story Likes ──────────────────────────────────────────────────────────────

const storyLikesData = {
  likes: [142, 167, 128, 155, 139, 163],
};

// ─── Seed Wishes ──────────────────────────────────────────────────────────────

const seedWishes = [
  { name: 'Ahmad & Keluarga', attendance: 'yes', message: 'Selamat menempuh hidup baru Dani & Marini! Semoga menjadi keluarga sakinah mawaddah warahmah.' },
  { name: 'Budi Santoso', attendance: 'yes', message: 'Happy wedding! Titip doa terbaik buat kalian berdua.' },
  { name: 'Citra Lestari', attendance: 'no', message: 'Maaf belum bisa hadir, lancar sampai hari H ya!' },
  { name: 'Dedi Kurniawan', attendance: 'yes', message: "Baarakallahu laka wa baaraka 'alaika wa jama'a bainakuma fii khoir." },
  { name: 'Eka Putri', attendance: 'yes', message: 'Semoga bahagia selamanya, sampai kakek nenek.' },
  { name: 'Fajar Ramadhan', attendance: 'yes', message: 'Congrats brader! Akhirnya sah juga.' },
  { name: 'Gita Amalia', attendance: 'yes', message: 'Cantik banget Marini! Semoga berkah rumah tangganya.' },
  { name: 'Hadi Prasetyo', attendance: 'no', message: 'Selamat ya Dan! Maaf lagi di luar kota.' },
  { name: 'Indra Jaya', attendance: 'yes', message: 'Selamat menempuh bahtera rumah tangga baru.' },
  { name: 'Joko Susilo', attendance: 'yes', message: 'Sakinah mawaddah warahmah ya gaes.' },
  { name: 'Kiki Amelia', attendance: 'yes', message: 'Happy forever you two!' },
  { name: 'Lia Kusuma', attendance: 'yes', message: 'Lancar-lancar acaranya Marini.' },
  { name: 'Maman', attendance: 'yes', message: 'Selamat menempuh hidup baru teman.' },
  { name: 'Nina', attendance: 'no', message: 'Doa terbaik untuk kalian.' },
  { name: 'Oky', attendance: 'yes', message: 'Mantap Dani! Selamat ya.' },
  { name: 'Putu', attendance: 'yes', message: 'Rahajeng wedding Dani & Marini.' },
  { name: 'Qori', attendance: 'yes', message: 'Selamat ya kak.' },
  { name: 'Rian', attendance: 'yes', message: 'Selamat ya Dani dan Marini.' },
  { name: 'Siska', attendance: 'yes', message: 'Happy wedding day!' },
  { name: 'Tono', attendance: 'yes', message: 'Selamat berbahagia bro.' },
];

// ─── Seed Functions ───────────────────────────────────────────────────────────

async function seed() {
  console.log(`Seeding Firestore for wedding: ${SLUG}`);
  console.log(`Project: ${projectId}\n`);

  // 1. Check if wedding already exists
  const weddingRef = db.doc(`weddings/${SLUG}`);
  const weddingSnap = await weddingRef.get();
  if (weddingSnap.exists) {
    console.log('⚠ weddings/' + SLUG + ' already exists. Skipping all seeds.');
    console.log('  Delete the document manually if you want to re-seed.');
    process.exit(0);
  }

  // 2. Create wedding document
  await weddingRef.set(weddingData);
  console.log('✓ Created weddings/' + SLUG);

  // 3. Create story-likes document
  await db.doc(`story-likes/${SLUG}`).set(storyLikesData);
  console.log('✓ Created story-likes/' + SLUG);

  // 4. Create seed wishes
  const wishesCol = db.collection('wishes');
  for (const wish of seedWishes) {
    await wishesCol.add({
      weddingId: SLUG,
      name: wish.name,
      message: wish.message,
      attendance: wish.attendance,
      createdAt: FieldValue.serverTimestamp(),
    });
  }
  console.log(`✓ Created ${seedWishes.length} wishes`);

  console.log('\n✓ Seeding complete!');
  process.exit(0);
}

seed().catch((err) => {
  console.error('Seeding failed:', err);
  process.exit(1);
});
