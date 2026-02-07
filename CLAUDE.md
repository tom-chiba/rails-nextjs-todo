# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## プロジェクト概要

Rails 8.1 APIバックエンド (`be/`) と Next.js 16 フロントエンド (`fe/`) のモノレポ構成。Todoアプリケーションで、devcontainer上で動作する。

## アーキテクチャ

- **be/**: Rails 8.1.2 API-onlyアプリ (Ruby 4.0.1, SQLite3, Minitest)
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

# テスト
bin/rails test                     # 全テスト実行
bin/rails test test/models         # モデルテストのみ実行
bin/rails test test/models/user_test.rb        # 単一ファイルのテスト実行
bin/rails test test/models/user_test.rb:10     # 特定行のテスト実行

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
npm run dev                        # 開発サーバー起動 (ポート3000)
npm run build                      # プロダクションビルド
npm test                           # テスト実行 (Vitest)
npm run test:watch                 # テスト監視モード (開発中)
npm run lint                       # Biomeチェック (lint)
npm run format                     # Biomeフォーマット (自動修正)
npm run typecheck                  # TypeScript型チェック (tsc --noEmit)
```

## バックエンド重要事項

- **API-only**: `ApplicationController` は `ActionController::API` を継承
- **データベース**: 全環境でSQLite3を使用。本番環境ではcache・queue・cable用に個別のSQLiteファイル (Solid Cache, Solid Queue, Solid Cable)
- **Lintスタイル**: `rubocop-rails-omakase` — Rails公式の規約スタイル
- **CORS**: Rack::Cors gemは利用可能だが `config/initializers/cors.rb` でコメントアウト中。フロントエンド接続時に有効化が必要
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
3. **テスト**: `bin/rails db:test:prepare test`
