---
name: block-bash-env-set
enabled: true
event: bash
action: block
pattern: \bexport\s+[A-Za-z_][A-Za-z0-9_]*\s*=|(^|[\s;&|`(])[A-Z_][A-Z0-9_]*=[^\s;&|`]+\s+[A-Za-z]
---

🚫 **環境変数の設定コマンドをブロックしました**

シェル経由で環境変数をセットすることは許可されていません。

**ブロックされたパターン:**
- `export FOO=bar` — exportによる環境変数定義
- `FOO=bar command ...` — コマンド単位の一時的な環境変数注入（`env FOO=bar cmd` 含む）

**意図がそうでない場合:**
- 一時的な環境変数が本当に必要なら、ユーザーに依頼するか `.env.example` テンプレ更新でカバー
- `make BUILD=debug install` などビルド変数の受け渡しが必要な場合は、このルールを `action: warn` に変更するか、対象を絞ったパターンへ調整
