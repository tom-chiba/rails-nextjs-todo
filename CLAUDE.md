# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## プロジェクト概要

Rails 8.1 APIバックエンド (`be/`) と Next.js 16 フロントエンド (`fe/`) のモノレポ構成。Todoアプリケーションで、devcontainer上で動作する。

## アーキテクチャ

- **be/**: Rails 8.1.2 API-onlyアプリ (Ruby 4.0.1, SQLite3, RSpec, FactoryBot)
- **fe/**: Next.js 16.1.6アプリ (React 19, TypeScript, Tailwind CSS v4, Biome)
- フロントエンドとバックエンドは独立したアプリケーション（共有コードなし）
- バックエンドはJSON APIを提供し、フロントエンドがそれを利用する
- devcontainerが `.devcontainer/compose.yaml` で両サービスをオーケストレーション

## バックエンドコマンド (`be/` ディレクトリで実行)

```bash
# セットアップ
bin/setup                          # 開発環境の初期化

# 開発
bin/rails server                   # Railsサーバー起動 (ポート3000)
bin/dev                            # Pumaで開発サーバー起動

# データベース
bin/rails db:migrate               # マイグレーション実行
bin/rails db:test:prepare           # テスト用DB準備
bin/rails db:seed                   # シードデータ投入

# テスト (RSpec)
bin/rspec                          # 全スペック実行
bin/rspec spec/models              # モデルスペックのみ実行
bin/rspec spec/models/todo_spec.rb             # 単一ファイルのスペック実行
bin/rspec spec/models/todo_spec.rb:10          # 特定行のスペック実行

# OpenAPI (rswag)
bin/rake rswag:specs:swaggerize    # swagger.yaml 生成

# Lint・セキュリティ
bin/rubocop                        # RuboCop実行 (rubocop-rails-omakaseスタイル)
bin/rubocop -a                     # 自動修正
bin/brakeman                       # セキュリティ脆弱性スキャナー
bin/bundler-audit                  # Gem脆弱性監査

# CI (全チェック一括実行)
bin/ci                             # ローカルCI: rubocop, brakeman, bundler-audit, tests
```

## フロントエンドコマンド (`fe/` ディレクトリで実行)

```bash
npm run dev                        # 開発サーバー起動 (ポート3001)
npm run build                      # プロダクションビルド
npm test                           # テスト実行 (Vitest)
npm run test:watch                 # テスト監視モード (開発中)
npm run lint                       # Biomeチェック (lint)
npm run format                     # Biomeフォーマット (自動修正)
npm run typecheck                  # TypeScript型チェック (tsc --noEmit)
```

## バックエンド注意事項

- **binstub優先**: `bundle exec` ではなく `bin/` 経由でコマンドを実行すること（例: `bin/rspec`, `bin/rake`, `bin/rubocop`）

## バックエンド重要事項

- **API-only**: `ApplicationController` は `ActionController::API` を継承
- **データベース**: 全環境でSQLite3を使用。本番環境ではcache・queue・cable用に個別のSQLiteファイル (Solid Cache, Solid Queue, Solid Cable)
- **Lintスタイル**: `rubocop-rails-omakase` — Rails公式の規約スタイル
- **テスト**: RSpec + FactoryBot。スペックは `spec/` 配下。ファクトリは `spec/factories/`
- **CORS**: Rack::Cors gemで `config/initializers/cors.rb` に設定。`CORS_ALLOWED_ORIGINS` 環境変数が必要
- **環境変数**: `dotenv-rails` で `be/.env` を自動読み込み（development/test環境）
- **OpenAPI**: rswagでrequest specからswagger.yaml を自動生成。Swagger UI は `/api-docs` で閲覧可能。swagger.yamlはgit管理
- **デプロイ**: KamalによるDockerデプロイ、Thrusterによる HTTP高速化

## フロントエンド重要事項

- **App Router**: Next.js App Router (`app/` ディレクトリ)
- **React Compiler**: `next.config.ts` で有効化済み（自動最適化）
- **スタイリング**: Tailwind CSS v4 (`@tailwindcss/postcss` 経由)、テーマ変数は `app/globals.css` で定義
- **フォント**: Geist Sans / Geist Mono (`next/font/google` 経由)
- **Linter/Formatter**: Biome 2.2（ESLintではない）、Next.js・React推奨ルール適用済み
- **パスエイリアス**: `@/*` はプロジェクトルート (`./`) にマッピング
- **TypeScript**: strictモード有効

## CI (GitHub Actions)

バックエンドCI (`be/.github/workflows/ci.yml`) は3つの並列ジョブで構成:
1. **セキュリティ**: Brakeman + Bundler Audit
2. **Lint**: RuboCop
3. **テスト**: `bin/rails db:test:prepare && bin/rspec`
