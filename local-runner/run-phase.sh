#!/usr/bin/env bash
# Conference Search Pipeline - Phase runner (Ubuntu / WSL 共通)
#
# Usage: run-phase.sh {1|2}
#   Phase 1: カンファレンス検索 & データ更新
#   Phase 2: ファクトチェック & mainへマージ
#
# 環境変数ファイル ~/.config/conf-search/runner.env を読み込む。

set -euo pipefail

PHASE="${1:-}"
if [[ ! "$PHASE" =~ ^[1-2]$ ]]; then
  echo "Usage: $0 {1|2}" >&2
  exit 2
fi

# 環境変数ロード
ENV_FILE="${CONF_SEARCH_ENV:-$HOME/.config/conf-search/runner.env}"
if [ -f "$ENV_FILE" ]; then
  # shellcheck disable=SC1090
  source "$ENV_FILE"
fi

# デフォルト値
REPO="${CONF_SEARCH_REPO:-$HOME/Sources/DevConferenceSearch/projects/conference-search-data}"
LOG_DIR="${CONF_SEARCH_LOG_DIR:-$HOME/.local/share/conf-search/logs}"
CLAUDE_ARGS="${CONF_SEARCH_CLAUDE_ARGS:---allowedTools Bash,Read,Write,Edit,Glob,Grep,WebSearch,WebFetch --max-turns 60}"
export TZ="${TZ:-Asia/Tokyo}"

# 前提チェック
for cmd in git claude python3; do
  if ! command -v "$cmd" >/dev/null 2>&1; then
    echo "ERROR: required command not found: $cmd" >&2
    exit 3
  fi
done

if [ ! -d "$REPO/.git" ]; then
  echo "ERROR: repository not found: $REPO" >&2
  exit 3
fi

# ログ準備
mkdir -p "$LOG_DIR"
DATE=$(date +%Y-%m-%d)
LOG_FILE="$LOG_DIR/phase${PHASE}-${DATE}.log"

# ロック（二重起動防止）
LOCK_FILE="/tmp/conf-search-phase${PHASE}.lock"
exec 9>"$LOCK_FILE"
if ! flock -n 9; then
  echo "$(date -Iseconds) phase${PHASE}: already running, skipping" | tee -a "$LOG_FILE"
  exit 0
fi

{
  echo ""
  echo "===== Phase ${PHASE} start: $(date -Iseconds) ====="
  cd "$REPO"

  # 最新を取得
  git fetch origin main

  # Phase 実行
  PROMPT="config/prompts/phase${PHASE}.md を読み、その手順に従って Phase ${PHASE} を実行してください。"
  # shellcheck disable=SC2086
  claude -p "$PROMPT" $CLAUDE_ARGS
  EXIT=$?

  echo "===== Phase ${PHASE} end: $(date -Iseconds), exit=${EXIT} ====="
  exit "$EXIT"
} 2>&1 | tee -a "$LOG_FILE"
