#!/usr/bin/env bash
# Add 2G swap on production (OOM safety for dual PM2 workers). Idempotent.
# Usage: ./scripts/setup-production-swap.sh
# Or remote: ssh ubuntu@host 'bash -s' < scripts/setup-production-swap.sh

set -euo pipefail

SWAP_FILE="${SWAP_FILE:-/swapfile}"
SWAP_GB="${SWAP_GB:-2}"

if swapon --show | grep -q "$SWAP_FILE"; then
  echo "Swap already active at $SWAP_FILE"
  swapon --show
  exit 0
fi

if [ "$(id -u)" -ne 0 ]; then
  SUDO=sudo
else
  SUDO=
fi

echo "Creating ${SWAP_GB}G swap at $SWAP_FILE..."
$SUDO fallocate -l "${SWAP_GB}G" "$SWAP_FILE" 2>/dev/null || $SUDO dd if=/dev/zero of="$SWAP_FILE" bs=1M count=$((SWAP_GB * 1024)) status=progress
$SUDO chmod 600 "$SWAP_FILE"
$SUDO mkswap "$SWAP_FILE"
$SUDO swapon "$SWAP_FILE"

if ! grep -q "$SWAP_FILE" /etc/fstab; then
  echo "$SWAP_FILE none swap sw 0 0" | $SUDO tee -a /etc/fstab
fi

# Prefer RAM but allow swap under memory pressure
$SUDO sysctl -w vm.swappiness=10
if ! grep -q 'vm.swappiness' /etc/sysctl.conf 2>/dev/null; then
  echo "vm.swappiness=10" | $SUDO tee -a /etc/sysctl.conf
fi

swapon --show
echo "Swap ready."
