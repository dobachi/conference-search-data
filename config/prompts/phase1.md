# Phase 1: カンファレンス検索（トークン最適化版）

このジョブは毎週実行される。Phase 1 では新規カンファレンスの検索とデータ更新を行う。
Phase 2（ファクトチェック）は別セッションで実行される。

## 手順

### 0. ブランチ準備

```bash
DATE=$(TZ=Asia/Tokyo date +%Y-%m-%d)
WEEK=$(TZ=Asia/Tokyo date +%Y-W%V)
BRANCH="pipeline/${WEEK}"
git fetch origin main
git checkout main && git pull --ff-only origin main
git checkout -B "$BRANCH" origin/main
```

### 0.1. 前処理: ステータス自動更新 & サマリー生成

```bash
bash config/generate-summary.sh
```

これにより:
- `data/conferences.json` 内のステータスが日付ベースで自動更新される（ended/ongoing/upcoming）
- `data/summary.txt` が生成される（軽量な既知カンファレンス一覧）

### 1. 今週の検索カテゴリを決定

`config/conferences.yml` の `rotation` セクションを参照し、**今週のISO週番号 % 4** で検索対象カテゴリを決定する。

```bash
WEEK_NUM=$(TZ=Asia/Tokyo date +%V)
ROTATION_KEY=$((WEEK_NUM % 4))
echo "今週のローテーション: week_${ROTATION_KEY}"
```

`conferences.yml` の該当ローテーションのカテゴリ**のみ**を検索する。全カテゴリは検索しない。

### 2. 既知カンファレンスの確認

`data/summary.txt` を読んで、既知のカンファレンス名とIDを確認する。
**`data/conferences.json` は読まない**（トークン節約のため）。

### 3. 情報収集（今週のカテゴリのみ）

今週の2カテゴリそれぞれについて、**統合クエリ**でWeb検索する:

- 英語1回: カテゴリの主要キーワードを組み合わせた1つのクエリ
- 日本語1回: 同上の日本語版

例（AI / 機械学習の場合）:
- 英語: `"AI machine learning LLM conference 2026 new announced"`
- 日本語: `"AI 機械学習 生成AI カンファレンス 2026"`

**合計4回のWeb検索**で済ませる（2カテゴリ × 2言語）。

### 4. 重複チェック & データ更新

新しく見つかったカンファレンスについて:
1. `data/summary.txt` の既知ID/名前と照合し、重複を除外
2. 新規のもののみ `data/conferences.json` に追加

既知カンファレンスの更新（CFP状態変更等）が判明した場合:
1. `data/conferences.json` から該当エントリを検索・更新

#### JSONフォーマット

新規追加するエントリは以下のフォーマット:

```json
{
  "id": "confname-region-2026",
  "name": "Conference Name 2026",
  "dates": { "start": "YYYY-MM-DD", "end": "YYYY-MM-DD" },
  "location": { "city": "...", "country": "...", "region": "Japan|Asia-Pacific|North America|Europe|Online" },
  "format": "in-person|online|hybrid",
  "url": "https://...",
  "cfp": { "deadline": "", "url": "", "status": "open|closed|not-announced" },
  "categories": ["カテゴリ名"],
  "topics": ["tag1", "tag2"],
  "cost": "unknown",
  "recurring": true,
  "summary": "日本語の概要（50-100文字）",
  "status": "upcoming|ongoing|ended",
  "first_seen": "2026-WNN",
  "last_updated": "2026-WNN"
}
```

### 5. サマリー再生成 & 更新ログ

```bash
bash config/generate-summary.sh
```

`changelog/YYYY-WNN.md` に変更内容を記録:

```markdown
# YYYY-WNN カンファレンス更新ログ

> 更新日: YYYY-MM-DD
> 検索カテゴリ: カテゴリA, カテゴリB

## 新規追加（N件）
- **カンファレンス名** - 日程、場所

## 情報更新（N件）
- **カンファレンス名** - 変更内容

## ステータス自動更新
- N件のカンファレンスが ended に変更
```

### 6. pipelineブランチにコミット・プッシュ

**mainにはコミットしない。** pipelineブランチにpushする（Phase 2でファクトチェック後にmainへ反映）。

```bash
python3 -c "import json; json.load(open('data/conferences.json'))"  # JSON検証
git add data/ changelog/ config/
git commit -m "${WEEK} Phase1: カンファレンス検索（カテゴリA, カテゴリB）"
git push -u origin "$BRANCH"
```

## 品質チェック

コミット前に以下を確認:

1. `data/conferences.json` が有効なJSONであること
2. 新規エントリにすべての必須フィールドが存在すること
3. 重複エントリがないこと（idの一意性）

## 冪等性

- `reports/` や `data/` が既にpipelineブランチにある場合、Phase 1はスキップ
- main に今週分が既にある場合もスキップ
