#!/bin/sh
set -e

echo "Waiting for database migrations..."
alembic upgrade head

echo "Seeding roles/permissions..."
python -m scripts.seed

exec "$@"
