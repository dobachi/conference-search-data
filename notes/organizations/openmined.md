# OpenMined Foundation — 活動内容と参加方法（調査メモ）

- 対象: `openmined` （[data/organizations.json](../../data/organizations.json)）
- 調査日: 2026-11-01（公式サイト・GitHub の一次情報のみ。検索スニペットは不使用）
- 調査のきっかけ: サイトのメモ「どういう活動を行っているか、参加可能なものがあるかを調べる」

## 要点

- 501(c)(3) の非営利財団 + グローバルコミュニティ。「非公開データのための公共ネットワーク」を作ることをミッションに掲げる [S9][S10]
- 技術の中核は、データを移動させずにサイロ間で安全・統治された計算を協調させるネットワーク（PySyft / SyftBox 系）[S3][S4]
- 2026 年時点で活発。公式ブログ最新 2026-08-27、Research 記事 2026-09-19、GitHub の PySyft は 2026-10-30 更新 [S16][S17][S25]
- 個人が参加できる入口は **Slack（メールだけで参加）**、ニュースレター、OSS へのコントリビュート、研究フェローシップ。法人は寄付・助成・パートナー提携 [S21][S14][S26]

## 活動内容

| 区分 | 内容 | 根拠 |
|---|---|---|
| OSS プロダクト | PySyft（「Perform data science on data that remains in someone else's server」、Apache-2.0、GitHub スター 10k 表示）、SyftBox [Beta]、Syft Space / SyftHub、syft-flwr（Flower 連携の連合学習）、Attribution-Based Control | [S23][S26] |
| ネットワーク | 「BioVault」: 参加者端末に機微ファイルを置いたまま知見を流通させる無料・オープンソースのサブネットワーク。分野別（気候・医療・金融など）のプライバシー保護ネットワーク立ち上げを支援 | [S5][S6] |
| 研究プログラム | Research Fellowship（博士課程・予備博士研究者がパートタイムで参加。2026 年が最初のコホート）、Research Grants、NAIRR Pilot Partnership、FL Project Co-Design。フロンティアモデルのアンサンブル・ルーティング研究者向けに計算資源・エンジニアリング・評価と報酬（stipend）を提供 | [S14][S15][S26] |
| 評価・AI ガバナンス | 2026-08-27 のニュース「PySyft used for first double-blind evaluation of a proprietary, frontier-class AI model」。埋め込み型 AI 評価者のスケールに関する研究記事（2026-09-19） | [S16][S17] |
| GitHub | OpenMined 組織に 180 リポジトリ | [S24] |

## 参加できるもの

| 入口 | 条件 | 根拠 |
|---|---|---|
| Slack コミュニティ | メールアドレスのみで参加。参加と同時にニュースレター購読に同意する扱い | [S21][S8] |
| Research Fellowship | 博士課程・予備博士研究者が対象（公募時期は要確認） | [S14] |
| Research Grants / FL Project Co-Design / NAIRR Pilot Partnership | 研究者・組織向けプログラム（詳細ページは未確認） | [S26] |
| 寄付・助成・パートナー | 法人向け。Donate / Grant / Partner の各問い合わせ窓口 | [S26] |
| 採用 | Careers ページに「View open positions」。取得時点で具体的な募集一覧は本文に無し | [S19][S20] |
| OSS コントリビュート | GitHub（PySyft ほか）。公式のコントリビューター向けオンボーディング文書はこの調査では未確認 | [S23] |

**未確認（推測を書かない）**: 設立年、オンラインコース（courses.openmined.org は JavaScript 描画のため本文を取得できず）、イベント予定、会費（Slack に費用の記載は無いが「free to join」という明文も無い）。

## 本リストへの反映

- `summary` に活動の活発さと参加入口を追記、`outputs` に SyftBox / Syft Space / syft-flwr を追加、`notes` に本メモを設定

## 根拠スパン（verbatim）

- S3 | https://openmined.org/ | "The network coordinates secure, governed computation across silos — without moving data — making it possible to study information that would otherwise remain private."
- S4 | https://openmined.org/ | "No vendor lock-in, no black boxes — just open protocols that ensure the network remains truly decentralized and free."
- S5 | https://openmined.org/ | "BioVault is a free, open-source subnetwork where insights flow freely while sensitive files stay secure on participants' devices."
- S6 | https://openmined.org/ | "Launch a privacy-preserving network for your domain — whether that be in climate, healthcare, finance, or beyond."
- S8 | https://openmined.org/ | "Joining subscribes you to the OpenMined Newsletter and confirms you agree with our privacy policy"
- S9 | https://openmined.org/ | "OpenMined is a 501(c)(3) non-profit foundation and a global community on a mission to create the public network for non-public information."
- S10 | https://openmined.org/foundation/ | "The OpenMined Foundation is a 501(c)(3) non-profit creating open-source network technology that enables access to insights in non-public data without needing a copy or direct access."
- S14 | https://openmined.org/research/ | "PhD students and predoctoral researchers who join part-time alongside their academic work, with the space, resources, and community for ambitious research. Meet the inaugural 2026 cohort."
- S15 | https://openmined.org/research/ | "Compute, engineering, and evaluation for researchers bringing ensemble and routing methods to today's frontier models, with a stipend for your time."
- S16 | https://openmined.org/research/ | "Sep 19, 2026 / Research / How to scale the impact of embedded AI evaluators"
- S17 | https://openmined.org/blog/ | "Aug 27, 2026 / News / PySyft used for first double-blind evaluation of a proprietary, frontier-class AI model"
- S19 | https://openmined.org/careers/ | "Engage in challenging projects, learn from experienced mentors, and contribute to open-source software used by leading organizations worldwide."
- S20 | https://openmined.org/careers/ | "View open positions"
- S21 | https://openmined.org/slack/ | "Enter your email and you'll go straight to Slack to join."
- S23 | https://github.com/OpenMined | "PySyft" / "Perform data science on data that remains in someone else's server"
- S24 | https://github.com/OpenMined | "Showing 10 of 180 repositories"
- S25 | https://github.com/OpenMined | "Updated Oct 30, 2026"（PySyft）
- S26 | https://openmined.org/get-involved/ | ナビゲーション・フッターの項目: "Syft Space | SyftHub" / "syft-flwr" / "SyftBox [Beta]" / "PySyft" / "Attribution-Based Control" / "Research Fellowship" / "Research Grants" / "NAIRR Pilot Partnership" / "FL Project Co-Design" / "Donate" / "Grant" / "Partner"; 本文 "Join the community today:" "Just want Slack?" "Join with only your email"
