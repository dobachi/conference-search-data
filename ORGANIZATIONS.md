# 組織（学会・標準化団体・イニシアティブ・コミュニティ）の登録手順

`data/organizations.json` は、イベントとは別に、関心領域に関係する**組織**（学会、標準化団体、業界団体、コンソーシアム、イニシアティブ、OSS 財団、公的プログラム、企業・ユーザーコミュニティ）をまとめたデータです。サイトの **Organizations** タブ（`https://dobachi.github.io/conference-search-data/#orgs`）で、タグ絞り込みとキーワード検索ができます。

イベントと違って頻繁には増えないので、**週次の自動更新は行いません**。候補の収集だけ週次パイプラインに相乗りさせ、採否判定と登録は人（または人の依頼を受けた Claude Code）が、この手順に沿って行います。

## ファイル構成

| ファイル | 役割 |
|---|---|
| `data/organizations.json` | 組織のマスターデータ（本体） |
| `config/org-tags.yml` | タグの統制語彙と同義語。**人が編集する正本** |
| `data/org-tags.json` | 上記から `validate-orgs.py` が自動生成するサイト用ファイル。手で編集しない |
| `data/org-candidates.md` | 登録候補の置き場。Phase 1 や日々の作業で追記 |
| `scripts/validate-orgs.py` | スキーマ・語彙・参照整合性の検証と、定期見直しの一覧出力 |
| `docs/orgs.js` | サイトの Organizations タブ |

## データスキーマ

```jsonc
{
  "id": "idsa",                         // slug（小文字英数とハイフン）。一意
  "name": "International Data Spaces Association",
  "name_ja": "インターナショナル・データスペース協会",  // 日本語名が無ければ name と同じでよい
  "aliases": ["IDSA", "IDS"],            // 略称・別表記。検索の精度はここで決まる
  "type": "industry-association",        // 下表参照
  "region": "Europe",                    // Japan | Asia-Pacific | North America | Europe | International | Online
  "country": "Germany",                  // 本拠地の国。一次情報で確認できなければ ""
  "url": "https://internationaldataspaces.org/",
  "tags": ["データスペース", "データ標準"],   // config/org-tags.yml の tag からのみ選ぶ
  "outputs": ["IDS standard", "IDSA Rulebook"],  // 主要成果物（標準・仕様・OSS・知識体系・旗艦イベント）
  "groups": [],                          // 注目する下位組織（WG、研究会、SC など）
  "related_conferences": ["idsa-decade-forum-eu-2026"],  // conferences.json の id
  "membership": "unknown",               // open | paid | invite | unknown（下表参照）
  "status": "active",                    // active | dormant | merged
  "summary": "日本語 50〜120 文字。一次情報で確認した事実だけを書く",
  "founded": "2016",                     // 西暦 4 桁。確認できなければ ""
  "sources": [{"url": "https://…/about/", "accessed": "2026-11-01"}],  // 根拠にした一次情報
  "verified": "2026-11-01",              // 最後に一次情報で確認した日
  "first_seen": "2026-W44",
  "last_updated": "2026-W44"
}
```

### type の値

| 値 | 例 |
|---|---|
| `academic-society` | 学会（情報処理学会、ACM SIGMOD、AAAI） |
| `standards-body` | 公的・業界標準の策定団体（W3C、OASIS、IEEE SA、ISO/IEC の SC） |
| `industry-association` | 会員制の業界団体・協会（IDSA、Gaia-X、JDMC） |
| `consortium` | 特定テーマの共同体（MLCommons、Partnership on AI、Eclipse の WG） |
| `initiative` | 法人格を持たない取組・プログラム名（ウラノス・エコシステム、DSBA） |
| `oss-foundation` | OSS をホストする財団（ASF、CNCF、LF AI & Data、FIWARE） |
| `public-program` | 政府・公的機関が主導または資金提供する組織（IPA DADC、DSSC） |
| `corporate-community` | ベンダー主導またはユーザー主導の実践コミュニティ（JAWS-UG、dbt Community） |

### membership の値

一次情報で**確認できた範囲**で付けます。推測で埋めないでください。

| 値 | 意味 |
|---|---|
| `open` | 誰でも無料で参加できる旨の記載がある（Slack、connpass、無料会員枠など） |
| `paid` | 会費・年会費・dues の記載がある |
| `invite` | 申請と承認、推薦、招待が必要という記載がある |
| `unknown` | 上記のいずれも確認できなかった |

### region

イベントと同じ語彙に `International` を加えています。国際的に活動する団体（W3C、CNCF など）は本拠地に関係なく `International`、オンライン専業コミュニティは `Online` とします。

## 掲載基準

**載せる**

- 関心領域（`config/org-tags.yml` のいずれかのタグに該当）に関係がある
- 活動中、または休止・統合済みでも履歴として意味がある（`status` で区別）
- 公式サイトがあり、一次情報で基本事項を確認できる
- 企業主導のコミュニティも対象。ただし **運営主体を `summary` に明記**する（例: 「データブリックス・ジャパンが運営をリード」）

