# 📈 Jurnal Cuan — Modern Forex Trading Journal & Analytics

**Jurnal Cuan** adalah aplikasi jurnal trading forex modern, analitik performa komprehensif, dan manajemen risiko yang dirancang untuk trader retail, prop firm trader, dan investor. Dilengkapi dengan **Kalender Cuan interaktif**, integrasi **MetaTrader 5 (MT5)**, **Live Forex Factory Economic Calendar**, **Kalkulator Lot & Risiko**, serta **Live Shareable Portfolio**.

---

## ✨ Fitur Utama

- 📊 **Dashboard & Kalender Cuan Interaktif**: Visualisasi profit/loss harian, win rate, net P&L, profit factor, dan kalender heatmap trading bulanan.
- 📝 **Pencatatan & Manajemen Trade (Multi-Portofolio)**: Catat posisi BUY/SELL, pips, risk-reward ratio, sesi (Asian, London, NY), emosi, evaluasi kesalahan, dan catatan teknikal.
- 🏢 **Multi-Akun Fleksibel**: Mulai otomatis dari akun **Demo**, dan tambah akun **Real** atau **Prop Firm (FTMO, FundedNext, dll.)** dengan fitur *autocomplete* broker.
- 📥 **Integrasi MetaTrader 5 (MT5)**:
  - Import instan statement HTML/CSV riwayat transaksi MT5.
  - Dukungan Webhook EA MT5 real-time menggunakan API Key unik per akun.
- 📰 **Kalender Berita Ekonomi Live (Forex Factory)**: Jadwal rilis berita berdampak tinggi/sedang (High/Medium Impact), filter mata uang, status rilis dinamis, dan pagination.
- 🧮 **Kalkulator Lot Size & Manajemen Risiko**: Hitung lot size ideal sebelum entry berdasarkan toleransi risiko akun (%) dan jarak Stop Loss (pips).
- 🔗 **Live Share Portfolio Publik**: Bagikan portofolio dan riwayat trade ke investor atau komunitas secara transparan (*read-only*) dengan URL publik kustom.
- 🔐 **Autentikasi Aman dengan Auth0 & PostgreSQL**: Proteksi rute otomatis multi-user yang terisolasi aman.
- 📱 **PWA Ready**: Dilengkapi Web App Manifest dan ikon untuk dipasang (*Install*) langsung di Desktop & Mobile.

---

## 🛠️ Tech Stack

- **Framework**: [Next.js 16 (App Router)](https://nextjs.org/)
- **Language**: TypeScript
- **Database**: PostgreSQL + [Prisma ORM](https://www.prisma.io/)
- **Authentication**: [Auth0](https://auth0.com/) via `@auth0/nextjs-auth0` v4
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) + Radix UI + Lucide Icons
- **Charts & Visuals**: Recharts
- **Containerization**: Docker & Docker Compose

---

## 🚀 Cara Menjalankan dengan Docker (Langsung Pasang / Plug-and-Play)

Cara tercepat untuk menjalankan **Jurnal Cuan** dan database PostgreSQL dalam 1 perintah:

### 1. Salin Environment Variable
```bash
cp .env.example .env
```
> Edit file `.env` dan masukkan kredensial Auth0 Anda (lihat panduan [Setup Auth0](#-setup-auth0)).

### 2. Jalankan Docker Compose
```bash
docker compose up -d --build
```

### 3. Akses Aplikasi
Buka browser dan kunjungi:
👉 **[http://localhost:3000](http://localhost:3000)**

*Untuk menghentikan container:*
```bash
docker compose down
```

---

## 💻 Cara Menjalankan Secara Lokal (Manual Development)

### Prasyarat
- Node.js 20+
- PostgreSQL aktif di lokal (port 5432)
- Akun Auth0 (Gratis di [auth0.com](https://auth0.com))

### 1. Clone & Install Dependencies
```bash
git clone <url-repository>
cd jurnal-cuan
npm install
```

### 2. Konfigurasi File `.env`
Buat file `.env` di root project (gunakan `.env.example` sebagai referensi):

```env
APP_ENV=development
APP_BASE_URL=http://localhost:3000

# Auth0 Configuration
AUTH0_DOMAIN=your-tenant.us.auth0.com
AUTH0_CLIENT_ID=your_client_id
AUTH0_CLIENT_SECRET=your_client_secret
AUTH0_SECRET=your_generated_secret

# PostgreSQL Database
DATABASE_URL="postgresql://postgres:admin@localhost:5432/jurnalcuan?schema=public"
```

### 3. Generate Secret & Push Skema Database
```bash
# 1. Sinkronkan skema tabel ke PostgreSQL
npm run db:push

# 2. Generate Prisma Client
npm run db:generate
```

### 4. Jalankan Server Development
```bash
npm run dev
```
Buka **[http://localhost:3000](http://localhost:3000)** di browser.

---

## 🔐 Setup Auth0

1. Buka [Auth0 Dashboard](https://manage.auth0.com) dan buat aplikasi bertipe **Regular Web Application**.
2. Masuk ke tab **Settings** aplikasi, atur URL berikut:
   - **Allowed Callback URLs**: `http://localhost:3000/auth/callback`
   - **Allowed Logout URLs**: `http://localhost:3000`
   - **Allowed Web Origins**: `http://localhost:3000`
3. Salin **Domain**, **Client ID**, dan **Client Secret** ke file `.env`.
4. Generate `AUTH0_SECRET` dengan perintah terminal:
   ```bash
   openssl rand -base64 32
   ```

---

## 📜 Daftar Perintah (Scripts)

| Perintah | Deskripsi |
|---|---|
| `npm run dev` | Menjalankan Next.js development server di port 3000 |
| `npm run build` | Melakukan compile dan build Next.js Standalone untuk production |
| `npm run start` | Menjalankan production server hasil build |
| `npm run db:push` | Mendorong perubahan skema Prisma langsung ke database PostgreSQL |
| `npm run db:generate` | Men-generate Prisma Client TypeScript |
| `npm run db:studio` | Membuka GUI Prisma Studio di `http://localhost:5555` |
| `npm run lint` | Menjalankan pengecekan ESLint |

---

## 📂 Struktur Folder Proyek

```
jurnal-cuan/
├── app/                  # Next.js App Router (Halaman & API Routes)
│   ├── api/              # API endpoints (accounts, trades, news, sync, auth)
│   ├── calendar/         # Halaman Kalender Cuan Heatmap
│   ├── calculator/       # Halaman Kalkulator Lot & Risiko
│   ├── news/             # Halaman Kalender Berita Ekonomi Live
│   ├── settings/         # Halaman Pengaturan & Multi-Akun
│   ├── share/            # Halaman Live Share Portfolio Publik
│   └── trades/           # Halaman Data Transaksi & MT5 Import
├── components/           # Reusable UI & Layout Components
├── lib/                  # Service, Prisma instance, Forex Utilities & Auth0
├── prisma/               # Schema Database PostgreSQL
├── public/               # Static assets, Web App Manifest & PWA Icons
├── Dockerfile            # Multi-stage Docker production image
├── docker-compose.yml    # Docker Compose (PostgreSQL + Next.js App)
└── .env.example          # Template konfigurasi environment variable
```

---

## 📄 Lisensi
Didistribusikan di bawah lisensi MIT. Bebas digunakan dan dikembangkan untuk kebutuhan trading pribadi maupun komersial.
