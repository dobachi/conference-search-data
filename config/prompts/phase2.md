# Phase 2: ファクトチェック & mainへマージ

Phase 1 で追加・更新されたカンファレンス情報のファクトチェックを行い、問題なければ main にマージする。

## 手順

### 0. 冪等性チェック

```bash
WEEK=$(TZ=Asia/Tokyo date +%Y-W%V)
BRANCH="pipeline/${WEEK}"
```

- main に今週のchangelogが既にある → **SKIP**（既に完了）
- pipelineブランチが存在しない → **SKIP**（Phase 1 未完了）

```bash
git fetch origin
if git log origin/main --oneline --grep="${WEEK}" | head -1 | grep -q .; then
  echo "Already merged to main. SKIP."
  exit 0
fi
if ! git rev-parse --verify "origin/${BRANCH}" >/dev/null 2>&1; then
  echo "Pipeline branch not found. Phase 1 not done. SKIP."
  exit 0
fi
```

### 1. pipelineブランチの差分確認

```bash
git checkout "$BRANCH"
git pull origin "$BRANCH"
```

Phase 1 で追加・変更されたカンファレンスを特定する:

```bash
git diff origin/main -- data/conferences.json
```

差分から、新規追加されたエントリと更新されたエントリを抽出する。

### 2. ファクトチェック

新規追加された各カンファレンスについて、以下を検証:

1. **公式URLの到達性**: WebFetch で URL にアクセス。403の場合は `python3 scripts/fetch.py <URL> | head -300` にフォールバック。
2. **名前の正確性**: 公式サイトのタイトルとname フィールドが一致するか
3. **日程の正確性**: 公式サイトに記載の日程と dates フィールドが一致するか
4. **場所の正確性**: 公式サイトに記載の開催地と location フィールドが一致するか
5. **CFP情報**: cfp.deadline, cfp.status が公式情報と一致するか

### 3. 検証結果の記録

`pipeline/fact-check-${WEEK}.md` に結果を記録:

```markdown
# ${WEEK} ファクトチェック結果

> 検証日: YYYY-MM-DD

## 検証結果

| カンファレンス | URL到達 | 名前 | 日程 | 場所 | CFP | 判定 |
|-------------|---------|------|------|------|-----|------|
| Conf Name   | OK      | OK   | OK   | OK   | OK  | PASS |
| Conf Name 2 | 403→fetch.py OK | OK | 修正 | OK | - | FIX |
| Conf Name 3 | 404     | -    | -    | -    | -   | FAIL |

## 修正内容
- Conf Name 2: dates.start を 2026-06-15 → 2026-06-16 に修正

## 削除
- Conf Name 3: URL無効のため削除
```

### 4. 判定ルール

| 判定 | 条件 | アクション |
|------|------|----------|
| PASS | 全フィールド正確 | そのまま採用 |
| FIX  | 軽微な誤り（日付1日ずれ等） | 修正して採用 |
| FAIL | URL無効、情報が大幅に異なる | エントリを削除 |
| SKIP | URL到達不可（403等）かつ fetch.py でも失敗 | `[要レビュー]` タグ付きで採用 |

### 5. 修正の適用

FIXまたはFAILの場合、`data/conferences.json` を修正:

```bash
# 修正後
python3 -c "import json; json.load(open('data/conferences.json'))"  # JSON検証
bash config/generate-summary.sh
git add data/ pipeline/
git commit -m "${WEEK} Phase2: ファクトチェック完了"
```

### 6. mainへマージ

```bash
git checkout main
git pull --ff-only origin main
git checkout "$BRANCH" -- data/ changelog/
git add data/ changelog/
git commit -m "${WEEK} カンファレンス情報更新（ファクトチェック済み）"
git push origin main
```

### 7. クリーンアップ（オプション）

成功時はpipelineブランチを削除:

```bash
git push origin --delete "$BRANCH" || true
```
