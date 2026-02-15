---
status: "accepted"
date: 2026-02-15
decision-makers: []
---

# ADR-0014: rewrites プロキシ方式から CORS 直接通信方式への移行

## コンテキストと課題

ADR-0013 で決定したデプロイ構成では、Next.js の `rewrites` で `/api/*` リクエストを Rails バックエンドにプロキシ転送していた。FE と BE にそれぞれ独自ドメインを割り当てる構成に変更するにあたり、API 通信方式を見直す必要が生じた。

## 検討した選択肢

### 選択肢1: rewrites プロキシ方式（現状維持）

Next.js サーバーがすべての API リクエストを中継する。ブラウザからは同一オリジンに見える。

- 良い点: CORS 設定が不要、ブラウザから見てシンプル
- 悪い点: Vercel のサーバーレス関数帯域を消費、API レスポンスにレイテンシ加算、プロキシの暗黙的挙動がデバッグを困難にする

### 選択肢2: CORS 直接通信方式

FE からBE に直接リクエストを送信する。`rack-cors` gem で FE ドメインからのクロスオリジンリクエストを許可する。

- 良い点: API レスポンスのレイテンシ低減、Vercel 帯域を消費しない、通信経路が透明でデバッグしやすい
- 悪い点: CORS 設定の管理が必要、プリフライトリクエスト（OPTIONS）が発生する

## 決定

**選択肢2: CORS 直接通信方式** を採用する。

プロキシ経由の暗黙的な挙動を排除し、通信経路を透明にすることで運用とデバッグを容易にする。Vercel のサーバーレス帯域を節約し、API レイテンシを低減する。

### 具体的な構成

- **BE ドメイン**: `rails-nextjs-todo.api.tom-chiba.com` (ConoHa VPS)
- **FE ドメイン**: `rails-nextjs-todo.tom-chiba.com` (Vercel)
- **CORS 設定**: `rack-cors` gem、`config/initializers/cors.rb`
  - 許可オリジン: 環境変数 `CORS_ORIGINS`（デフォルト: `http://localhost:3001`）
  - 本番: `https://rails-nextjs-todo.tom-chiba.com`
  - プリフライトキャッシュ: `Access-Control-Max-Age: 3600`
- **FE API クライアント**: 環境変数 `NEXT_PUBLIC_API_BASE_URL` で BE の絶対 URL を指定（デフォルト: `http://localhost:3000`）
- **next.config.ts**: `rewrites` 設定を削除

## 結果

### 良い影響

- API レスポンスのレイテンシが低減する（Vercel サーバー経由のホップがなくなる）
- Vercel のサーバーレス関数帯域を消費しない
- 通信経路が透明でデバッグしやすい
- FE と BE のドメインが明確に分離される

### 悪い影響

- CORS 設定の管理が必要（許可オリジンの環境変数管理）
- ブラウザから初回リクエスト時にプリフライトリクエスト（OPTIONS）が発生する（`max_age: 3600` でキャッシュにより軽減）

## 補足

- 前提: ADR-0013（ConoHa VPS + Vercel デプロイ構成）
- ADR-0013 の API 接続方式に関する記述はこの ADR により置き換わる
- DNS に `rails-nextjs-todo.api.tom-chiba.com` の A レコード追加が必要
