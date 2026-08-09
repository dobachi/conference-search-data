# 2026-W33 ファクトチェック結果

> 検証日: 2026-08-10

## 検証対象

Phase 1 で新規追加された 3 件のカンファレンス。

## 検証結果

| カンファレンス | URL到達 | 名前 | 日程 | 場所 | CFP | 判定 |
|-------------|---------|------|------|------|-----|------|
| Data Streaming Summit 2026 (San Francisco) | OK (WebFetch) / 日程は `_payload.json` で確認 | OK | OK (2026-10-07〜08) | OK (San Francisco / Hotel Nikko) | OK (2026-06-30 closed) | PASS |
| Current 2026 San Francisco (Confluent) | OK | OK (公式表記: Current San Francisco) | OK (2026-11-04〜05) | OK (San Francisco / Moscone West) | 期日未公開・closed 記載 | PASS |
| Data + AI Summit 2027 (Databricks) | OK | OK | OK (2027-06-21〜24) | OK (San Francisco / Moscone North, West, South) | not-announced | PASS |

## 修正内容

なし。

## 削除

なし。

## 備考

- `data/conferences.json` の status 更新（`upcoming` → `ended` / `ongoing`）は、Phase 1 のスクリプトが日付ベースで自動更新したもの。個別のファクトチェック対象外。
- Data Streaming Summit の日付は、公式ページ本体（Nuxt SPA）が JS レンダリングのため WebFetch では取得できず、Nuxt の `_payload.json` から取得して確認。
