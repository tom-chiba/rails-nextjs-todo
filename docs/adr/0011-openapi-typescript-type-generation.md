---
status: "accepted"
date: 2026-02-08
decision-makers: []
---

# ADR-0011: openapi-typescript による TypeScript 型自動生成

## コンテキストと課題

フロントエンド (`fe/`) の API 型定義 (`app/types.ts`) は手書きで管理されている。バックエンドの rswag が生成する OpenAPI スキーマ (`be/swagger/v1/swagger.yaml`) が正式な API 仕様として存在するが（ADR-0010）、フロントエンドの型はそれと独立して定義されているため、API 変更時に型がずれるリスクがある。

OpenAPI スキーマからフロントエンドの TypeScript 型を自動生成し、API 仕様と型定義の同期を保証する仕組みが必要。

## 検討した選択肢

### 選択肢1: 手書き型を維持（現状）

`app/types.ts` に型を手動で定義し続ける。

- 良い点: 追加の依存なし、シンプル
- 悪い点: API 変更時に型の更新忘れが発生するリスク、スキーマとの同期保証なし

### 選択肢2: openapi-typescript で型のみ生成

`openapi-typescript` で OpenAPI スキーマから TypeScript の型定義のみを生成する。

- 良い点: 軽量（型のみ生成、ランタイムコストゼロ）、OpenAPI 3.x 対応、活発なメンテナンス
- 悪い点: devDependency の追加、生成コマンドの手動実行が必要

### 選択肢3: openapi-fetch / hey-api でフルクライアント生成

API クライアント（fetch ラッパー含む）ごと自動生成する。

- 良い点: 型安全な API 呼び出しが可能、エンドポイントの変更も自動追従
- 悪い点: 過剰な生成物、既存の API 呼び出しコード（`app/api/todos.ts`）の全面書き換えが必要、ランタイム依存が増加

## 決定

**選択肢2: openapi-typescript で型のみ生成** を採用する。

現時点では型の同期のみが課題であり、API クライアントの生成は不要。`openapi-typescript` は型定義のみを生成するため軽量で、ランタイムに影響を与えない。将来的に API クライアント生成が必要になった場合は `openapi-fetch` への段階的移行が可能（同じエコシステム）。

### 実装方針

- **生成先**: `fe/app/generated/api.ts` — 機械生成であることが明確なディレクトリに配置
- **ファサードパターン**: `fe/app/types.ts` で `components["schemas"]["Todo"]` を `Todo` として再エクスポート。既存のインポートパスを維持し、影響範囲を最小化
- **git 管理**: 生成ファイルをバージョン管理に含める（ADR-0010 の swagger.yaml と同じ方針。PR diff で型変更を確認可能）
- **Biome 除外**: `app/generated/` を Biome の対象外に設定

## 結果

### 良い影響

- OpenAPI スキーマと TypeScript 型が常に同期可能
- PR レビューで API 型の変更を diff で確認できる
- ファサードパターンにより既存コードへの影響ゼロ

### 悪い影響

- `openapi-typescript` への devDependency 追加
- API スキーマ変更時に `npm run generate:types` の手動実行が必要

## 補足

- 前提: ADR-0010（rswag による OpenAPI スキーマ生成）
- 関連 Issue: #5（OpenAPI からの TypeScript 型自動生成）
- openapi-typescript: https://openapi-ts.dev/
