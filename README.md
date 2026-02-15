# 開発のために環境立ち上げ直後に行うこと

1. `gh auth login` で `gh` コマンドを使えるように
2. `claude` を実行して使える環境を Claude Code を使えるように
3. Claude Code 内で `/plugin marketplace add thkt/claude-config`
4. Claude Code 内で `/plugin marketplace add masuP9/a11y-specialist-skills`
5. fe/.env.example をベースに fe/.env を作成
6. fe/ 内で `npm i`
7. be/ 内で `bundle install`

## 本番デプロイ

### バックエンド (Kamal → ConoHa VPS)

1. 環境変数 `KAMAL_REGISTRY_PASSWORD` に Docker Hub トークンを設定（`export KAMAL_REGISTRY_PASSWORD=...`）
2. `be/config/master.key` が存在することを確認（`bin/rails credentials:edit` で生成可能）
3. 初回セットアップ: `be/` ディレクトリで `bin/kamal setup`
4. 以降のデプロイ: `bin/kamal deploy`

### フロントエンド (Vercel)

1. Vercel にプロジェクトをインポート（ルートディレクトリ: `fe/`）
2. 環境変数 `API_BASE_URL` に BE の本番 URL を設定（例: `https://rails-nextjs-todo.tom-chiba.com`）
3. `main` ブランチへの push で自動デプロイ
