# CLAUDE.md

## 開発ルール

- **binstub優先**: BE では `bundle exec` ではなく `bin/` 経由でコマンドを実行すること
- **swagger.yaml はgit管理**: BE の API スキーマ変更後は `bin/rake rswag:specs:swaggerize` で再生成してコミット
- **API変更時のFE同期**: BE の swagger.yaml 変更後、`fe/` で `npm run generate:api` を実行して型・hooksを再生成
- **型のインポート元**: 生成された型は `app/generated/models/` から直接使わず `app/types.ts` 経由で使う
- **401エラー処理**: 個別コンポーネントではなく `QueryCache.onError` で一元管理。各所にリダイレクトロジックを書かない

## ブランチ戦略

- **GitHub Flow**: `main` から feature ブランチを切り、PR 経由でマージ

## デプロイ

- **BE**: Kamal → KAGOYA VPS (Docker Hub レジストリ, Let's Encrypt SSL via Thruster)。ドメイン: `rails-nextjs-todo.api.tom-chiba.com`
- **FE**: Vercel。`NEXT_PUBLIC_API_BASE_URL` で BE の本番URLを指定

## 環境変数

| 変数 | 用途 | デフォルト |
|---|---|---|
| `CORS_ORIGINS` (BE) | CORS許可オリジン | `http://localhost:3001` |
| `NEXT_PUBLIC_API_BASE_URL` (FE) | BE の URL | `http://localhost:3000` |
