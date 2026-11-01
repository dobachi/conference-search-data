#!/usr/bin/env bash
# docs/sync.js のお気に入り同期ロジック（LWW マージ・Gist 作成/検出・エラー表示）を
# GitHub API をモックしたページで検証する。ヘッドレス Chrome が必要。
set -euo pipefail
cd "$(dirname "$0")"
CHROME="${CHROME:-$(command -v google-chrome || command -v chromium || command -v chromium-browser)}"
TMP=$(mktemp -d)
trap 'rm -rf "$TMP"' EXIT
OUT=$("$CHROME" --headless=new --no-sandbox --disable-gpu --user-data-dir="$TMP" \
  --virtual-time-budget=20000 --dump-dom "file://$PWD/sync.test.html" 2>/dev/null \
  | sed -n '/<pre id="out">/,/<\/pre>/p' | sed 's/<[^>]*>//g')
echo "$OUT"
if grep -q '^FAIL' <<<"$OUT" || ! grep -q '^DONE' <<<"$OUT"; then
  echo "sync test FAILED" >&2; exit 1
fi
echo "sync test OK"
