# WeAreVote - Sistem Voting Digital

Platform voting modern untuk organisasi dengan QR code scanning, moderasi komentar real-time, dan tampilan hasil yang interaktif.

## 🎯 Fitur Utama

- **QR Code Voting**: Peserta scan QR code untuk akses cepat ke form voting
- **One Vote per Device**: Sistem mencegah voting ganda dengan localStorage
- **Moderasi Komentar**: Admin dapat mereview dan menyetujui komentar penolakan
- **Real-time Updates**: Hasil voting diperbarui secara otomatis menggunakan Supabase Realtime
- **Freeze Results**: Sembunyikan hasil sampai voting selesai untuk menghindari bias
- **Celebratory Effects**: Animasi confetti otomatis jika kandidat disetujui
- **Clean & Minimal UI**: Desain profesional dan mudah digunakan

## 🚀 Quick Start

### 1. Setup Database

1. Buka [Supabase Dashboard](https://supabase.com/dashboard)
2. Pilih project Anda
3. Buka **SQL Editor**
4. Copy & paste isi file `database-setup.sql`
5. Klik **Run** untuk membuat tables dan policies

### 2. Enable Realtime

1. Di Supabase Dashboard, buka **Database** > **Replication**
2. Centang table `votes` untuk enable realtime updates
3. Klik **Save**

### 3. Install Dependencies & Run

```bash
npm install
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000)

## 📱 Cara Penggunaan

### Untuk Panitia:

1. **Setup Proyektor**:
   - Buka `/proyektor` di browser
   - Tampilkan di layar besar/proyektor
   - QR code akan muncul di sebelah kiri

2. **Monitoring Real-time**:
   - Vote count akan update otomatis
   - Klik "Tampilkan Hasil" setelah voting selesai
   - Confetti akan muncul otomatis jika mayoritas setuju

3. **Moderasi Komentar**:
   - Buka `/admin` di HP/laptop admin
   - Review komentar yang masuk
   - Approve atau reject sebelum tampil di hasil

### Untuk Peserta:

1. Scan QR code yang ditampilkan di proyektor
2. Baca Visi & Misi kandidat
3. Pilih **SETUJU** atau **TIDAK SETUJU**
4. Jika tidak setuju, beri alasan dan komentar
5. Submit vote
6. Halaman "Terima Kasih" akan muncul

## 🏗️ Struktur Project

```
app/
├── page.tsx              # Homepage dengan navigasi
├── vote/                 # Form voting (diakses via QR)
├── terima-kasih/         # Thank you page setelah voting
├── proyektor/            # Display untuk proyektor (QR + Results)
└── admin/                # Panel moderasi komentar

lib/
└── supabase.ts          # Supabase client & types

database-setup.sql       # SQL schema untuk Supabase
```

## 🔒 Keamanan

### Client-Side Protection
- **localStorage Check**: Mencegah voting ganda dari device yang sama
- Peserta yang sudah vote akan langsung redirect ke halaman terima kasih

### Database Security (RLS)
- Row Level Security (RLS) enabled di semua tables
- Public dapat: insert votes, read approved votes
- Admin moderation untuk komentar penolakan

### Moderasi Komentar
- Semua komentar "tidak setuju" masuk queue pending
- Admin harus approve sebelum masuk ke hasil voting
- Mencegah komentar tidak pantas tampil di proyektor

## 🎨 Customization

### Mengubah Kandidat

Edit di Supabase Dashboard atau SQL Editor:

```sql
UPDATE candidates 
SET name = 'Nama Kandidat Baru',
    photo_url = '/url-foto.jpg',
    vision_mission = 'Visi dan Misi...'
WHERE id = 'candidate-id';
```

### Mengubah Warna/Style

Edit file CSS di `app/globals.css` atau inline styles di komponen.

## 📊 Database Schema

### Table: `candidates`
- `id` (uuid, primary key)
- `name` (text)
- `photo_url` (text, nullable)
- `vision_mission` (text)
- `created_at` (timestamptz)

### Table: `votes`
- `id` (uuid, primary key)
- `candidate_id` (uuid, foreign key)
- `is_approved` (boolean)
- `reason` (text, nullable)
- `custom_reason` (text, nullable)
- `comment_status` (enum: pending/approved/rejected)
- `created_at` (timestamptz)

## 🛠️ Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Database**: Supabase (PostgreSQL)
- **Styling**: Tailwind CSS
- **Real-time**: Supabase Realtime
- **QR Code**: qrcode.react
- **Animations**: react-confetti

## 📝 Environment Variables

File `.env` sudah dikonfigurasi:

```env
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-publishable-key
```

## 🔧 Troubleshooting

### QR Code tidak muncul
- Pastikan aplikasi running di localhost atau deployed
- Check browser console untuk errors

### Real-time tidak update
- Pastikan Replication sudah enable di Supabase
- Check koneksi internet
- Refresh halaman proyektor

### Vote tidak masuk database
- Check Supabase connection di `.env`
- Pastikan RLS policies sudah dibuat
- Check browser console untuk errors

## 📄 License

MIT

## 👨‍💻 Development

```bash
# Development
npm run dev

# Build
npm run build

# Start production
npm start

# Lint
npm run lint
```

---

Made with ❤️ for democratic organizations
