---
name: block-secret-bash-read
enabled: true
event: bash
action: block
pattern: (cat|head|tail|less|more|bat|vim|nano|vi|code|open|sed|awk|grep|rg|source|\.\s|strings|xxd|od|base64|python3?|node|ruby|perl|bash|sh|tee)\s+.*(\.\benv\b|master\.key|credentials\.yml\.enc|\.kamal/secrets)
---

🚫 **Bashでのシークレットファイル読み書きをブロックしました**

シークレットファイルをBashコマンドで読み書きすることは許可されていません。

**ブロックされたパターン:**
- `cat .env`, `head master.key` などの読み取りコマンド
- `grep`, `sed` などでのシークレットファイル内容の検索・操作
- `source .env`, `. .env` などのシェル読み込み
- `python3`, `node`, `ruby` などスクリプト言語経由のアクセス
- `strings`, `xxd`, `od`, `base64` などバイナリ解析ツール
- `echo X | tee .env` などの書き込み・追記
