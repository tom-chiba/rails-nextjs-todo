---
name: block-secret-file-read
enabled: true
event: file
action: block
conditions:
  - field: file_path
    operator: regex_match
    pattern: (\.env$|\.env\.(?!example).|master\.key|credentials\.yml\.enc|\.kamal/secrets)
---

🚫 **シークレットファイルへのアクセスをブロックしました**

このファイルにはシークレット情報が含まれている可能性があります。
読み取り・編集は許可されていません。

**保護対象ファイル:**
- `.env` / `.env.*` — 環境変数（`.env.example` は除外）
- `config/master.key` — Rails マスターキー
- `config/credentials.yml.enc` — 暗号化済み認証情報
- `.kamal/secrets*` — デプロイ用シークレット
