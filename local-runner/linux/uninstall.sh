#!/usr/bin/env bash
set -euo pipefail

echo "Uninstalling Conference Search systemd timers..."

for phase in 1 2; do
  systemctl --user disable --now "conf-search-phase${phase}.timer" 2>/dev/null || true
  rm -f "$HOME/.config/systemd/user/conf-search-phase${phase}".{service,timer}
done

systemctl --user daemon-reload
echo "Done."
