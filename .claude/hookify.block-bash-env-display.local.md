---
name: block-bash-env-display
enabled: true
event: bash
action: block
pattern: \bprintenv\b|(^|[\s;&|`(])env\s*$|(^|[\s;&|`(])env\s*\||(^|[\s;&|`(])set\s*$|echo\s+["']?\$[A-Za-z_]
---

🚫 **環境変数の表示コマンドをブロックしました**

シェル経由で環境変数を出力することは許可されていません。

**ブロックされたパターン:**
- `printenv` / `printenv VAR` — 環境変数のダンプ
- `env` 単独 / `env | grep ...` — 全環境変数の列挙
- `set` 単独 — シェル変数を含む全変数の列挙
- `echo $VAR` — 環境変数の値出力

**意図がそうでない場合:**
- `env FOO=bar cmd` のラッパー用途は別パターンとして検出されます（その場合も意図確認が必要）
- ファイル名検索なら `find . -name '.env'` などへ書き換え
- どうしても値の確認が必要な場合はユーザー自身に依頼
