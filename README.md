# Rate IG

Rate IG adalah web app berbasis Next.js untuk melihat preview profil Instagram publik tanpa login. Pengguna cukup memasukkan username, lalu aplikasi akan menampilkan ringkasan profil, statistik utama, postingan terbaru, video terbaru, dan aura score jika data yang tersedia cukup lengkap.

## Fitur Utama

- Cari profil Instagram publik dengan cepat tanpa perlu login.
- Tampilkan nama profil, bio, avatar, link eksternal, kategori bisnis, dan jumlah highlight.
- Tampilkan followers, following, total post, postingan terbaru, dan video terbaru.
- Aura score otomatis dengan breakdown profile, activity, engagement, dan consistency.
- Fallback bertingkat agar aplikasi tetap bisa digunakan saat sumber data utama tidak tersedia.

## Cara Kerja

Rate IG mengambil data profil dengan urutan fallback berikut:

1. Apify
2. Public HTML
3. Public API
4. Limited preview mode

Jika `APIFY_TOKEN` belum diisi, aplikasi tetap bisa dijalankan dalam mode preview terbatas.

## Tech Stack

- Next.js 15
- React 19
- TypeScript
- Tailwind CSS 4
- Framer Motion

## Menjalankan Proyek Secara Lokal

1. Install dependency:

```bash
npm install
```

2. Buat file `.env.local` di root project:

```bash
APIFY_TOKEN=your_apify_token_here
# opsional, hanya jika ingin mengganti actor default
APIFY_INSTAGRAM_PROFILE_ACTOR=apify~instagram-profile-scraper
```

3. Jalankan development server:

```bash
npm run dev
```

4. Buka browser di:

```text
http://localhost:3000
```

## Environment Variables

| Variable | Wajib | Keterangan |
| --- | --- | --- |
| `APIFY_TOKEN` | Tidak | Token Apify untuk mengambil data profil yang lebih lengkap. |
| `APIFY_INSTAGRAM_PROFILE_ACTOR` | Tidak | Override actor Apify. Default: `apify~instagram-profile-scraper`. |

## Scripts

```bash
npm run dev
npm run dev:turbo
npm run build
npm run start
npm run lint
```

## Catatan

- Aplikasi ditujukan untuk profil Instagram publik.
- Kelengkapan data bergantung pada sumber yang tersedia saat request dilakukan.
- Aura score hanya akan muncul jika data profil cukup untuk dianalisis.
- Saat data terbatas, aplikasi tetap menampilkan preview dasar agar tetap usable.

## Deployment

Project ini bisa dideploy ke Vercel atau platform lain yang mendukung Next.js.

## Ringkasnya

Rate IG dibuat untuk memberikan pengalaman cek profil Instagram yang cepat, ringan, dan menarik secara visual, tanpa memaksa pengguna login lebih dulu.
