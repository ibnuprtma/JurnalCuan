#!/bin/sh
set -e

echo "🚀 Memulai Jurnal Cuan Container..."

# Sinkronisasi skema database Prisma jika DATABASE_URL terdefinisi
if [ -n "$DATABASE_URL" ]; then
  echo "📦 Menjalankan Prisma DB Push untuk memastikan tabel database siap..."
  node node_modules/prisma/build/index.js db push --skip-generate || echo "⚠️ Prisma db push gagal/dilewati, melanjutkan..."
fi

echo "✨ Server siap di port 3000! Menjalankan Next.js..."
exec "$@"
