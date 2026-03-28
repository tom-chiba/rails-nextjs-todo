---
status: "accepted"
date: 2026-03-28
decision-makers: []
---

# ADR-0025: Active Storage URL生成の環境変数をHOST/PORTに統一

## コンテキストと課題

Active Storageで添付された画像のURLが不正に生成され、開発環境・本番環境の両方で画像表示に失敗していた（Issue #89）。

`default_url_options.rb` は `RAILS_HOST`、`RAILS_PORT`、`RAILS_PROTOCOL` の3つの環境変数を参照していたが:

- 本番デプロイ設定（`deploy.production.yml`）は `HOST` を設定しており、`RAILS_HOST` は未設定 → 変数名の不一致で `localhost` にフォールバック
- `RAILS_PORT` が未設定 → `nil` → `compact_blank` で除外 → ポート80にリクエスト（開発環境のBEは3000で動作）
- `RAILS_PROTOCOL` が未設定 → `http` がデフォルト（本番は `force_ssl = true` で `https` が必要）

結果として、開発・本番ともに `http://localhost/rails/active_storage/...` という到達不能なURLが生成されていた。

## 検討した選択肢

### 選択肢1: `default_url_options.rb` で既存の `HOST` / `PORT` を参照

`RAILS_HOST` → `HOST`、`RAILS_PORT` → `PORT` に変更し、`protocol` は `Rails.env` で判定する。開発時のポートはデフォルト3000、本番ではポートを含めない。

- 良い点: BE側の1ファイルのみの変更で済む。`production.rb` の `config.hosts` が既に `HOST` を参照しており統一感がある。環境変数の増殖を防げる
- 悪い点: `HOST` や `PORT` は汎用的な名前のため、他の用途と衝突する可能性がゼロではない（ただし現状では問題なし）

### 選択肢2: デプロイ設定に `RAILS_HOST` 等を追加

`default_url_options.rb` はそのまま、`deploy.production.yml` に `RAILS_HOST`、`RAILS_PROTOCOL` を追加する。

- 良い点: initializer の変更不要
- 悪い点: `HOST` と `RAILS_HOST` の二重管理になる。同じドメインを2つの変数で設定する必要があり、変更漏れのリスクがある

## 決定

**選択肢1: `default_url_options.rb` で既存の `HOST` / `PORT` を参照** を採用する。

`production.rb` が既に `ENV["HOST"]` を参照しておりアプリ全体で変数名が統一される。`RAILS_HOST` / `RAILS_PORT` / `RAILS_PROTOCOL` は他で使われていないため完全廃止する。`protocol` は `Rails.env.production?` で判定し、`force_ssl = true`（`production.rb`）との整合性を保つ。

### 実装方針

```ruby
Rails.application.routes.default_url_options = {
  host: ENV.fetch("HOST", "localhost"),
  port: Rails.env.development? ? ENV.fetch("PORT", 3000) : nil,
  protocol: Rails.env.production? ? "https" : "http"
}.compact_blank
```

- `host`: `HOST` 環境変数（本番は `deploy.production.yml` で設定済み、開発は `localhost`）
- `port`: 開発環境のみ `PORT` or 3000。本番では Thruster/Let's Encrypt がSSL終端するためポート指定不要
- `protocol`: 本番は `https` 固定、それ以外は `http`

## 結果

### 良い影響

- 開発環境で `http://localhost:3000/rails/active_storage/...` が正しく生成される
- 本番環境で `https://rails-nextjs-todo.api.tom-chiba.com/rails/active_storage/...` が正しく生成される
- 環境変数が `HOST` / `PORT` に統一され、`production.rb` の `config.hosts` と一貫性がある
- デプロイ設定の変更が不要

### 悪い影響

- `protocol` が環境変数ではなく `Rails.env` で決定されるため、ステージング環境等で HTTP を使いたい場合はコード変更が必要（現状ステージング環境はないため影響なし）

## 補足

- 前提: ADR-0021（Active Storage for Todo images）
- 関連 Issue: #89
