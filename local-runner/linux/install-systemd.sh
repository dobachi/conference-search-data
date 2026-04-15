#!/usr/bin/env bash
# Conference Search: systemd タイマーインストールスクリプト
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
RUNNER_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
RUN_PHASE="$RUNNER_DIR/run-phase.sh"
SYSTEMD_DIR="$HOME/.config/systemd/user"

echo "Installing Conference Search systemd timers..."
echo "  Runner: $RUN_PHASE"
echo "  Systemd dir: $SYSTEMD_DIR"

mkdir -p "$SYSTEMD_DIR"

# Phase 1: 毎週日曜 18:30 UTC (月曜 03:30 JST)
cat > "$SYSTEMD_DIR/conf-search-phase1.service" <<EOF
[Unit]
Description=Conference Search Phase 1 (Search)
After=network-online.target
Wants=network-online.target

[Service]
Type=oneshot
ExecStart=/bin/bash $RUN_PHASE 1
TimeoutStartSec=1800
EOF

cat > "$SYSTEMD_DIR/conf-search-phase1.timer" <<EOF
[Unit]
Description=Conference Search Phase 1 (Weekly Sunday 18:30 UTC / Monday 03:30 JST)

[Timer]
OnCalendar=Sun *-*-* 18:30:00
Persistent=true
RandomizedDelaySec=60

[Install]
WantedBy=timers.target
EOF

# Phase 2: 毎週日曜 19:30 UTC (月曜 04:30 JST)
cat > "$SYSTEMD_DIR/conf-search-phase2.service" <<EOF
[Unit]
Description=Conference Search Phase 2 (Fact-check & Merge)
After=network-online.target
Wants=network-online.target

[Service]
Type=oneshot
ExecStart=/bin/bash $RUN_PHASE 2
TimeoutStartSec=1800
EOF

cat > "$SYSTEMD_DIR/conf-search-phase2.timer" <<EOF
[Unit]
Description=Conference Search Phase 2 (Weekly Sunday 19:30 UTC / Monday 04:30 JST)

[Timer]
OnCalendar=Sun *-*-* 19:30:00
Persistent=true
RandomizedDelaySec=60

[Install]
WantedBy=timers.target
EOF

systemctl --user daemon-reload
systemctl --user enable --now conf-search-phase1.timer
systemctl --user enable --now conf-search-phase2.timer

echo ""
echo "Done. Timers installed:"
systemctl --user list-timers | grep conf-search
echo ""
echo "Enable linger (run even after logout):"
echo "  sudo loginctl enable-linger $USER"
echo ""
echo "View logs:"
echo "  journalctl --user -u conf-search-phase1 -b"
echo "  journalctl --user -u conf-search-phase2 -b"
