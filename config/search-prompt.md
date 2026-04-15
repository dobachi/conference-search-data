# カンファレンス検索指示

このファイルは互換性のために残している。
実際のプロンプトは `config/prompts/` に移行済み:

- `config/prompts/phase1.md` — Phase 1: カンファレンス検索 & データ更新
- `config/prompts/phase2.md` — Phase 2: ファクトチェック & mainへマージ

## ローカル実行

```bash
bash local-runner/run-phase.sh 1  # 検索
bash local-runner/run-phase.sh 2  # ファクトチェック
```

詳細は `local-runner/README.md` を参照。
