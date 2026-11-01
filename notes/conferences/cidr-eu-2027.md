# CIDR 2027（Amsterdam）— 2026 年回のプログラムから見た関心トピック

- CIDR 2027: 2027-01-24〜27、Mövenpick Hotel Amsterdam City Centre（Amsterdam, The Netherlands）
- 投稿締切は **2026-08-04**（11:59pm Pacific）で既に終了。著者通知 2026-10-06、カメラレディ 2026-12-04。採択論文リストは公式サイトの "Accepted Papers" に掲載予定。
- 調査日: 2026-11-01。CIDR 2026（2026-01-18〜21、Chaminade Resort & Spa, Santa Cruz, CA）のプログラム全 34 本のタイトルを確認し、3 本は PDF の要旨まで確認。

## 要点

- **AI による業務的な意思決定・合意形成支援**に最も近いのは、TU Darmstadt の **"A Vision for Autonomous Data Agent Collaboration: From Query-by-Integration to Query-by-Collaboration"**（Eckmann, Binnig）。各データソースを代表する自律エージェント同士のプロトコルで問合せを解く構想で、「中央集権的なデータ統合を不要にする」と主張。分散データ管理・組織間連携の観点でも最重要。
- **分散データガバナンス**: **"Privacy Meets Regulations: Shaping the Future of Work"**（Amiri, Allard, Agrawal, Loo）がマルチプラットフォーム間の規制執行とプライバシーを扱う。他にガバナンスを題名に含む論文はない。
- **データスペース / データ主権 / クリーンルーム**: 該当する論文なし。
- **データメッシュ / データプロダクト**: 論文としては無し。SAP のスポンサートーク "From Tables to Data Products" のみ。関連しそうな研究は Pneuma Project（情報ニーズをスキーマとして具象化してデータ発見を自動化）と "Semantic Data Modeling, Graph Query, and SQL, Together at Last?"（Jeff Shute）。
- 2026 年回は **LLM/エージェントとデータシステム**がセッション 2 本分（"LLMs for Databases"、"Text-to-SQL, Agents, LLMs, Oh My!"）を占め、"Supporting Our AI Overlords: Redesigning Data Systems to be Agent-First"、"Please Don't Kill My Vibe: Empowering Agents with Data Flow Control"、"Deep Research is the New Analytics System" など、エージェントがデータ基盤を操作する前提のシステム設計論が中心。2027 年回も同傾向が続くと見てよい（推測）。

## 関心トピック別（CIDR 2026 プログラム）

### AI による意思決定・協調（Query-by-Collaboration）

- **A Vision for Autonomous Data Agent Collaboration: From Query-by-Integration to Query-by-Collaboration** — Timo Eckmann, Carsten Binnig（TU Darmstadt）。Session 6: Data Integration and Wrangling。
  > "In this paper, we present a vision for autonomous data agent collaboration, where complex queries are no longer executed through a single centralized query plan, but instead resolved through a dynamic protocol among intelligent agents—each serving as an autonomous interface to a distinct data source."
  > "This decentralized approach eliminates the need for traditional data integration by allowing agents to reason locally while collaboratively contributing to global query results."
  PDF: https://vldb.org/cidrdb/papers/2026/p19-eckmann.pdf
- **Please Don't Kill My Vibe: Empowering Agents with Data Flow Control** — Charlie Summers, Haneen Mohammed, Eugene Wu（Columbia）。Session 3。
  > "we argue that systems should support Data Flow Controls (DFCs) and enforce DFC policies natively."
  PDF: https://vldb.org/cidrdb/papers/2026/p10-summers.pdf
- Supporting Our AI Overlords: Redesigning Data Systems to be Agent-First — Shu Liu ほか。Session 3。
- Deep Research is the New Analytics System: Towards Building the Runtime for AI-Driven Analytics — Matthew Russo ほか。Session 1。
- KathDB: Explainable Multimodal Database Management System with Human-AI Collaboration — Guorui Xiao ほか。Session 1。
- BridgeScope: A Universal Toolkit for Bridging Large Language Models and Databases — Session 1。
- Making Prompts First-Class Citizens for Adaptive LLM Pipelines — Uğur Çetintemel ほか。Session 1。
- Leveraging Query Optimizers to Verify the Soundness of LLM-based Query Rewrites — Vivek Narasayya ほか。Session 3。

### 分散データガバナンス・組織間

- **Privacy Meets Regulations: Shaping the Future of Work** — Mohammad Javad Amiri, Tristan Allard, Divyakant Agrawal, Boon Thau Loo。Session 4: Distributed Coordination and Consistency。
  > "This paper outlines a vision for regulating, preserving privacy, and structuring future multi-platform crowdworking environments."
  > "collaboration among platforms within multi-platform systems is essential to enforce these cross-platform regulations effectively."
  PDF: https://vldb.org/cidrdb/papers/2026/p23-amiri.pdf
- Consistency and Correctness in Data-Oriented Workflow Systems — Michael Stonebraker ほか。Session 4。（関連は弱い）

### データメッシュ / データプロダクト / セマンティクス

- Sponsor talk: SAP "From Tables to Data Products"（要旨なし）
- The Pneuma Project: Reifying Information Needs as Relational Schemas to Automate Discovery, Guide Preparation, and Align Data with Intent — Session 6。
- Semantic Data Modeling, Graph Query, and SQL, Together at Last? — Jeff Shute。Session 5: SQL and Data Modeling。

### 全体像（CIDR 2026）

- 基調講演: "Analyzing Metastable Failures"（Rebecca Isaacs, AWS）、"How to Give AI a Bad Carbon Footprint"（David Patterson）
- セッション: LLMs for Databases / Data Platform Benchmarking and Optimization Techniques / Text-to-SQL, Agents, LLMs, Oh My! / Distributed Coordination and Consistency / SQL and Data Modeling / Data Integration and Wrangling / Memory, I/O, and Data Movement in Modern Data Systems / Hardware-Accelerated Query Processing。ほかに Gong Show、Awards and Sponsor Talks。
- 採択 34 本（vldb.org の proceedings ページ）。

## 参加できるもの

- 聴講参加は登録制（CIDR 2027 サイトに Registration ページあり。料金未確認）。隔年ではなく毎年開催（2026 Santa Cruz → 2027 Amsterdam）。
- 投稿は締切済み。2027 年回の採択論文リストが出たら、上記の観点で再確認するのがよい。

## 未確認

- CIDR 2027 の採択論文・プログラム（2026-11-01 時点で未掲載）。
- 34 本のうち要旨まで読んだのは 3 本。他はタイトルのみでの判断。
- CIDR 2027 の参加費。

## 根拠（2026-11-01 確認）

- CIDR 2026 program: https://www.cidrdb.org/cidr2026/program.html
- CIDR 2026 proceedings（全 34 本）: https://vldb.org/cidrdb/2026/
- CIDR 2027 top: https://www.cidrdb.org/cidr2027/ — "January 24-27, 2027 Amsterdam, The Netherlands" / "Mövenpick Hotel Amsterdam City Centre in Amsterdam, The Netherlands"
- CIDR 2027 CFP: https://www.cidrdb.org/cidr2027/cfp.html — "August 4th, 2026: submission deadline for all contributions October 6th, 2026: author notification for all contributions December 4th, 2026: camera ready deadline for all contributions"
