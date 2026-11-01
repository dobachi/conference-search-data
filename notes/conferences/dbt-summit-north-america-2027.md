# dbt Summit 2027（Las Vegas）— 主要トピック

- 日程: 2027-09-13〜16、Las Vegas（公式ページは "dbt Summit in Las Vegas | Sept 13-16, 2027" と "Join the waitlist" のみ。会場・CFP・アジェンダは未公開）
- 名称: dbt Labs の年次カンファレンス **Coalesce** が **dbt Summit** に改称（2026-01-27 の CFP 告知ブログに "Coalesce is now dbt Summit."）。公式説明は "dbt Summit is the world's largest gathering of dbt users to shape the future of data & AI."
- 調査日: 2026-11-01。2027 年回の内容は未公開のため、直近の **dbt Summit 2026** の基調講演テーマと製品発表から主要トピックを整理。

## 要点（dbt Summit 2026 から読む主要トピック）

基調講演の構成は 4 本柱: **"Level up the engine" / "Level up for AI and what your agents consume" / "Level up with AI and what you consume" / "Level up the stack"**。

1. **エンジン刷新（dbt Fusion）**: "Last year, we introduced the dbt Fusion engine, a full rewrite of dbt in Rust with native SQL comprehension"。2026 年は "One dbt, one engine" を掲げ、dbt Core の再構築（"Rebuilding dbt Core in the open: faster runtime, adapters, and docs v2"）。
2. **コスト最適化（dbt State）**: 状態を使った差分実行が GA。"an average 15-30%+ reduction in warehouse compute"。セッション "Optimizing your runs for lower compute, fresher data, and faster iteration with dbt State"。
3. **AI エージェントが消費するコンテキスト**: "dbt MCP Server exposes your models, metrics, lineage, and test results to any AI agent."。セッション "With great context comes great autonomy: leveling up your agent context"。
4. **AI による開発支援**: "dbt Wizard: your AI teammate for data development"（"an agent built specifically for analytics engineering"）。
5. **セマンティックレイヤー / メトリクス**: "dbt Semantic Layer governs metrics"。セッション "The semantic layer is dead. Long live the semantic layer!"、"Apache Ossie: Realizing Semantic Layer Portability"（セマンティックレイヤーの可搬性）。
6. **レイクハウス / Iceberg**: "Lake Compute"（Private Beta）— "a single-node SQL engine built on DuckDB for dbt that runs transformations directly against Apache Iceberg tables"。セッション "The next wave of data infrastructure is in the Lake"、"Product roundtable: open data infrastructure in practice"。
7. **Fivetran との統合**: セッション "We said I do. Now, we're joined at the DAG"。発表に "Fivetran Context Layer"、"Agents Schema centralizes context"。

## 参加できるもの

- 2027 年回は現時点でウェイトリスト登録のみ。参加費・会場未発表。
- CFP は 2026 年回では 1 月下旬に告知、3 月 31 日締切だった（"The CFP closes March 31."）。2027 年回も同時期の可能性（推測）。
- 過去回のセッションは dbt Labs サイトでオンデマンド公開されるのが通例（2026 年回の公開状況は未確認）。

## 未確認

- 2027 年回のアジェンダ・CFP・会場・料金。
- Coalesce → dbt Summit 改称の正確な時期（2026-01-27 のブログで既に改称後）。
- dbt Summit 2026 のトラック名。
- すべて dbt Labs 自身の発信（T1/T2）に基づく。第三者の報道は参照していない。

## 根拠（2026-11-01 確認）

- 公式ページ: https://www.getdbt.com/dbt-summit — "dbt Summit in Las Vegas | Sept 13-16, 2027" / "Join the waitlist"
- CFP 告知（2026-01-27）: https://www.getdbt.com/blog/what-makes-a-great-dbt-summit-presentation — "Coalesce is now dbt Summit." / "The CFP closes March 31."
- 基調講演・製品セッション紹介（2026-08-10）: https://www.getdbt.com/blog/dbt-summit-2026-keynotes-product-sessions
- 製品発表まとめ（2026-09-16）: https://www.getdbt.com/blog/dbt-summit-2026-product-announcements
- 上記の引用句は fetch.py で取得したページ本文に文字列一致することを確認済み。
