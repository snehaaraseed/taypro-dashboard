#!/usr/bin/env bash
# Install Cloudflare Origin Certificate on production nginx (taypro.in).
#
# SECURITY: Never commit or paste the private key into chat/git.
# Place files locally (gitignored), then run this from your laptop.
#
# Usage:
#   1. Save Cloudflare downloads to:
#        AWS_Key/cloudflare-origin/taypro.in-origin.pem   (certificate)
#        AWS_Key/cloudflare-origin/taypro.in-origin.key   (private key)
#   2. Run:
#        ./scripts/install-cloudflare-origin-cert.sh
#
# Optional env overrides:
#   SSH_KEY, REMOTE_HOST, CERT_FILE, KEY_FILE, NGINX_SITE

set -euo pipefail

LOCAL_PATH="$(cd "$(dirname "$0")/.." && pwd)"
SSH_KEY="${SSH_KEY:-$LOCAL_PATH/AWS_Key/CloudServer.pem}"
REMOTE_HOST="${REMOTE_HOST:-ubuntu@13.204.129.120}"
CERT_FILE="${CERT_FILE:-$LOCAL_PATH/AWS_Key/cloudflare-origin/taypro.in-origin.pem}"
KEY_FILE="${KEY_FILE:-$LOCAL_PATH/AWS_Key/cloudflare-origin/taypro.in-origin.key}"
REMOTE_CERT_DIR="/etc/ssl/cloudflare"
REMOTE_CERT="$REMOTE_CERT_DIR/taypro.in-origin.pem"
REMOTE_KEY="$REMOTE_CERT_DIR/taypro.in-origin.key"
NGINX_SITE="${NGINX_SITE:-/etc/nginx/sites-available/taypro.in}"

if [[ ! -f "$SSH_KEY" ]]; then
  echo "Missing SSH key: $SSH_KEY"
  exit 1
fi
if [[ ! -f "$CERT_FILE" || ! -f "$KEY_FILE" ]]; then
  echo "Missing certificate files."
  echo "  Expected cert: $CERT_FILE"
  echo "  Expected key:  $KEY_FILE"
  echo ""
  echo "From Cloudflare: SSL/TLS → Origin Server → Create Certificate"
  echo "Save the Origin Certificate and Private Key to those paths, then re-run."
  exit 1
fi

echo "Uploading origin certificate to $REMOTE_HOST..."
ssh -i "$SSH_KEY" "$REMOTE_HOST" "sudo mkdir -p $REMOTE_CERT_DIR && sudo chmod 755 $REMOTE_CERT_DIR"
scp -i "$SSH_KEY" "$CERT_FILE" "$REMOTE_HOST:/tmp/taypro.in-origin.pem"
scp -i "$SSH_KEY" "$KEY_FILE" "$REMOTE_HOST:/tmp/taypro.in-origin.key"
ssh -i "$SSH_KEY" "$REMOTE_HOST" "sudo mv /tmp/taypro.in-origin.pem $REMOTE_CERT && sudo mv /tmp/taypro.in-origin.key $REMOTE_KEY && sudo chmod 644 $REMOTE_CERT && sudo chmod 600 $REMOTE_KEY && sudo chown root:root $REMOTE_CERT $REMOTE_KEY"

echo "Updating nginx SSL paths (backup first)..."
ssh -i "$SSH_KEY" "$REMOTE_HOST" bash -s <<EOF
set -euo pipefail
sudo cp "$NGINX_SITE" "${NGINX_SITE}.bak.\$(date +%Y%m%d%H%M%S)"
sudo sed -i 's|ssl_certificate .*|ssl_certificate $REMOTE_CERT;|' "$NGINX_SITE"
sudo sed -i 's|ssl_certificate_key .*|ssl_certificate_key $REMOTE_KEY;|' "$NGINX_SITE"
sudo nginx -t
sudo systemctl reload nginx
echo "nginx reloaded with Cloudflare origin certificate."
EOF

echo ""
echo "Done. Next steps in Cloudflare dashboard:"
echo "  SSL/TLS → Overview → Full (strict)"
echo "  Confirm https://taypro.in loads (orange-cloud proxied)."
echo ""
echo "Let's Encrypt files are still on disk if you need to roll back:"
echo "  sudo sed -i 's|$REMOTE_CERT|/etc/letsencrypt/live/taypro.in/fullchain.pem|' $NGINX_SITE"
echo "  sudo sed -i 's|$REMOTE_KEY|/etc/letsencrypt/live/taypro.in/privkey.pem|' $NGINX_SITE"
