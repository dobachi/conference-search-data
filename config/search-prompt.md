# カンファレンス検索指示

このジョブは毎週日曜 UTC 20:00（JST月曜朝5:00）にスケジュール実行される。

## 手順

### 0. 日付の確定

```bash
TZ=Asia/Tokyo date +%Y-%m-%d
```

JSTの日付を基準にする。

### 1. モード判定

- `data/conferences.json` が存在しない、または空 → **初回包括検索モード**
- `data/conferences.json` が存在する → **週次差分更新モード**

### 2. カテゴリ確認

`config/conferences.yml` を読み、検索対象のカテゴリ・キーワード・地域を確認する。

### 3. 情報収集

#### 初回包括検索モード

各カテゴリ × 各地域の組み合わせでWeb検索を実施：

1. カテゴリのキーワードで英語・日本語の両方で検索
2. 既知のアグリゲータサイト（confs.tech, connpass, techplay等）を確認
3. 2026年に開催される（された）カンファレンスを網羅的に収集
4. 50-100+件の収集を目標とする

#### 週次差分更新モード

1. 既存の `data/conferences.json` を読み込む
2. 各カテゴリで「新規カンファレンス」を検索（直近1-2週間のアナウンスを中心に）
3. 既知カンファレンスの情報更新を確認：
   - CFP状態の変更（オープン、延長、締切）
   - 日程変更、会場変更、キャンセル
   - 登壇者・プログラム発表
   - 早期割引締切
4. 終了したカンファレンスには `"status": "ended"` を付与（削除しない）

### 4. データ更新

`data/conferences.json` を以下のフォーマットで更新：

```json
{
  "last_updated": "YYYY-MM-DD",
  "conferences": [
    {
      "id": "kubecon-eu-2026",
      "name": "KubeCon + CloudNativeCon Europe 2026",
      "dates": {
        "start": "2026-06-15",
        "end": "2026-06-18"
      },
      "location": {
        "city": "London",
        "country": "UK",
        "region": "Europe"
      },
      "format": "hybrid | in-person | online",
      "url": "https://...",
      "cfp": {
        "deadline": "2026-03-01",
        "url": "https://...",
        "status": "open | closed | not-announced"
      },
      "categories": ["クラウド / インフラ"],
      "topics": ["Kubernetes", "service mesh", "observability"],
      "cost": {
        "early_bird": "$799",
        "regular": "$999"
      },
      "recurring": true,
      "frequency": "annual",
      "summary": "CNCF主催の旗艦カンファレンス...",
      "status": "upcoming | ongoing | ended",
      "first_seen": "2026-W14",
      "last_updated": "2026-W15"
    }
  ]
}
```

#### フィールド説明

| フィールド | 必須 | 説明 |
|-----------|------|------|
| id | はい | 一意のスラッグ（例: kubecon-eu-2026） |
| name | はい | カンファレンス正式名 |
| dates.start | はい | 開始日（YYYY-MM-DD） |
| dates.end | はい | 終了日（YYYY-MM-DD） |
| location | はい | 開催地情報 |
| format | はい | hybrid / in-person / online |
| url | はい | 公式サイトURL |
| cfp | いいえ | CFP情報（該当する場合） |
| categories | はい | conferences.ymlのカテゴリ名 |
| topics | はい | 具体的なトピックタグ |
| cost | いいえ | 参加費情�� |
| recurring | いいえ | 定期開催かどうか |
| summary | はい | 50-100文字の概要 |
| status | はい | upcoming / ongoing / ended |
| first_seen | はい | 初回発見週（YYYY-WNN） |
| last_updated | はい | 最終更新週（YYYY-WNN） |

### 5. 更新ログの記録

週次差分更新モードの場合、`changelog/YYYY-WNN.md` に変更内容を記録：

```markdown
# YYYY-WNN カンファレンス更新ログ

> 更新日: YYYY-MM-DD

## 新規追加（N件）
- **カンファレンス名** - 日程、場所

## 情報更新（N件）
- **カンファレンス名** - 変更内容（例: CFP締切延長）

## ステータス変更
- **カンファレンス名** - ended に変更
```

### 6. コミット・プ���シュ

```bash
git add data/ changelog/
git commit -m "YYYY-WNN カンファレンス情報更新"
git push
```

## 品質チェック

コミット前に以下を確認：

1. `data/conferences.json` が有効なJSONであること
2. すべてのカンファレンスに必須フィールドが存在すること
3. 日付フォーマットが正しいこと（YYYY-MM-DD）
4. URLが有効であること
5. カテゴリ名が `conferences.yml` と一致すること
6. 重複エントリがないこと（idの一意性）
