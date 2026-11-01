# 組織 候補リスト

週次パイプライン（Phase 1）や日々の作業で見つけた「登録候補」の組織を置く場所。
**ここに書いただけでは `data/organizations.json` には載らない。**
採否判定と登録は `ORGANIZATIONS.md` の手順に従って人（または人の依頼を受けた Claude Code）が行う。

書式（1 行 1 候補、追記のみ。重複しても構わない）:

```
- YYYY-WNN | 組織名 | URL | 見つけた文脈（カンファレンス ID やメモ）
```

処理済みの行は削除せず、行頭を `- [x]` にして残す（同じ候補を何度も検討しないため）。

## 候補

- 2026-W44 | ISO/IEC JTC 1/SC 32 (Data management and interchange) | https://www.iso.org/committee/45342.html | 初期調査時 iso.org が 403 で一次情報を取得できず保留。jtc1info.org 経由で再調査する
- 2026-W44 | ISO/IEC JTC 1/SC 42 (Artificial intelligence) | https://www.iso.org/committee/6794475.html | 同上（ISO/IEC 42001 の所管 SC）
- 2026-W44 | Manufacturing-X | https://manufacturing-x.de/ | 初期調査時に公式サイトへ接続できず保留（plattform-i40.de は bot チェックで取得不可）
- 2026-W44 | 情報処理学会 データベースシステム研究会 (IPSJ SIG-DBS) | https://www.ipsj.or.jp/sig/dbs/ | ipsj エントリの groups に載せる候補。旧 URL が 404 で正式ページ未確認
- 2026-W44 | DAMA Japan | https://www.dama-japan.org/ | dama-international の groups または独立エントリ候補。未調査
- 2026-W44 | Eclipse Dataspace Components (EDC) | https://projects.eclipse.org/projects/technology.edc | eclipse-dataspace-wg の outputs に追記する候補。未調査
