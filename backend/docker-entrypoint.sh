#!/bin/sh
set -e

echo "Aplicando migrations do Prisma..."
npx prisma migrate deploy

if [ "$RUN_SEED" = "true" ]; then
  echo "Executando seed do banco de dados..."
  npx tsx prisma/seed.ts
fi

echo "Iniciando servidor..."
exec node dist/server.js
