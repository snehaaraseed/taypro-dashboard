#!/usr/bin/env bash
# Crawl resilience: static from disk, HTML microcache, conn cap on HTML only.
set -euo pipefail

REMOTE_PATH="${REMOTE_PATH:-/var/www/taypro-dashboard}"
NGINX_SITE="${NGINX_SITE:-/etc/nginx/sites-available/taypro.in}"
HTTP_CONF="/etc/nginx/conf.d/taypro-proxy-cache.conf"
STATIC_MARKER="# taypro-static-public-direct"
HTML_MARKER="# taypro-html-location"
PUBLIC_ROOT="/var/www/taypro-dashboard/public"

run() {
  if [ "$(id -u)" -eq 0 ]; then "$@"; else sudo "$@"; fi
}

for f in \
  "$REMOTE_PATH/deploy/nginx/proxy-cache-http.conf" \
  "$REMOTE_PATH/deploy/nginx/proxy-cache-location.conf" \
  "$REMOTE_PATH/deploy/nginx/static-public-direct.conf" \
  "$REMOTE_PATH/deploy/nginx/html-location.conf"; do
  if [ ! -f "$f" ]; then
    echo "Missing $f — sync repo first."
    exit 1
  fi
done

run mkdir -p /var/cache/nginx/taypro
run chown -R www-data:www-data /var/cache/nginx/taypro

if [ ! -f "$HTTP_CONF" ]; then
  run cp "$REMOTE_PATH/deploy/nginx/proxy-cache-http.conf" "$HTTP_CONF"
  echo " # taypro-proxy-cache-http" | run tee -a "$HTTP_CONF" >/dev/null
fi

# Remove server-wide connection caps (they 503/502 static image storms).
run sed -i '/limit_conn taypro_origin_conns/d' "$NGINX_SITE"

# Insert static-direct block once in the 443 server block.
if ! grep -q "$STATIC_MARKER" "$NGINX_SITE"; then
  run sed -i "/listen 443 ssl http2;/,/server_name taypro.in/{
    /server_name taypro.in/a\\
    include $REMOTE_PATH/deploy/nginx/static-public-direct.conf; $STATIC_MARKER
  }" "$NGINX_SITE"
fi

# Regex static: try disk first, then Node fallback.
if grep -q 'location ~\* \\.(jpg|jpeg|png' "$NGINX_SITE" && \
   ! grep -q '@taypro_static_fallback' "$NGINX_SITE"; then
  run python3 - <<'PY'
from pathlib import Path
site = Path("/etc/nginx/sites-available/taypro.in")
text = site.read_text()
old = """    location ~* \\.(jpg|jpeg|png|gif|ico|css|js|svg|woff|woff2|ttf|eot|webp|avif)$ {
    include /var/www/taypro-dashboard/deploy/nginx/maintenance-location.conf; # taypro-maintenance-location
        proxy_pass http://taypro_nextjs;
        expires 365d;
        add_header Cache-Control \"public, immutable\";
        add_header X-Content-Type-Options \"nosniff\" always;
        access_log off;
    }"""
new = """    location ~* \\.(jpg|jpeg|png|gif|ico|css|js|svg|woff|woff2|ttf|eot|webp|avif)$ {
        root /var/www/taypro-dashboard/public;
        try_files $uri @taypro_static_fallback;
        expires 365d;
        add_header Cache-Control \"public, immutable\";
        add_header X-Content-Type-Options \"nosniff\" always;
        access_log off;
    }

    location @taypro_static_fallback {
        include /var/www/taypro-dashboard/deploy/nginx/maintenance-location.conf;
        proxy_pass http://taypro_nextjs;
        proxy_cache TAYPRO_HTML;
        proxy_cache_valid 200 60m;
        access_log off;
    }"""
if old not in text:
    raise SystemExit("static location block not found for patch")
site.write_text(text.replace(old, new))
PY
fi

# Replace bloated location / with html-location include.
if ! grep -q "$HTML_MARKER" "$NGINX_SITE"; then
  run python3 - <<'PY'
from pathlib import Path
import re
site = Path("/etc/nginx/sites-available/taypro.in")
text = site.read_text()
pattern = r"    location / \{[^}]*proxy_pass http://taypro_nextjs;[^}]*\}\n"
repl = """    location / {
    include /var/www/taypro-dashboard/deploy/nginx/html-location.conf; # taypro-html-location
    }

"""
new_text, n = re.subn(pattern, repl, text, count=1)
if n != 1:
    raise SystemExit(f"location / replace failed ({n})")
site.write_text(new_text)
PY
fi

# Timeouts for cold SSR.
run sed -i 's/proxy_read_timeout 30s/proxy_read_timeout 120s/g' "$NGINX_SITE"
run sed -i 's/proxy_read_timeout 90s/proxy_read_timeout 120s/g' "$NGINX_SITE"
run sed -i 's/proxy_send_timeout 30s/proxy_send_timeout 120s/g' "$NGINX_SITE"
run sed -i 's/proxy_send_timeout 90s/proxy_send_timeout 120s/g' "$NGINX_SITE"

run sed -i "/proxy_set_header Connection 'upgrade';/d" "$NGINX_SITE"

run nginx -t
run systemctl reload nginx
echo "Crawl resilience nginx config applied."
