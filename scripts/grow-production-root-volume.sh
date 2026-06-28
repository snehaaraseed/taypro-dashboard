#!/usr/bin/env bash
# Grow the root filesystem after EBS volume resize in AWS Console.
# Run ON THE PRODUCTION SERVER (ubuntu@13.204.129.120) as root/sudo.
#
# AWS steps (do first):
#   1. EC2 → Volumes → select the instance root volume → Modify volume → 50 GiB (or 60)
#   2. Wait until state = "optimizing" or "completed"
#   3. SSH to server and run: sudo bash scripts/grow-production-root-volume.sh
set -euo pipefail

if [ "$(id -u)" -ne 0 ]; then
  echo "Run with sudo: sudo bash $0"
  exit 1
fi

ROOT_DEV="$(findmnt -n -o SOURCE /)"
echo "Root device: $ROOT_DEV"
lsblk

DISK="/dev/nvme0n1"
PART_NUM=1

if ! lsblk "$DISK" >/dev/null 2>&1; then
  DISK="/dev/$(lsblk -no PKNAME "$ROOT_DEV" | head -1)"
fi

echo "Growing partition ${DISK}p${PART_NUM}..."
if command -v growpart >/dev/null 2>&1; then
  growpart "$DISK" "$PART_NUM"
else
  apt-get update -qq && apt-get install -y -qq cloud-guest-utils
  growpart "$DISK" "$PART_NUM"
fi

echo "Growing filesystem on $ROOT_DEV..."
resize2fs "$ROOT_DEV"

echo ""
df -h /
echo "✅ Root volume grown. Verify size matches EBS in AWS Console."
