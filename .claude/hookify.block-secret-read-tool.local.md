---
name: block-secret-read-tool
enabled: true
event: all
tool_matcher: Read
action: block
conditions:
  - field: file_path
    operator: regex_match
    pattern: (\.env$|\.env\.|master\.key|credentials\.yml\.enc|\.kamal/secrets)
---

🚫 **シークレットファイルへのRead経由アクセスをブロックしました**

Read ツールでシークレットファイルを開くことは許可されていません。

**保護対象ファイル:**
- `.env` / `.env.*`（`.env.example` 含む — テンプレ参照が必要なら本ルールを調整）
- `config/master.key` — Rails マスターキー
- `config/credentials.yml.enc` — 暗号化済み認証情報
- `.kamal/secrets*` — デプロイ用シークレット

**回避策:**
- 必要なキー名のみをユーザーに確認する
- 値の確認が必要な場合はユーザー自身に依頼する