**載せない**

- 企業そのもの、個別製品・サービス
- 一次情報が見つからない組織（`data/org-candidates.md` に理由付きで残す）
- 既存エントリの下位組織で、外部で単独の名前として通用しないもの → 親エントリの `groups` に書く

**下位組織の扱い**: WG や研究会は親の `groups` に入れるのが原則。独立した会員制度・サイト・イベントを持ち、単独で検索されそうなもの（例: ISO/IEC JTC 1/SC 42）は別エントリにしてよい。

## 追加手順

Claude Code に「ORGANIZATIONS.md の手順で ○○ を追加して」と依頼すれば、以下を同じ品質で進められます。

### 1. 候補を受け付ける

- 依頼元は主にユーザー。`data/org-candidates.md` に溜まった候補をまとめて処理してもよい
- 週次パイプライン（`config/prompts/phase1.md`）は、新規イベントの主催団体を見つけたとき候補ファイルに 1 行追記する。**候補ファイルへの追記だけで、`organizations.json` は触らない**

### 2. 重複を確認する

`data/organizations.json` の `id`、`name`、`aliases`、`groups` と照合する。

```bash
grep -i "<組織名や略称>" data/organizations.json
```

既に `groups` に載っているなら新規追加はせず、必要なら親エントリを更新する。

### 3. 一次情報で確認する

公式サイトの About / 概要、Membership / 入会案内、Publications / 成果物、定款・ガバナンスのページを開く。標準化団体なら WG・委員会のページも見る。

- WebFetch が 403 や空を返す場合は `python3 scripts/fetch.py <URL>` でブラウザ UA 取得にフォールバック
- 検索結果のスニペットは根拠にしない。**開いたページだけ**を `sources` に残す
- Wikipedia やまとめ記事は根拠にしない（場所の見当を付けるのに使うのは可）
- 確認できなかった項目は空にする（`founded: ""`、`country: ""`、`membership: "unknown"`）。推測で埋めない

**まとめて複数件を追加するとき**は、`grounded-research` スキル（Depth: Quick、retriever は haiku）で組織ごとに「正式名称・法人形態 / 設立年 / 本拠地 / 会員制度 / 主要成果物 / ミッションの一文」のスパンを集めると効率がよい。初期登録 34 件はこの方法で作成した。

### 4. 掲載基準で判定する

上記「掲載基準」に照らす。載せない場合は `data/org-candidates.md` の該当行を `- [x]` にし、理由を書き添える。

### 5. エントリを書く

- `summary` は一次情報で確認した事実だけで組み立てる。設立年・所在地・会員制度・代表的成果物を 50〜120 文字に
- `tags` は `config/org-tags.yml` から選ぶ。必要な概念が無ければ**先に語彙へ追加**し、同義語（日本語・英語の両方）も書く
- `outputs` は検索で逆引きされる前提で、正式名称や略称（DCAT、DMBOK、MLPerf など）を入れる
- `related_conferences` は `data/summary.txt` または `conferences.json` から該当 id を探す。主催・共催しているイベント、ユーザー会なら対応ベンダーの旗艦イベントを載せる
- `first_seen` / `last_updated` は ISO 週（`TZ=Asia/Tokyo date +%G-W%V`）、`verified` は確認日

### 6. 検証して main にコミットする

```bash
python3 scripts/validate-orgs.py      # エラー 0 を確認。data/org-tags.json も再生成される
git add data/organizations.json data/org-tags.json data/org-candidates.md config/org-tags.yml
git commit -m "orgs: ○○ を追加"
git push origin main
```

週次パイプラインの `pipeline/YYYY-WNN` ブランチとは独立に、**main へ直接コミット**する。サイトは raw.githubusercontent.com の main を読むので、push 後すぐ反映される。

### 7. 既存エントリの更新

`summary` や `membership` を直すときは `sources` に根拠 URL を追加し、`verified` と `last_updated` を更新する。名称変更があれば旧名を `aliases` に残す。

## 定期見直し（半年に 1 回）

```bash
python3 scripts/validate-orgs.py --review                # verified が 180 日より古いエントリ
python3 scripts/validate-orgs.py --review --check-links  # 加えて公式 URL の疎通確認
```

出力された一覧について、公式サイトを再確認し、`status`（休止・統合）、`url` の変更、`summary` の陳腐化を直して `verified` を更新する。全件を見直す必要はない。

## 既知の制約

- 初期登録（2026-W44）のスパン取得は WebFetch 経由で、ページ本文の機械的な再照合は設立年など数値を含む主要項目に限って行った。`membership` が `unknown` のエントリは会費ページまで開いていない
- `iso.org` はローカルからでも 403 を返すため、ISO/IEC の SC は `data/org-candidates.md` で保留中
