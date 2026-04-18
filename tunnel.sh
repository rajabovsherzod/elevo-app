#!/usr/bin/env bash
# ─────────────────────────────────────────────
# Elevo Frontend — Cloudflare tunnel
# Ishga tushirish: bash tunnel.sh
# ─────────────────────────────────────────────
set -e

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
CLOUDFLARED="$ROOT/cloudflared.exe"
PORT=3000
LOG="/tmp/elevo-frontend-tunnel.log"

echo "[frontend-tunnel] port $PORT uchun tunnel ochilmoqda..."

"$CLOUDFLARED" tunnel --url "http://localhost:$PORT" --no-autoupdate 2>&1 | tee "$LOG"
