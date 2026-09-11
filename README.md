# 📈 Jurnal Cuan — Modern Forex Trading Journal & Analytics

**Jurnal Cuan** adalah aplikasi jurnal trading forex modern, analitik performa komprehensif, dan manajemen risiko yang dirancang untuk trader retail, prop firm trader, dan investor. Dilengkapi dengan **Kalender Cuan interaktif**, integrasi **MetaTrader 5 (MT5)**, **Live Forex Factory Economic Calendar**, **Kalkulator Lot & Risiko**, serta **Live Shareable Portfolio** dengan dukungan **Light & Dark Mode**.

---

## ✨ Fitur Utama

- 📊 **Dashboard & Kalender Cuan Interaktif**: Visualisasi profit/loss harian, win rate, net P&L, profit factor, equity curve, dan kalender heatmap trading bulanan.
- 📝 **Pencatatan & Manajemen Trade (Multi-Portofolio)**: Catat posisi BUY/SELL, pips, risk-reward ratio, sesi (Asian, London, NY), emosi, evaluasi kesalahan, dan catatan teknikal.
- 🏢 **Multi-Akun Fleksibel**: Mulai otomatis dari akun **Demo**, dan tambah akun **Real** atau **Prop Firm (FTMO, FundedNext, dll.)** dengan fitur *autocomplete* broker.
- 📥 **Integrasi MetaTrader 5 (MT5)**:
  - Import instan statement HTML/CSV riwayat transaksi MT5.
  - Dukungan Webhook EA MT5 real-time menggunakan API Key unik per akun.
  - Expert Advisor (EA) script `JurnalCuanSync.mq5` tersedia di `/public`.
- 📰 **Kalender Berita Ekonomi Live (Forex Factory)**: Jadwal rilis berita berdampak tinggi/sedang (High/Medium Impact), filter mata uang, status rilis dinamis, dan pagination.
- 🧮 **Kalkulator Lot Size & Manajemen Risiko**: Hitung lot size ideal sebelum entry berdasarkan toleransi risiko akun (%) dan jarak Stop Loss (pips).
- 📈 **Analitik Breakdown Performa**: Breakdown win rate, profitabilitas, dan performa berdasarkan pair, sesi trading, hari, dan strategi.
- 🔗 **Live Share Portfolio Publik**: Bagikan portofolio dan riwayat trade ke investor atau komunitas secara transparan (*read-only*) dengan URL publik kustom.
- 🌓 **Light & Dark Mode**: Tema gelap premium default dengan opsi mode terang yang elegan, bisa diatur dari Pengaturan.
- 🔐 **Autentikasi Aman dengan Auth0 & PostgreSQL**: Proteksi rute otomatis (`proxy.ts`) multi-user yang terisolasi aman.
- 📱 **PWA Ready**: Dilengkapi Web App Manifest dan ikon untuk dipasang (*Install*) langsung di Desktop & Mobile.

---

## 🛠️ Tech Stack

