# Build context must be the repo root (see docker-compose.prod.yml), because
# this copies already-built static output from web/dist and admin/dist —
# built in CI, not on the server, so the server never needs Node/npm at all.
FROM nginx:1.27-alpine

COPY nginx/nginx.conf /etc/nginx/nginx.conf
COPY nginx/prod.conf.d /etc/nginx/conf.d

COPY web/dist /usr/share/nginx/html
COPY admin/dist /usr/share/nginx/html/admin
