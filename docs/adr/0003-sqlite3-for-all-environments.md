---
status: accepted
date: 2026-02-07
decision-makers: []
---

# ADR-0003: 全環境でSQLite3を使用

## コンテキストと課題

Rails 8.1アプリケーションのデータベースを選定する必要があった。Rails学習が主目的のプロジェクトであるため、まずは一番シンプルな構成から始め、必要に応じて後から変更する方針とした。

## 検討した選択肢

### 選択肢1: 全環境SQLite3

開発・テスト・本番すべてでSQLite3を使用する。本番環境ではprimary、cache、queue、cableの各用途で個別のSQLiteファイルを使用する。

- 良い点: 外部データベースサーバー不要、環境差異ゼロ、運用・デプロイがシンプル、Rails 8 Solid trifectaとの完全な互換性
- 悪い点: 書き込み並行性に制約、水平スケーリングが困難

### 選択肢2: 本番PostgreSQL・開発SQLite3

開発・テストではSQLite3、本番ではPostgreSQLを使用する。

- 良い点: 本番環境で高い並行性・スケーラビリティ
- 悪い点: 環境差異によるバグの可能性、本番でのDB管理・運用が必要

### 選択肢3: 全環境PostgreSQL

全環境でPostgreSQLを使用する。

- 良い点: 環境差異なし、本番レベルの機能をすべての環境で利用可能
- 悪い点: 開発環境でもPostgreSQLの起動・管理が必要、devcontainerの構成が複雑化

## 決定

**選択肢1: 全環境SQLite3** を採用する。

学習プロジェクトとして、まずは最もシンプルな構成で始めることを優先した。SQLite3は外部サービスが不要で環境構築の手間が最小限であり、Rails学習そのものに集中できる。Rails 8のSolid trifecta（Solid Cache、Solid Queue、Solid Cable）もSQLiteをネイティブサポートしているため、追加の依存なく利用可能。スケーラビリティが必要になった段階でPostgreSQLへの移行を検討すればよい。

## 結果

### 良い影響

- Redis、PostgreSQL等の外部サービスへの依存がゼロ
- 全環境で同一のデータベースエンジンを使用するため、環境差異によるバグが発生しない
- Dockerボリュームにストレージディレクトリをマウントするだけでデータ永続化が完了
- devcontainerのセットアップが簡素

### 悪い影響

- 高い書き込み並行性が必要になった場合、PostgreSQL等への移行が必要
- 水平スケーリング（複数インスタンス）が困難

## 補足

- 本番データベース構成（`config/database.yml`）:
  - `storage/production.sqlite3` — プライマリ
  - `storage/production_cache.sqlite3` — Solid Cache
  - `storage/production_queue.sqlite3` — Solid Queue
  - `storage/production_cable.sqlite3` — Solid Cable
- デプロイ: Kamalの永続Dockerボリュームで`storage/`ディレクトリを保持
- 関連ADR: [ADR-0002](0002-rails-api-nextjs-tech-stack.md)
