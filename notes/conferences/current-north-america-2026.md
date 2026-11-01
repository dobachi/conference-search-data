# Current 2026 San Francisco — リアルタイムコンテキスト / リアルタイム AI / リアルタイムレイクハウス

- 対象: 2026-11-04（水）〜05（木）、Moscone West, San Francisco（11/3 は Welcome Reception / Partner Summit）
- 調査日: 2026-11-01（公式セッション一覧 103 件を取得し、タイトルで絞り込み。説明文は未読）
- セッション一覧: https://current.confluent.io/san-francisco/sessions
- トラック内訳（タイトルに付くもの）: Data Streaming 21 / LLMs and AI Agents 16 / Kafka Operations 15 / Data and AI Governance 4 / Analytics Platforms 4 / Application Development 4 / Data Integration and Data Sharing 2（残りは基調講演・Meet-Up・懇親会）
- 基調講演: 11/4 10:00 "All your business, always current"（Shaun Clowes, Sean Falconer, Andrew Sellers / Confluent、Thomas Mahaffey / Accenture、Gayathri Veale / Indeed ほか）

## 要点

- **リアルタイムコンテキスト供給**がこの回の中心テーマの一つ。「AI エージェントにライブなデータ（CDC・ストリーム）を MCP 等で渡す」セッションが Confluent・AWS・Materialize・Humana など複数。
- **リアルタイム AI** はトラック "LLMs and AI Agents"（16 本）としてまとまっている。エージェントのガバナンス（最小権限、PII マスキング、行動ログ）も含む。
- **リアルタイムレイクハウス**は Confluent が **"Streamhouse"** という呼び方で前面に出している（基調講演直後の AMA、TotalEnergies 事例、LLM+MCP との組合せ）。Iceberg v3/v4 とカタログ周りのセッションもある。"Tableflow" という語はセッション一覧には出てこない。

## 1. リアルタイムコンテキスト供給

| 日時 | 種別 | セッション | 登壇 |
|---|---|---|---|
| 11/4 14:00 | Breakout | The Missing Protocol: Connecting AI Agents to Real-Time Data Streams | Sean Falconer, Viktor Gamov (Confluent) |
| 11/4 14:40 | Sponsor | Powering Interactive Agents with Live Context | Nate Stewart (Materialize) |
| 11/5 09:30 | Meet-Up | Fresh Data or Fast Retrieval? Lightning Queries Give Agents Both | RJ Atwal, Vasudha Khare (Confluent) |
| 11/5 09:30 | Breakout | When the RAG-Time Never Stops | Benjamin Gamble (AI By Wire) |
| 11/5 12:15 | Sponsor | Real-Time Context for AI Agents: Answering with Live Data on Amazon Bedrock AgentCore and Confluent Cloud | Mithun Mallick, Sumesh Raghavan (AWS) |
| 11/5 13:30 | Breakout | From Change Data to Live Context: Serving CDC Streams to AI Agents over MCP | Ankit Srivastava (Humana) |
| 11/5 13:30 | Breakout | Teaching the Streamhouse to Speak Human with LLMs and MCP | Olena Kutsenko (Confluent) |
| 11/5 14:30 | Breakout | When Kafka + Flink + Redis Isn't Enough: Building a Context Lake for Sub-Second Agent Decisions | Xiaowei Jiang (Tacnode) |
| （時刻未取得） | — | Stop Scanning the Whole Topic: Server-Side Filtered Reads for Agent Context | — |

## 2. リアルタイム AI / エージェント

