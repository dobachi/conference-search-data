# Conference Search ローカルランナー

カンファレンス検索の週次更新をローカルマシンで実行するための仕組み。

## アーキテクチャ

```
Phase 1 (検索)        → pipeline/YYYY-WNN ブランチに data/ と changelog/
Phase 2 (ファクトチェック+マージ) → main に cherry-pick
```

## なぜローカル実行が必要か

- クラウド環境ではWebFetch時に多くのサイトで403ブロックされる
- ローカルではブラウザUAでフォールバックできるため、ファクトチェックが機能する
- `scripts/fetch.py` がWebFetch 403時のフォールバック

## セットアップ

### 1. 環境変数

```bash
mkdir -p ~/.config/conf-search
cp local-runner/env.example ~/.config/conf-search/runner.env
# パスを実環境に合わせて編集
```

### 2. systemd タイマー（Linux/WSL2推奨）

```bash
bash local-runner/linux/install-systemd.sh
sudo loginctl enable-linger $USER
```

### 3. 手動実行

```bash
bash local-runner/run-phase.sh 1  # 検索
bash local-runner/run-phase.sh 2  # ファクトチェック & マージ
```

## スケジュール

| Phase | UTC | JST | 内容 |
|-------|-----|-----|------|
| 1 | 日曜 18:30 | 月曜 03:30 | カンファレンス検索 |
| 2 | 日曜 19:30 | 月曜 04:30 | ファクトチェック & mainマージ |

クラウドRoutineは 日曜 20:00 UTC（月曜 05:00 JST）に実行。ローカルが先に成功していれば冪等性でスキップされる。

## ログ

```bash
ls ~/.local/share/conf-search/logs/
journalctl --user -u conf-search-phase1 -b
```

## アンインストール

```bash
bash local-runner/linux/uninstall.sh
```
