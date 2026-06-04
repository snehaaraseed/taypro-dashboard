#!/usr/bin/env bash
# Idempotent: ensure GSC + paths exist in .env.production (run on server during deploy).
set -euo pipefail

ROOT="${1:-/var/www/taypro-dashboard}"
ENV_FILE="$ROOT/.env.production"
SECRETS_DIR="$ROOT/secrets"
GSC_KEY="$SECRETS_DIR/gsc-service-account.json"

mkdir -p "$SECRETS_DIR"
touch "$ENV_FILE"
chmod 600 "$ENV_FILE" 2>/dev/null || true

set_kv() {
  local key="$1"
  local val="$2"
  if grep -q "^${key}=" "$ENV_FILE" 2>/dev/null; then
    if command -v sed >/dev/null 2>&1; then
      local tmp
      tmp=$(mktemp)
      awk -v k="$key" -v v="$val" '
        BEGIN { done=0 }
        $0 ~ "^" k "=" { print k "=" v; done=1; next }
        { print }
        END { if (!done) print k "=" v }
      ' "$ENV_FILE" > "$tmp" && mv "$tmp" "$ENV_FILE"
    fi
  else
    echo "${key}=${val}" >> "$ENV_FILE"
  fi
}

set_kv "GSC_SITE_URL" "sc-domain:taypro.in"
set_kv "GSC_SERVICE_ACCOUNT_PATH" "$GSC_KEY"
set_kv "GSC_LOOKBACK_DAYS" "28"
set_kv "GSC_MIN_IMPRESSIONS" "15"
set_kv "GSC_BOOST_MAX_KEYWORDS" "15"
set_kv "TAYPRO_CMS_ROOT" "$ROOT"

# OAuth (recommended): set GSC_OAUTH_CLIENT_ID, GSC_OAUTH_CLIENT_SECRET,
# GSC_OAUTH_REDIRECT_URI=https://taypro.in/api/admin/gsc/oauth/callback in .env.production
# Then connect once at https://taypro.in/admin/gsc

if [ ! -f "$GSC_KEY" ]; then
  echo "  ⚠️  Missing $GSC_KEY — deploy must upload secrets/gsc-service-account.json"
else
  chmod 600 "$GSC_KEY" 2>/dev/null || true
  echo "  ✅ GSC service account key present"
fi

if ! grep -q "^AUTOMATION_CRON_SECRET=" "$ENV_FILE" 2>/dev/null; then
  secret=$(openssl rand -base64 32 | tr -d '/+=' | head -c 40)
  echo "AUTOMATION_CRON_SECRET=${secret}" >> "$ENV_FILE"
  echo "  ✅ Generated AUTOMATION_CRON_SECRET (save for cron / manual sync)"
else
  echo "  ✅ AUTOMATION_CRON_SECRET already set (unchanged)"
fi

echo "  ✅ GSC env vars present in $ENV_FILE"