| 日時 | 種別 | セッション | 登壇 |
|---|---|---|---|
| 11/4 08:45 | Sponsor | Event-driven Agents: Why your app shouldn't wait for the user to ask | Adam Wagner (DataDog) |
| 11/4 13:00 | Breakout | Orchestrating Intelligent Agent Ecosystems: Building a Real-time Streaming Backbone with Confluent and the Gemini Enterprise Agent Platform | Ramadevi Bylapudi (Google Cloud), Sean Falconer (Confluent) |
| 11/4 13:00 | Breakout | Using Agentic AI to create the next generation of non-Java Kafka clients | Shivsundar R, Andrew Schofield (Confluent) |
| 11/4 13:20 | Sponsor | How to NOT Evaluate an AI Agent | Matt Searle (Conduktor) |
| 11/4 15:15 | Breakout | From Alerts to Autonomy: Advancing the Maturity Curve with Agentic Managed Streaming Platforms | Bobby Calderwood, Andrew Lee (JPMC) |
| 11/4 15:15 | Meet-Up | AI model serving for Apache Flink | Julian Payne (Confluent) |
| 11/4 16:15 | Breakout | The Model Isn't the Product: Building Streaming Evidence Layers for Industrial AI | Tony Lo (IntelFactor Systems) |
| 11/4 16:15 | Breakout | AI-Augmented Diagnostics for Change Data Capture Pipelines | Jake Leister (Sammons Financial Group) |
| 11/5 09:30 | Breakout | Least Privilege for Non-Human Identities: Governing an Autonomous Kafka SRE Agent | Jeremy Frenay (Lenses) |
| 11/5 10:30 | Breakout | Masking PII/PCI in Motion: Real-Time Data-Loss Prevention with Kafka and Flink on Confluent Cloud | Blip.ai / Datatchê |
| 11/5 10:30 | Breakout | Serverless Kafka consumer applications and AI agents with AWS Lambda | AWS |
| 11/5 10:50 | Lightning | Flink with an AI Agent That Debugs Itself: A Harness Engineering Walkthrough | Purshotam Shah (Yahoo) |
| 11/5 11:30 | Breakout | Fork the Stream: Safe, Isolated AI Agents on Real-Time Data with AgileLog | UIUC |
| 11/5 13:30 | Breakout | Agentic Coding For Data Streaming Engineers | Lucia Cerchie (Confluent) |
| 11/5 13:50 | Lightning | Kafka as the Agent Action Log: Replay, Recovery, and Observability for AI Agents | Ron Kapoor (Conduktor) |
| 11/4 12:30, 11/5 14:30 | General | $20.9 Billion Lost to Fraud Every Year: Learn to Stop It in Milliseconds | （Hackathon Hub） |

## 3. リアルタイムレイクハウス（Streamhouse / Iceberg）

| 日時 | 種別 | セッション | 登壇 |
|---|---|---|---|
| 11/4 12:00 | Meet-Up | Post-Keynote Huddle: Streamhouse AMA | Sean Falconer, Vasudha Khare (Confluent) |
| 11/4 12:00 | Sponsor | Your AI Agents Can't Read Your Iceberg Table: Delete Formats, Query Engines, and Iceberg v4 | Shubham Baldava (Olake) |
| 11/4 14:00 | Breakout | OpenLineage To Track Them All: From Kafka To The LakeHouse | Factor House |
| 11/4 14:00 | Breakout | Hardwood: Building a Parquet Parser From Scratch (With a Little Help From AI) | Gunnar Morling (Confluent) |
| 11/4 15:15 | Breakout | The Iceberg Spec in Motion: v3 Features, v4 Proposals, and a Maturing Catalog Ecosystem | Alex Merced (Dremio) |
| 11/5 10:30 | Breakout | Introducing the Flink State Catalog: A New Era in State Observability | Gyula Fora (Apple) |
| 11/5 11:30 | Meet-Up | Designing a Streamhouse for Energy Trading | Stefano Ursino (TotalEnergies) |
| 11/5 13:30 | Breakout | Teaching the Streamhouse to Speak Human with LLMs and MCP | Olena Kutsenko (Confluent) |

## 参加できるもの

- 現地参加のみ（オンライン配信・録画公開の記載はセッション一覧・イベントページで未確認）。
- 料金はイベントページの記載が食い違う（$499〜$999 のパス表と「complimentary pass」の記述が併存）。登録時に要確認。

## 未確認・注意

- セッションの説明文は読んでいない（タイトル・日時・登壇者のみ）。テーマ分類はタイトルからの判断。
- 一覧は 2026-11-01 時点。直前に追加・変更される可能性あり。
- "Stop Scanning the Whole Topic" はページ上に存在するが、一覧の自動解析で日時を取れなかった。

## 根拠（2026-11-01 確認）

- セッション一覧: https://current.confluent.io/san-francisco/sessions （103 件。"Current 2026 features an exciting schedule of lightning talks, workshops, and breakout sessions"）
- イベント概要（日程・会場・料金・"80+ sessions"）: https://current.confluent.io/san-francisco
