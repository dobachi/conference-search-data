# 2026-W34 手動バックフィル: 2026-12〜2027 年カバレッジ改善

> 更新日: 2026-08-21
> 種別: 手動バックフィル（週次ローテーション外）
> 対象期間: 2026-12 〜 2027-12

## 背景

週次パイプラインの検索クエリが `"...conference 2026"` と当年決め打ちだったため、
2027 年開催のカンファレンス（KubeCon EU 2027, AWS re:Invent 系, Data+AI Summit 等の
「2026 検索でたまたま拾えた常連」のみ）が 10 件しか登録されていなかった。

手動リサーチで **75 件** の 2027 年カンファレンスを追加し、来年度カバレッジを 10 → 85 件に改善。

同時に週次パイプラインの構造的な取りこぼしを防ぐため、以下も修正:

- `config/conferences.yml`: `target_year: 2026` → `target_years: "current_year, next_year"`（`time_horizon` も 12→18 か月に）
- `config/prompts/phase1.md`: 検索クエリを `CURRENT_YEAR` と `NEXT_YEAR` の両年併記に変更

## 新規追加（75 件）

### カテゴリ別内訳（複数カテゴリを持つ場合は重複カウント）

| カテゴリ | 件数 |
|---|---|
| AI / 機械学習 | 25 |
| ビジネス / DX | 23 |
| クラウド / インフラ | 16 |
| データインテリジェンス | 16 |
| PETs | 10 |
| データプラットフォーム | 10 |
| データエンジニアリング | 9 |
| Data Spaces / データ連携 | 1 |

### 月別内訳（開催開始月）

| 月 | 件数 |
|---|---|
| 2027-01 | 4 |
| 2027-02 | 8 |
| 2027-03 | 16 |
| 2027-04 | 14 |
| 2027-05 | 14 |
| 2027-06 | 12 |
| 2027-07 | 3 |
| 2027-08 | 3 |
| 2027-09 | 2 |
| 2027-10 | 2 |
| 2027-11 | 2 |

### 主要追加イベント（抜粋）

**AI/ML アカデミック**: AAAI-27, ICLR 2027, CVPR 2027, ICCV 2027, ACL 2027 (京都), EACL 2027, NAACL 2027, COLING 2027, AAMAS 2027, WSDM 2027, NLP2027 (福岡)

**DB/データ アカデミック**: SIGMOD/PODS 2027, VLDB 2027, ICDE 2027, CIDR 2027, EDBT/ICDT 2027, WWW 2027

**セキュリティ/PETs アカデミック**: USENIX Security 2027, NDSS 2027, AsiaCCS 2027, Real World Crypto 2027, FHE.org 2027, CPDP 2027

**産業/ベンダー**: NVIDIA GTC 2027, Google Cloud Next 2027, Snowflake Summit 2027, Red Hat Summit 2027, Cisco Live US/EMEA 2027, FabCon 2027, Open Source Summit NA/EU 2027, QCon London 2027

**エンタープライズ/DX**: WEF Davos 2027, CES 2027, SXSW 2027, RSA Conference 2027, Web Summit Qatar 2027, Money20/20 (Asia/Europe/USA) 2027, Gartner IT Symposium Barcelona 2027

**Gartner CIO Leadership Forum 2027**: Phoenix, Hollywood FL, London, Tokyo, Sydney, Vienna

**Gartner D&A Summit 2027**: US (Orlando), London (EMEA), Tokyo, Sydney

**IAPP**: Global Summit 2027 (DC), PSR+AIGG 2027 (Vancouver), Canada Symposium 2027

**日本**: SRE Kaigi 2027, Japan DX Week 春 2027, NexTech Week 春 2027, Gartner D&A Summit Tokyo 2027, ACL 2027 京都, NLP2027 福岡

**インフラ crossover**: PlatformCon 2027 Live Day (SF/London/NYC), AWS Summit London/Paris 2027, Infosecurity Europe 2027

## 情報更新（0 件）

## ステータス自動更新

`config/generate-summary.sh` の自動処理により反映（本コミットに含まれる）。

## 既知の課題（このコミットでは対処せず）

- **SREcon26 Americas の日付エラー**: 既存エントリ `srecon26-americas-north-america-2026`
  が 2026-03-24 開催となっているが、Agent 2 の調査で「実際は 2027-04-12〜14 (Seattle)」
  との情報あり。ただし USENIX の "SREcon<year>" 命名慣行と齟齬（SREcon26 なら 2026 開催のはず）。
  Agent の混乱の可能性もあるため、次回の週次リサーチで再検証する。

## リサーチ手順

4 並列の general-purpose エージェントで以下のカテゴリを分担:

1. AI / 機械学習 + データインテリジェンス
2. クラウド / インフラ
3. データエンジニアリング + データプラットフォーム + Data Spaces
4. PETs + ビジネス / DX

各エージェントは:
- 既知 139 件との重複を排除
- 公式サイトで日付を検証（TBD/推測はスキップ）
- 「シリーズ+年」でクロスエージェント重複を排除（統合 89 → 79 → 75）
- JSON スキーマに従って出力

最終的に、月別・カテゴリ別のバランスを確認した上で本コミット。
