---
status: "accepted"
date: 2026-02-08
decision-makers: []
---

# ADR-0010: rswag によるコードファースト OpenAPI スキーマ生成

## コンテキストと課題

Todo API のドキュメントを整備する必要がある。API 仕様を正確に記述し、フロントエンド開発者やレビュアーが参照できる形で管理したい。OpenAPI スキーマの定義方法として、コードファースト（実装から生成）とデザインファースト（仕様を先に書く）の2つのアプローチがある。

また、生成した OpenAPI YAML の管理方法と、既存の振る舞いテストとの関係も決定する必要がある。

## 検討した選択肢

### 選択肢1: デザインファースト（手書き OpenAPI + committee）

OpenAPI YAML を手動で記述し、committee gem でリクエスト/レスポンスのバリデーションを行う。

- 良い点: API 設計を先行して議論できる、実装に依存しない
- 悪い点: 仕様と実装の乖離リスク、YAML の手動メンテナンスコスト

### 選択肢2: コードファースト（rswag）

RSpec request spec から OpenAPI スキーマを自動生成する。

- 良い点: テストと仕様が常に同期、RSpec DSL で記述できる、Swagger UI で即座に閲覧可能
- 悪い点: rswag への依存、RSpec が前提（ADR-0008 で対応済み）

## 決定

**選択肢2: コードファースト（rswag）** を採用する。

テストと API 仕様の同期が自動的に保証される点が最大の利点。小規模プロジェクトにおいて手書き OpenAPI のメンテナンスコストは見合わない。RSpec への移行は ADR-0008 で完了済み。

### 補足的な方針

- **既存 spec と rswag spec の分離**: 既存の `todos_spec.rb` は振る舞いテスト、`todos_swagger_spec.rb` は API ドキュメント生成用として役割を分離する。振る舞いテストに rswag DSL を混在させると可読性が低下するため
- **swagger.yaml の git 管理**: 生成物だが PR レビュー時に API 変更を diff で確認可能にするため、バージョン管理に含める

## 結果

### 良い影響

- API 仕様が常にテスト済みのコードと同期する
- Swagger UI (`/api-docs`) で API ドキュメントを即座に閲覧可能
- PR レビューで swagger.yaml の diff から API 変更を確認できる

### 悪い影響

- rswag gem（rswag-api, rswag-ui, rswag-specs）への依存が追加される
- 振る舞いテストと rswag spec の2つのファイルでエンドポイントを記述する重複がある

## 補足

- 前提: ADR-0008（RSpec + FactoryBot 採用）
- 関連Issue: #4（rswag 導入）
- rswag: https://github.com/rswag/rswag
