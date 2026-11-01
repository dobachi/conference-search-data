# conference-search-data

開発者向けカンファレ���ス・イベント情報の検索・管理データ

## 閲覧

カンファレンス一覧は GitHub Pages で公開しています:

**https://dobachi.github.io/conference-search-data/**

## 概要

AI（Claude Code）を活用して、関心のある技術領域のカンファレンス情報を国内外で検索し��2026年度の開催情報を一覧化して維持しています。週次で最新情報を自動更新します。


## お気に入り・メモの端末間同期（GitHub Gist）

各カードの ✎ ボタンでメモ（プレーンテキスト）を書けます。メモは入力から約 1 秒で自動保存され、キーワード検索の対象になり、「Memo」チェックでメモ付きだけに絞れます。メモを付けた 2025 年以前のイベントは、通常は隠れる一覧にも表示されます。

お気に入りとメモ（イベント・組織）はブラウザの localStorage に保存されます。別の PC やスマートフォンと揃えたい場合は、設定（⚙）の **Sync across devices** に GitHub のトークンを入れると、自分のアカウントの **secret Gist**（`conference-search-favorites.json` と `conference-search-notes.json`）を介して同期されます。

1. トークンを作ります。**fine-grained を推奨**します
   - fine-grained: GitHub → Settings → Developer settings → Personal access tokens → **Fine-grained tokens** → Generate new token。Repository access は「Public repositories」のままにし、**Account permissions → Gists → Read and write** だけを付与します。Gist 以外には一切アクセスできません
   - classic: **Tokens (classic)** → Generate new token。スコープは **`gist` のみ**
   - どちらの方式でも、権限の単位は「自分のアカウントの Gist 全体」です。GitHub には特定の Gist 1 件だけに絞る仕組みはありません
2. サイトの設定画面でトークンを貼り付けて **Connect**。初回は Gist が自動作成されます
3. 他の端末でも同じトークンを入れて Connect すると、既存の Gist を自動検出して合流します

- 同期は読み込み時、タブ復帰時、お気に入り変更の約 1.5 秒後に行われます。手動は **Sync now**
- 端末ごとの差分は「ID ごとに新しい変更が勝つ」規則で併合するので、どの端末で外したお気に入りや消したメモも他の端末から消えます。同じメモを 2 台で同時に編集した場合は後から保存した方が残ります
- トークンは各端末の localStorage にのみ保存され、サイト運営側には送られません。**Disconnect** でトークンと Gist ID を端末から消します（Gist 自体は残ります）
- fine-grained トークンには有効期限が必須です。失効すると設定欄に 401 と表示されるので、新しいトークンを入れて Connect し直してください

## データ

- `data/conferences.json` - カンファレンスマスターデータ（JSON）
- `data/organizations.json` - 関連する学会・標準化団体・イニシアティブ・コミュニティ（サイトの Organizations タブ）。追加手順は [ORGANIZATIONS.md](ORGANIZATIONS.md)
- `changelog/` - 週次更新ログ
