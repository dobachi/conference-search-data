# Data Mesh Learning — 活動状況の確認（調査メモ）

- 対象: `data-mesh-learning` （[data/organizations.json](../../data/organizations.json)）
- 調査日: 2026-11-01（公式サイト・公式 Substack の一次情報のみ）
- 調査のきっかけ: サイトのメモ「最近は、活動量が少ないように見える」

## 結論

**メモの見立てどおり、公開面の活動は 2025 年初頭以降ほぼ止まっている。** ただし閉鎖・休止の告知は無く、Slack と毎月のラウンドテーブルの案内は残っているため、`status` は `active` のまま、`summary` に実態を書き足した。

| 活動の窓口 | 最終更新（2026-11-01 時点） | 根拠 |
|---|---|---|
| 公式ブログ | 2025-01-22「The Data Mesh Learning Community Transitions to Community-Led Organization with Newly Formed Board」。それ以前は 2024 年に月 1 本程度 | [S10][S12] |
| ニュースレター（Substack、By Constantia.io） | 最終号 2024-10-01（archive の post_date） | [S18][S19] |
| イベント | 「No upcoming events」。過去枠に 2024-11-20、2025-06-06、2026-06-11〜12（Data Mesh Live） | [S14][S15][S16][S17] |
| コミュニティ | Slack 参加案内あり。「毎月第 2 火曜にラウンドテーブル」と記載 | [S6][S7] |
| 規模 | 「8000+ data leaders」「8K+ data professionals」 | [S1][S4] |

## 運営主体の変化

- 設立は 2021 年 2 月。Contact ページでは「Constantia.io が運営する独立ユーザーコミュニティ」と説明 [S8][S9]
- 2025-01-22 の投稿で、新設の理事会に導かれる**完全にコミュニティ主導の組織へ移行**すると発表（Jean-Georges Perrin が理事会側の役職に就く旨。文は途中で省略表示）[S10][S11]
- 以上から、「Constantia.io 運営」は 2025 年 1 月以前の記述である可能性が高い。サイト上では両方の記述が併存しているため、`summary` には「2025 年 1 月に移行を発表」と事実のみ書いた

## 本リストへの反映

- `summary` を更新（運営移行、活動低調の事実と日付）、`sources` に blog / events / Substack を追加、`verified` を更新

## 根拠スパン（verbatim）

- S1 | https://datameshlearning.com/ | "Join the largest community of 8000+ data leaders implementing data mesh."
- S4 | https://datameshlearning.com/community-getting-started/ | "Data Mesh Learning (DML) is a global community of 8K+ data professionals at various stages of their data mesh journey."
- S6 | https://datameshlearning.com/community-getting-started/ | "Every second Tuesday of each month, the Data Mesh Learning (DML) community hosts a roundtable discussion."
- S7 | https://datameshlearning.com/community-getting-started/ | "Join Slack"
- S8 | https://datameshlearning.com/contact/ | "DML is an independent user community managed by"（続きは "Constantia.io, a tech community company."）
- S9 | https://datameshlearning.com/contact/ | "Data Mesh Learning (DML) was founded in February 2021 to enable people to connect and learn about data mesh."
- S10 | https://datameshlearning.com/blog/ | "The Data Mesh Learning Community Transitions to Community-Led Organization with Newly Formed Board" / "Jan 22, 2025 by Jean-Georges Perrin"
- S11 | https://datameshlearning.com/blog/ | "The community is transitioning to a fully community-led organization guided by a newly formed board of directors."
- S12 | https://datameshlearning.com/blog/ | 以降の記事日付: "Nov 19, 2024" "Oct 21, 2024" "Oct 07, 2024" "Sep 30, 2024" "Sep 23, 2024" "Jul 28, 2024" "Jul 22, 2024"
- S14 | https://datameshlearning.com/events/ | "No upcoming events"
- S15 | https://datameshlearning.com/events/ | "Event Date(s): Jun 11, 2026  - Jun 12, 2026"
- S16 | https://datameshlearning.com/events/ | "Event Date(s): Jun 6, 2025"
- S17 | https://datameshlearning.com/events/ | "Event Date(s): Nov 20, 2024"
- S18 | https://datameshlearning.substack.com/ | "By Constantia.io"
- S19 | https://datameshlearning.substack.com/archive | "post_date":"2024-10-01T14:30:45.709"（最新 3 件: 2024-10-01, 2024-09-03, 2024-08-02）
