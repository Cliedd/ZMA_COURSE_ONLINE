# ── Pre-built: dist/ is built locally via "npm run build" before docker build ──
# This avoids OOM issues with npm ci inside the container.

FROM nginx:alpine

COPY dist/ /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
