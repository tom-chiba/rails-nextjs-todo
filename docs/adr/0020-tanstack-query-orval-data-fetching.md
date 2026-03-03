---
status: "accepted"
date: 2026-03-02
decision-makers: []
---

# ADR-0020: TanStack Query + Orval によるデータ取得レイヤーの刷新

## コンテキストと課題

フロントエンドのデータ取得は手書きの API クライアント (`app/api/todos.ts`, `app/api/auth.ts`) と `useState`/`useEffect` による手動管理で構成されていた。この構成には以下の問題があった:

1. **N+1 API コール**: `useAuth()` が複数コンポーネントから呼ばれると、同一エンドポイントへのリクエストが重複して発行される
2. **型の手動同期**: ADR-0011 で openapi-typescript による型生成を導入したが、API クライアント関数自体は手書きのままで、エンドポイント変更時にクライアントコードの手動更新が必要
3. **楽観的更新の未実装**: Todo の toggle/delete 操作でサーバー応答を待ってから UI を更新するため、操作感が遅い
4. **エラー・ローディング状態の管理が散在**: 各コンポーネントで個別に `useState` で管理しており、パターンが統一されていない

型生成だけでなく、API クライアント関数と TanStack Query hooks の自動生成まで含めた包括的なソリューションが必要になった。

## 検討した選択肢

### 選択肢1: openapi-typescript + 手書きクライアント維持（現状）

型のみ自動生成し、API 呼び出しコードは手書きで管理し続ける。キャッシュや楽観的更新は自前で実装する。

- 良い点: 追加の依存なし、既存コードの変更不要
- 悪い点: N+1 問題・楽観的更新の自前実装コストが高い、エンドポイント追加ごとに手動コードが増える

### 選択肢2: openapi-fetch + TanStack Query を手動統合

openapi-typescript のエコシステム内の `openapi-fetch` で型安全なクライアントを生成し、TanStack Query は手動で統合する。

- 良い点: 型安全な fetch ラッパーが得られる、openapi-typescript からの段階的移行が可能
- 悪い点: TanStack Query hooks は手書きが必要、hooks の定義がボイラープレートになる

### 選択肢3: Orval + TanStack Query

Orval で OpenAPI スキーマから TanStack Query hooks・API 関数・TypeScript 型をまとめて自動生成する。

- 良い点: hooks まで含めた完全な自動生成、楽観的更新パターンとの統合が容易、エンドポイント追加時にコマンド1つで対応
- 悪い点: 生成コードが大きい、Orval のカスタム fetch 規約に合わせる必要がある、openapi-typescript の完全な置き換えが必要

## 決定

**選択肢3: Orval + TanStack Query** を採用する。

手書きの API クライアント・型定義を全面的に Orval 生成コードに置き換え、TanStack Query でキャッシュ・重複排除・楽観的更新を管理する。

### 実装方針

#### コード生成

- **Orval 設定**: `fe/orval.config.ts` で split mode + react-query client + fetch httpClient を指定
- **生成先**: `app/generated/api-client/` (hooks・関数) + `app/generated/models/` (型)
- **ファサード**: `app/types.ts` が models を再エクスポート（既存のインポートパスを維持）
- **生成コマンド**: `npm run generate:api`

#### カスタム fetch

- `app/lib/api-client.ts` の `customFetch` が全 API リクエストの基盤
- `credentials: "include"`, ベース URL 解決, エラーパース (`ApiError`) を担当
- **重要**: Orval が期待する `{ data, status, headers }` ラッパー形式で返却する必要がある（`res.json()` の生データをそのまま返すと `selectData` が常に `undefined` を返す不具合になる — PR #76 で修正）

#### TanStack Query 構成

- `app/providers.tsx` で `QueryClientProvider` を配置
- `QueryCache.onError` + `MutationCache.onError` で 401 → `/login` リダイレクトを一元管理
- `meta.skipRedirectOn401` でリダイレクト抑制可能（認証ページ用）
- `staleTime: 60s`, `retry: false`, `refetchOnWindowFocus: false`

#### 楽観的更新

- `useTodosMutation` hooks に toggle/delete/clearCompleted の楽観的更新パターンを集約
- `cancelQueries` → `setQueryData` → `onError` rollback → `onSettled` invalidate

#### 削除されたコード

- `app/api/todos.ts`, `app/api/auth.ts` — Orval 生成コードに置き換え
- `app/generated/api.ts` — openapi-typescript 出力ファイル
- `openapi-typescript` devDependency

## 結果

### 良い影響

- `useAuth()` の N+1 API コール問題が TanStack Query の自動重複排除で解決
- Todo 操作の楽観的更新により即座に UI が反映される
- API エンドポイント追加時に `npm run generate:api` でクライアントコードが自動生成される
- 401 リダイレクトが QueryCache/MutationCache で一元管理され、各コンポーネントでの個別処理が不要に
- ミューテーションエラーのインライン表示を統一的に実装

### 悪い影響

- Orval + TanStack Query への依存追加（ランタイム + devDependency）
- 生成コードが大きく、`app/generated/api-client/` のファイルサイズが増加
- Orval のカスタム fetch 規約（`{ data, status, headers }` 形式）への準拠が必要で、規約を誤ると全機能が壊れるリスクがある（PR #76 参照）
- API スキーマ変更時に `npm run generate:api` の手動実行が必要

## 補足

- **置き換え**: ADR-0011（openapi-typescript による型自動生成）を置き換える
- 前提: ADR-0010（rswag による OpenAPI スキーマ生成）、ADR-0014（CORS 直接通信）
- 関連 PR: #74（導入）、#76（customFetch ラッパー形式の修正）
- 関連 Issue: #59、#75
- Orval: https://orval.dev/
- TanStack Query: https://tanstack.com/query/latest
