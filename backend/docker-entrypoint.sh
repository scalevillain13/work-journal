#!/bin/sh
set -e

echo "Waiting for database and running migrations..."
until npx prisma migrate deploy; do
  echo "Database not ready, retrying in 2s..."
  sleep 2
done

echo "Seeding database..."
npx prisma db seed

echo "Starting server..."
exec node dist/index.js
