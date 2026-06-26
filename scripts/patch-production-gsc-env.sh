#!/usr/bin/env bash
# Idempotent: ensure GSC, ERPNext, and path vars exist in .env.production (run on server during deploy).
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
set_kv "GSC_PROBE_BASE_URL" "http://127.0.0.1:3000"
set_kv "GSC_NOT_FOUND_MAX_PROBES" "120"
set_kv "GSC_NOT_FOUND_MAX_INSPECTIONS" "40"
set_kv "URL_RECOVERY_MIN_HITS" "5"
set_kv "URL_RECOVERY_MIN_GSC_IMPRESSIONS" "3"
set_kv "TAYPRO_CMS_ROOT" "$ROOT"

# Optional: OAuth lines from deploy-uploaded file (secrets/gsc-oauth-production.env)
OAUTH_ENV_FILE="${2:-}"
if [ -n "$OAUTH_ENV_FILE" ] && [ -f "$OAUTH_ENV_FILE" ]; then
  while IFS= read -r line || [ -n "$line" ]; do
    line="${line%%#*}"
    line="${line%"${line##*[![:space:]]}"}"
    [ -z "$line" ] && continue
    key="${line%%=*}"
    val="${line#*=}"
    [ -z "$key" ] || [ -z "$val" ] && continue
    case "$key" in
      GSC_OAUTH_CLIENT_ID|GSC_OAUTH_CLIENT_SECRET|GSC_OAUTH_REDIRECT_URI)
        set_kv "$key" "$val"
        ;;
    esac
  done < "$OAUTH_ENV_FILE"
  chmod 600 "$OAUTH_ENV_FILE" 2>/dev/null || true
  echo "  ✅ GSC OAuth client vars applied from $(basename "$OAUTH_ENV_FILE")"
fi

# Optional: ERPNext API credentials from deploy-uploaded file (secrets/erpnext-production.env)
ERPNEXT_ENV_FILE="$SECRETS_DIR/erpnext-production.env"
if [ -f "$ERPNEXT_ENV_FILE" ]; then
  while IFS= read -r line || [ -n "$line" ]; do
    line="${line%%#*}"
    line="${line%"${line##*[![:space:]]}"}"
    [ -z "$line" ] && continue
    key="${line%%=*}"
    val="${line#*=}"
    [ -z "$key" ] || [ -z "$val" ] && continue
    case "$key" in
      ERPNEXT_API_URL|ERPNEXT_API_KEY|ERPNEXT_API_SECRET|ERPNEXT_NEWSLETTER_EMAIL_GROUP)
        set_kv "$key" "$val"
        ;;
    esac
  done < "$ERPNEXT_ENV_FILE"
  chmod 600 "$ERPNEXT_ENV_FILE" 2>/dev/null || true
  echo "  ✅ ERPNext API vars applied from $(basename "$ERPNEXT_ENV_FILE")"
fi

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