| Kategori | Teknologi | Versi |
|---|---|---|
| **Framework** | [Next.js (App Router)](https://nextjs.org/) | 16.x |
| **UI Library** | React + TypeScript | 19.x / 5.x |
| **Database** | PostgreSQL + [Prisma ORM](https://www.prisma.io/) | 16 / 7.x |
| **Authentication** | [Auth0](https://auth0.com/) via `@auth0/nextjs-auth0` | v4 |
| **Styling** | [Tailwind CSS](https://tailwindcss.com/) + Radix UI + Lucide Icons | v4 |
| **Theming** | [`next-themes`](https://github.com/pacocoursey/next-themes) | 0.4.x |
| **Charts** | [Recharts](https://recharts.org/) | v3 |
| **Table** | [TanStack Table](https://tanstack.com/table) | v8 |
| **Containerization** | Docker & Docker Compose | — |
| **Hosting DB** | [Supabase PostgreSQL](https://supabase.com/) (opsional) | — |

---

## 🚀 Cara Menjalankan dengan Docker (Plug-and-Play)

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

> **Catatan:** Docker Compose secara otomatis menjalankan `prisma db push` di dalam container (via `docker-entrypoint.sh`) untuk menyiapkan tabel database.

---

## 💻 Cara Menjalankan Secara Lokal (Manual Development)

### Prasyarat
- **Node.js 20+** (disarankan v22 LTS)
- **PostgreSQL 16+** aktif di lokal (port 5432) atau gunakan [Supabase](https://supabase.com/) sebagai hosted PostgreSQL
- **Akun Auth0** (Gratis di [auth0.com](https://auth0.com))

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
AUTH0_SECRET=your_generated_secret  # Generate via: openssl rand -hex 32

# PostgreSQL Database (Lokal)
DATABASE_URL="postgresql://postgres:admin@localhost:5432/jurnalcuan?schema=public"

# Atau gunakan Supabase PostgreSQL (cloud):
# DATABASE_URL="postgresql://postgres.[ref]:[password]@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres?sslmode=no-verify"
```

### 3. Push Skema Database & Generate Prisma Client
```bash
# Sinkronkan skema tabel ke PostgreSQL
npm run db:push

# Generate Prisma Client
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
   openssl rand -hex 32
   ```
5. *(Opsional)* Aktifkan Social Login (Google) di tab **Connections > Social** pada Auth0 Dashboard.

> **Penting:** Untuk deployment production, ganti semua URL di atas ke domain publik Anda (contoh: `https://jurnalcuan.com`).

---

## 📜 Daftar Perintah (Scripts)

| Perintah | Deskripsi |
|---|---|
| `npm run dev` | Menjalankan Next.js development server di port 3000 |
| `npm run build` | Generate Prisma Client + compile & build Next.js Standalone untuk production |
| `npm run start` | Menjalankan production server hasil build |
| `npm run db:push` | Mendorong perubahan skema Prisma langsung ke database PostgreSQL |
| `npm run db:generate` | Men-generate Prisma Client TypeScript |
| `npm run db:studio` | Membuka GUI Prisma Studio di `http://localhost:5555` |
| `npm run lint` | Menjalankan pengecekan ESLint |

---

## 📂 Struktur Folder Proyek

```
jurnal-cuan/
├── app/                       # Next.js App Router (Halaman & API Routes)
│   ├── api/                   # REST API endpoints
│   │   ├── accounts/          # CRUD akun trading
│   │   ├── auth/              # Auth0 internal API routes
│   │   ├── market/            # API kurs live & market data
│   │   ├── news/              # Proxy Forex Factory Economic Calendar
│   │   ├── share/             # API data portfolio publik
│   │   ├── sync/              # MT5 EA Webhook & File Import
│   │   └── trades/            # CRUD catatan transaksi
│   ├── analytics/             # Halaman Analitik Breakdown Performa
│   ├── calculator/            # Halaman Kalkulator Lot & Risiko
│   ├── calendar/              # Halaman Kalender Cuan Heatmap
│   ├── dashboard/             # Halaman Dashboard Utama & KPI
│   ├── news/                  # Halaman Kalender Berita Ekonomi Live
│   ├── settings/              # Halaman Pengaturan, Multi-Akun & Tema
│   ├── share/                 # Halaman Live Share Portfolio Publik
│   ├── share-settings/        # Pengaturan Privasi Live Share per Akun
│   ├── trades/                # Halaman Data Transaksi & MT5 Import
│   ├── globals.css            # Design system CSS (Light & Dark Mode)
│   ├── layout.tsx             # Root layout (ThemeProvider, Auth, Fonts)
│   └── page.tsx               # Landing page (Hero + Login Auth0)
├── components/                # Reusable UI & Layout Components
│   ├── analytics/             # Equity Curve, Breakdown Charts
│   ├── calendar/              # PnL Calendar, Day Trades Drawer
│   ├── dashboard/             # KPI Summary Cards
│   ├── layout/                # App Shell, Sidebar, Header, Mobile Nav
│   ├── market/                # Market Ticker, Sessions Clock
│   ├── settings/              # Theme Settings Card
│   ├── share/                 # Cuan Card Modal
│   ├── tools/                 # Position Size Calculator
│   ├── trades/                # Trades Table, New Trade Modal
│   ├── ui/                    # Primitif UI (Button, Badge, Input, Dialog, Tabs)
│   ├── theme-provider.tsx     # next-themes ThemeProvider wrapper
│   └── theme-toggle.tsx       # Tombol toggle Light/Dark/System
├── lib/                       # Services, Prisma, Auth0, Utilities
│   ├── auth0.ts               # Auth0 SDK instance
│   ├── auth-helpers.ts        # Server-side auth helper (getSession, getUser)
│   ├── auth-user.ts           # Client-side user state & auto-provisioning
│   ├── client-api.ts          # Client-side API fetch helpers
│   ├── forex-utils.ts         # Forex pair utilities (pip value, lot calc)
│   ├── mt5-parser.ts          # MT5 HTML/CSV statement parser
│   ├── portfolio-utils.ts     # Multi-currency portfolio aggregation
│   ├── prisma.ts              # Prisma Client singleton
│   ├── sample-data.ts         # TypeScript types & sample data
│   ├── trades-service.ts      # Trade CRUD service layer
│   └── utils.ts               # Format currency, cn(), general utils
├── prisma/                    # Database Schema
│   └── schema.prisma          # Model definitions (User, TradingAccount, Trade, etc.)
├── prisma.config.ts           # Prisma config (datasource URL resolution)
├── public/                    # Static Assets
│   ├── JurnalCuanSync.mq5     # MetaTrader 5 Expert Advisor sync script
│   ├── manifest.json          # PWA Web App Manifest
│   ├── favicon.png            # Favicon
│   ├── icon-192.png           # PWA icon 192x192
│   └── icon-512.png           # PWA icon 512x512
├── scripts/                   # Build & utility scripts
│   └── generate-icons.js      # PWA icon generator
├── proxy.ts                   # Auth0 middleware (route protection)
├── Dockerfile                 # Multi-stage Docker production image
├── docker-compose.yml         # Docker Compose (PostgreSQL + Next.js App)
├── docker-entrypoint.sh       # Container startup (auto prisma db push)
├── .env.example               # Template konfigurasi environment variable
├── .dockerignore              # Docker build context exclusions
├── .gitignore                 # Git ignored files & directories
├── PRD_JURNAL_CUAN.md         # Product Requirement Document (spesifikasi lengkap)
└── package.json               # Dependencies & npm scripts
```

---

## 🗄️ Database Schema (Prisma)

Model utama yang digunakan:

| Model | Deskripsi |
|---|---|
| `User` | Data pengguna (Auth0 ID, email, username, preferensi) |
| `TradingAccount` | Akun trading multi-portofolio (Demo, Real, Prop Firm) |
| `Trade` | Catatan transaksi (pair, direction, PnL, pips, lot, session, emosi) |
| `Strategy` | Strategi trading kustom per user |
| `CustomTag` | Tag emosi & kesalahan kustom |
| `TradingRule` | Aturan disiplin trading personal |

Lihat skema lengkap di [`prisma/schema.prisma`](prisma/schema.prisma).

---

## 🐳 Docker Configuration

### Multi-Stage Dockerfile
- **Stage 1 (deps)**: Install `npm ci` dependencies & copy Prisma schema.
- **Stage 2 (builder)**: Generate Prisma Client, build Next.js standalone bundle.
- **Stage 3 (runner)**: Minimal `node:20-alpine` image, non-root user, auto `prisma db push` via entrypoint.

### Docker Compose Services
| Service | Image | Port | Deskripsi |
|---|---|---|---|
| `db` | `postgres:16-alpine` | 5432 | Database PostgreSQL dengan healthcheck |
| `app` | Build dari Dockerfile | 3000 | Next.js production server |

### Environment Variables (Docker)
Docker Compose mengambil variabel dari file `.env` di root project. Variabel khusus Docker:

| Variable | Default | Deskripsi |
|---|---|---|
| `POSTGRES_USER` | `postgres` | Username PostgreSQL container |
| `POSTGRES_PASSWORD` | `admin` | Password PostgreSQL container |
| `POSTGRES_DB` | `jurnalcuan` | Nama database |

---

## 📄 Lisensi
Didistribusikan di bawah lisensi MIT. Bebas digunakan dan dikembangkan untuk kebutuhan trading pribadi maupun komersial.
