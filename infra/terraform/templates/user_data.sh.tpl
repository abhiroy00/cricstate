#!/bin/bash
set -euo pipefail

# --- Docker Engine + Compose plugin ---
apt-get update -y
apt-get install -y ca-certificates curl gnupg rsync

install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
chmod a+r /etc/apt/keyrings/docker.asc

echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu \
  $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null

apt-get update -y
apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

usermod -aG docker ubuntu

# --- App directory, owned by the deploy user so CI can rsync into it ---
mkdir -p /opt/${project_name}/backend
mkdir -p /opt/${project_name}/web
mkdir -p /opt/${project_name}/admin
chown -R ubuntu:ubuntu /opt/${project_name}

# --- Secrets, generated once here, never invented by hand and never committed.
# A later `rsync` deploy explicitly excludes .env files, so these are not overwritten. ---
cat > /opt/${project_name}/.env <<EOF
POSTGRES_USER=${project_name}
POSTGRES_PASSWORD=${postgres_password}
POSTGRES_DB=${project_name}
EOF

cat > /opt/${project_name}/backend/.env <<EOF
ENV=production

DATABASE_URL=postgresql+asyncpg://${project_name}:${postgres_password}@postgres:5432/${project_name}
REDIS_URL=redis://redis:6379/0

JWT_SECRET=${jwt_secret}
JWT_ACCESS_EXPIRE_MINUTES=15
JWT_REFRESH_EXPIRE_DAYS=30

CORS_ORIGINS=http://${elastic_ip}

RATE_LIMIT_LOGIN_MAX=10
RATE_LIMIT_LOGIN_WINDOW_SECONDS=60

BOOTSTRAP_SUPER_ADMIN_EMAIL=
BOOTSTRAP_SUPER_ADMIN_USERNAME=
BOOTSTRAP_SUPER_ADMIN_PASSWORD=
EOF

chown ubuntu:ubuntu /opt/${project_name}/.env /opt/${project_name}/backend/.env
chmod 600 /opt/${project_name}/.env /opt/${project_name}/backend/.env
