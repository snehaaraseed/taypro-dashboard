#!/usr/bin/env bash
# Idempotent: ensure purpose-split Gemini model vars exist in .env.production.
# Run on server during deploy (see deploy.sh Step 2c).
set -euo pipefail

ROOT="${1:-/var/www/taypro-dashboard}"
ENV_FILE="$ROOT/.env.production"

touch "$ENV_FILE"
chmod 600 "$ENV_FILE" 2>/dev/null || true

set_kv() {
  local key="$1"
  local val="$2"
  local escaped="${val//\\/\\\\}"
  escaped="${escaped//\"/\\\"}"
  local line="${key}=\"${escaped}\""
  if grep -q "^${key}=" "$ENV_FILE" 2>/dev/null; then
    if command -v awk >/dev/null 2>&1; then
      local tmp
      tmp=$(mktemp)
      awk -v k="$key" -v v="$line" '
        BEGIN { done=0 }
        $0 ~ "^" k "=" { print v; done=1; next }
        { print }
        END { if (!done) print v }
      ' "$ENV_FILE" > "$tmp" && mv "$tmp" "$ENV_FILE"
    fi
  else
    echo "$line" >> "$ENV_FILE"
  fi
}

# Blog + translation: Flash Lite primary, Gemma 26B retry
set_kv "GEMINI_BLOG_MODEL" "gemini-3.1-flash-lite"
set_kv "GEMINI_BLOG_RETRY_MODEL" "gemma-4-26b-a4b-it"
set_kv "GEMINI_TRANSLATION_MODEL" "gemini-3.1-flash-lite"
set_kv "GEMINI_TRANSLATION_RETRY_MODEL" "gemma-4-26b-a4b-it"

# Grounding: Gemma only (never Flash Lite for googleSearch)
set_kv "GEMINI_GROUNDING_MODEL" "gemma-4-26b-a4b-it"
set_kv "GEMINI_GROUNDING_RETRY_MODEL" "gemma-4-31b-it"

# Editorial: insights + rank judge
set_kv "GEMINI_EDITORIAL_MODEL" "gemma-4-26b-a4b-it"
set_kv "GEMINI_EDITORIAL_RETRY_MODEL" "gemma-4-31b-it"

echo "  ✅ Gemini purpose-split model vars applied in $ENV_FILE"
