#!/usr/bin/env bash
# Phase 2 の機械的後処理を実行する。
# Claude セッションはファクトチェック判定 + 修正 (pipeline ブランチへの commit/push) までで終わり、
# main への cherry-pick / push / pipeline ブランチ削除は
# このスクリプトが担当する (Claude Code の auto mode classifier が
# main 直接 push をブロックする問題への構造的対応、daily-curation Phase 3 と同じパターン)。
#
# Claude セッションが /tmp/conf-search-phase2-status.txt に "READY" を
# 書き出している前提。ファイルがない or 空なら SKIPPED (冪等性 OK) とみなす。
#
# 終了コード:
#   0: 全完了 (SKIPPED 含む)
#   2: cherry-pick / push 失敗 (人手介入)
#
# Usage: phase2-finalize.sh <week>   例: phase2-finalize.sh 2026-W33

set -euo pipefail

WEEK="${1:-}"
if [ -z "$WEEK" ]; then
  echo "Usage: $0 <week>   (例: 2026-W33)" >&2
  exit 2
fi

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
cd "$REPO_ROOT"

BRANCH="pipeline/${WEEK}"
STATUS_FILE="/tmp/conf-search-phase2-status.txt"

# === 1. STATUS ファイルチェック ===
if [ ! -f "$STATUS_FILE" ] || [ ! -s "$STATUS_FILE" ]; then
  echo "[phase2-finalize] $STATUS_FILE なし、SKIPPED (Claude が判定を出力していない、または冪等性スキップ)"
  exit 0
fi

STATUS=$(head -1 "$STATUS_FILE" | tr -d '[:space:]')

if [ "$STATUS" != "READY" ]; then
  echo "ERROR: invalid status in $STATUS_FILE: ${STATUS} (expected: READY)" >&2
  exit 2
fi

echo "[phase2-finalize] week=${WEEK} branch=${BRANCH} status=${STATUS}"

# === 2. 既に main に取り込み済みなら SKIPPED (冪等性) ===
git fetch origin main --quiet 2>/dev/null || true
git checkout main
git pull --ff-only origin main

if git log origin/main --oneline --grep="${WEEK}" | head -1 | grep -q .; then
  echo "[phase2-finalize] ${WEEK} は既に main に存在、SKIPPED"
  rm -f "$STATUS_FILE"
  exit 0
fi

# === 3. pipeline ブランチ確認 ===
git fetch origin "$BRANCH" --quiet 2>/dev/null || true
if ! git ls-remote --heads origin "$BRANCH" | grep -q "$BRANCH"; then
  echo "ERROR: ${BRANCH} が remote にない、cherry-pick できない" >&2
  exit 2
fi

# pipeline ブランチ上に changelog/${WEEK}.md があるか確認
if ! git ls-tree -r "origin/${BRANCH}" --name-only | grep -q "^changelog/${WEEK}\.md$"; then
  echo "ERROR: changelog/${WEEK}.md が ${BRANCH} に存在しない" >&2
  exit 2
fi

# === 4. cherry-pick (= git checkout でファイルだけ取り出す) ===
echo "[phase2-finalize] integrating data/ + changelog/ from ${BRANCH} to main..."
if ! git checkout "origin/${BRANCH}" -- data/ changelog/; then
  echo "ERROR: checkout from ${BRANCH} failed" >&2
  exit 2
fi

git add data/ changelog/

# === 5. commit & push ===
COMMIT_MSG="${WEEK} カンファレンス情報更新（ファクトチェック済み）"
echo "[phase2-finalize] committing: ${COMMIT_MSG}"
if ! git commit -m "$COMMIT_MSG"; then
  echo "ERROR: commit failed" >&2
  exit 2
fi

if ! git push origin main; then
  echo "ERROR: push failed" >&2
  exit 2
fi

SHA=$(git rev-parse --short HEAD)
echo "[phase2-finalize] pushed: ${SHA}"

# === 6. pipeline ブランチ削除 ===
echo "[phase2-finalize] deleting branch ${BRANCH}..."
if ! git push origin --delete "$BRANCH" 2>/dev/null; then
  echo "WARN: remote branch delete failed (pipeline branch may remain)"
fi
git branch -D "$BRANCH" 2>/dev/null || true

rm -f "$STATUS_FILE"
echo "✓ phase2 finalize complete"
exit 0
