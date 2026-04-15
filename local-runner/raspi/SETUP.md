# Raspberry Pi セットアップガイド

Raspberry Pi OS (64bit) でカンファレンス検索パイプラインを週次実行するための手順。

## 前提

- Raspberry Pi OS (64bit / Bookworm)
- Claude Code CLI インストール済み（`claude` コマンドが使える）
- git, python3 がインストール済み（デフォルトで入っている）
- SSH鍵またはGitHub認証が設定済み

## 1. リポジトリのクローン

```bash
mkdir -p ~/Sources
git clone git@github.com:dobachi/conference-search-data.git ~/Sources/conference-search-data
cd ~/Sources/conference-search-data
```

## 2. 環境変数の設定

```bash
mkdir -p ~/.config/conf-search
cp local-runner/env.example ~/.config/conf-search/runner.env
```

`runner.env` を編集:

```bash
nano ~/.config/conf-search/runner.env
```

```
CONF_SEARCH_REPO=$HOME/Sources/conference-search-data
CONF_SEARCH_LOG_DIR=$HOME/.local/share/conf-search/logs
CONF_SEARCH_CLAUDE_ARGS="--allowedTools Bash,Read,Write,Edit,Glob,Grep,WebSearch,WebFetch --max-turns 60"
TZ=Asia/Tokyo
```

## 3. 動作確認

```bash
# claude が使えるか
claude --version

# git push できるか
cd ~/Sources/conference-search-data
git fetch origin

# fetch.py が動くか
python3 scripts/fetch.py https://example.com | head -5

# Phase 1 のドライラン（手動実行）
bash local-runner/run-phase.sh 1
```

## 4. systemd タイマーのインストール

```bash
bash local-runner/linux/install-systemd.sh
```

ログアウト後もタイマーが動くようにする:

```bash
sudo loginctl enable-linger $USER
```

タイマーの確認:

```bash
systemctl --user list-timers | grep conf-search
```

## 5. スケジュール

| Phase | UTC | JST | 内容 |
|-------|-----|-----|------|
| 1 | 日曜 18:30 | 月曜 03:30 | カンファレンス検索 |
| 2 | 日曜 19:30 | 月曜 04:30 | ファクトチェック & mainマージ |

クラウドRoutine（日曜 20:00 UTC）より30分早く実行。ローカルが成功すればクラウド側はスキップされる。

## 6. ログの確認

```bash
# systemd ログ
journalctl --user -u conf-search-phase1 --since today
journalctl --user -u conf-search-phase2 --since today

# ファイルログ
ls ~/.local/share/conf-search/logs/
cat ~/.local/share/conf-search/logs/phase1-$(date +%Y-%m-%d).log
```

## 7. Raspberry Pi 固有の注意点

### タイムゾーン

```bash
# 確認
timedatectl
# 設定（未設定の場合）
sudo timedatectl set-timezone Asia/Tokyo
```

### NTP同期

正確な時刻でタイマーが動くように:

```bash
sudo timedatectl set-ntp true
timedatectl  # "System clock synchronized: yes" を確認
```

### スワップ（メモリが少ない場合）

Claude CLIはメモリを使うため、RAM 2GB以下の場合はスワップを増やす:

```bash
sudo dphys-swapfile swapoff
sudo nano /etc/dphys-swapfile
# CONF_SWAPSIZE=2048  (2GB)
sudo dphys-swapfile setup
sudo dphys-swapfile swapon
```

### 電源管理

常時稼働させる場合、画面をオフにしてヘッドレス運用:

```bash
# ディスプレイ省電力（ヘッドレスなら不要）
sudo raspi-config  # → Display Options → Screen Blanking → Off
```

## アンインストール

```bash
bash local-runner/linux/uninstall.sh
```
