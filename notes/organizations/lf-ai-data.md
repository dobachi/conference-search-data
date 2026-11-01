# LF AI & Data Foundation — 活動内容と参加方法（調査メモ）

- 対象: `lf-ai-data` （[data/organizations.json](../../data/organizations.json)）
- 調査日: 2026-11-01（公式サイトの一次情報のみ）
- 調査のきっかけ: サイトのメモ「どういう活動を行っているか、参加可能なものがあるかを調べる」

## 要点

- Linux Foundation 傘下の中立ホストとして、AI・データ分野の OSS プロジェクトを「温室のように」育成する財団。サイト表記で **67 プロジェクト、9 技術 WG** [S1][S4][S5][S6]
- 法人会員は **LF の法人会員であることが前提**。Premier 年会費は US$150,000（LF 会員）/ US$170,000（非会員）、General は企業規模別で最大 US$60,000（従業員 5,000 人超・非 LF 会員）[S3][S13][S14][S15]
- **学術・非営利機関は Associate 会員が無料**（Governing Board の承認制）[S11][S12]
- 個人の無料参加経路は公式ページに明文がない（Slack アイコンのみ）。実質的な入口は **各ホストプロジェクトへの OSS コントリビュート** と、公開されるミーティング・ライブセッション [S23]
- 活発: ブログ最新 2026-10-06、ONNX v1.23.0 が 2026-09-18 リリース [S8][S25]

## 活動内容

| 区分 | 内容 | 根拠 |
|---|---|---|
| OSS ホスティング | 67 プロジェクト。例: ONNX、Kedro（再現可能なデータサイエンスコードの Python フレームワーク）、Adversarial Robustness Toolbox（ML モデルの敵対的脅威に対する評価・防御・認証・検証） | [S4][S8][S9][S10] |
| 技術 WG・委員会 | 9 技術 WG。Trusted AI（信頼できる AI のためのポリシー・ガイドライン・ツール）、BI & AI、ML Workflow and Interoperability Design など | [S5][S19][S20] |
| ガバナンス | Technical Advisory Council（TAC）が技術面を主導し、プロジェクトのインキュベーション・卒業・新規イニシアティブを担う。Premier 会員は Governing Board の議席 | [S16][S18] |
| イベント | LF AI & Data Day（四半期ごとの 1 日イベント）、LF AI & Data Summit | [S21][S22] |
| 公開ミーティング | 「スケジュールを見て、ライブセッションに参加し、過去のミーティングを見返す」導線 | [S23] |

## 参加できるもの

| 入口 | 条件 | 根拠 |
|---|---|---|
| Premier 会員 | US$150k/年（LF 法人会員）または US$170k/年。Governing Board 議席 | [S13][S14][S16] |
| General 会員 | 企業規模別。最大 US$60k/年（5,000 人超・非 LF 会員） | [S15] |
| Associate 会員 | 学術・非営利機関は無料。Governing Board 投票で承認。会員・マーケティング用メーリングリスト | [S11][S12][S17] |
| 個人 | 明文なし。各プロジェクト（GitHub）へのコントリビュート、公開ミーティング・ライブセッション参加が現実的 | [S23] |

**未確認**: 設立年・LF AI からの改称年、プロジェクトごとの成熟度（Graduated / Incubation / Sandbox）、TAC 会議の公開性、Slack 参加手順、個人メーリングリスト登録手順、Generative AI Commons の詳細。

## 本リストへの反映

- `summary` に規模（67 プロジェクト・9 WG）と会費を追記、`outputs` に ONNX / Kedro / ART を追加、`groups` に主な WG を追加、`notes` に本メモを設定

## 根拠スパン（verbatim）

- S1 | https://lfaidata.foundation/ | "As a neutral host, we foster collaboration and provide trusted AI & Data infrastructure, uniting developers, organizations, and users."
- S3 | https://lfaidata.foundation/join/ | "To participate in LF AI & Data as a corporate member requires companies to be a corporate member of The Linux Foundation."
- S4 | https://lfaidata.foundation/ | "67 Projects"
- S5 | https://lfaidata.foundation/ | "9 Technical Working Groups"
- S6 | https://lfaidata.foundation/ | "We nurture open-source AI and data projects like a greenhouse, growing them from seed to fruition with full support and resources."
- S8 | https://lfaidata.foundation/ | "ONNX v1.23.0, released on September 18, 2026, moves that work"
- S9 | https://lfaidata.foundation/projects/ | "Adversarial Robustness Toolbox (ART) provides tools that enable developers and researchers to evaluate, defend, certify and verify Machine Learning models and applications against the adversarial threats."
- S10 | https://lfaidata.foundation/ | "Kedro is an open-source Python framework for creating reproducible, maintainable and modular data science code."
- S11 | https://lfaidata.foundation/join/ | "The Associate membership is a free complimentary membership limited to academic and non-profit organizations and institutions."
- S12 | https://lfaidata.foundation/join/ | "Associate Member applications ultimately need to be approved by an LF AI & Data Governing Board vote per our charter."
- S13 | https://lfaidata.foundation/join/ | "$170,000 (USD)"（Premier、非 LF 会員）
- S14 | https://lfaidata.foundation/join/ | "$150,000 (USD)"（Premier、LF 会員）
- S15 | https://lfaidata.foundation/join/ | "$60,000 (USD) 5,000+"（General、最大規模帯、非 LF 会員）
- S16 | https://lfaidata.foundation/join/ | "Board seat on the LF AI & Data Governing Board"
- S17 | https://lfaidata.foundation/join/ | "Member and marketing mailing lists"
- S18 | https://lfaidata.foundation/join/ | "Technical Advisory Council Leadership The LF AI & Data TAC leads technical efforts, incubates projects, graduates them, and fosters new initiatives."
- S19 | https://lfaidata.foundation/join/ | "Trusted AI : Develop global policies, guidelines, and tools to ensure the creation of trustworthy AI systems, driving continuous improvement."
- S20 | https://lfaidata.foundation/join/ | "BI & AI : Combine the speed and automation of AI with the insights of BI to create transformative Cognitive Intelligence (CI)."
- S21 | https://lfaidata.foundation/join/ | "LF AI & Data Day : Participate in quarterly one-day events showcasing technical projects in collaboration with LF AI & Data."
- S22 | https://lfaidata.foundation/join/ | "Attend LF AI & Data Summits focused on open-source AI and data technologies."
- S23 | https://lfaidata.foundation/ | "View our schedule, join live sessions, revisit past meetings, and stay informed on the latest AI and machine learning advancements."
- S25 | https://lfaidata.foundation/blog/ | "LF AI & Data October 6, 2026"
