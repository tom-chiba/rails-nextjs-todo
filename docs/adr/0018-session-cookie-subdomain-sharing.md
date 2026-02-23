---
status: "accepted"
date: 2026-02-23
decision-makers: []
---

# ADR-0018: セッション Cookie のサブドメイン間共有

## コンテキストと課題

本番環境では FE（`rails-nextjs-todo.tom-chiba.com` / Vercel）と BE（`rails-nextjs-todo.api.tom-chiba.com` / KAGOYA VPS）が異なるサブドメインで運用されている。ログイン後にメイン画面に遷移できない問題が発生した。

根本原因は、Rails API が `domain` 指定なしで `session_id` Cookie を設定していたため、Cookie のスコープが API ドメイン（`rails-nextjs-todo.api.tom-chiba.com`）のみに限定されていたこと。Next.js middleware（Vercel 側の `rails-nextjs-todo.tom-chiba.com`）からは `session_id` Cookie が見えず、未認証と判定されて `/login` にリダイレクトされていた。

開発環境（`localhost:3000` / `localhost:3001`）では同一ドメイン（`localhost`）のため問題が顕在化しておらず、本番デプロイ後に初めて発覚した。

## 検討した選択肢

### 選択肢1: SESSION_COOKIE_DOMAIN でサブドメイン間 Cookie 共有

Cookie の `domain` 属性に `.tom-chiba.com`（先頭ドット付き）を設定し、同一ルートドメイン配下の全サブドメインで Cookie を共有可能にする。環境変数 `SESSION_COOKIE_DOMAIN` で制御する。

- 良い点: 既存のアーキテクチャ（CORS 直接通信 + Cookie セッション）を維持できる、実装変更が最小限（Cookie オプションの追加のみ）、開発環境は環境変数未設定で既存動作を維持
- 悪い点: ルートドメイン配下の全サブドメインに Cookie が送信される（スコープが広がる）、Cookie の `secure: true` フラグが本番のみ必要（環境差異）

### 選択肢2: Next.js middleware の認証チェックを廃止

middleware での Cookie ベースの認証チェックをやめ、クライアントサイドのみで認証状態を管理する。`/me` API コールの結果（401）で未認証を判定しリダイレクトする。

- 良い点: クロスサイト Cookie の問題を根本回避、middleware の複雑性が減る
- 悪い点: 未認証ユーザーがページの HTML を一瞬受信する（フラッシュ）、CSR のみに依存するため SEO / パフォーマンスに不利、middleware による事前リダイレクトの保護がなくなる

### 選択肢3: rewrites プロキシ方式に戻す

ADR-0014 で廃止した Next.js `rewrites` プロキシを復活させ、FE と BE を同一オリジンに見せる。

- 良い点: クロスサイト Cookie の問題が根本的に解消（同一オリジン）
- 悪い点: ADR-0014 で挙げたデメリット（レイテンシ、Vercel 帯域消費、デバッグ困難）が再発する、過去の意思決定を覆すことになる

## 決定

**選択肢1: SESSION_COOKIE_DOMAIN でサブドメイン間 Cookie 共有** を採用する。

既存のアーキテクチャを維持しつつ、最小限の変更で問題を解消する。

### 具体的な構成

- **環境変数**: `SESSION_COOKIE_DOMAIN`（本番: `.tom-chiba.com`）
- **Cookie オプション**: 環境変数が設定されている場合、`domain` と `secure: true` を Cookie に付与
- **開発環境**: 環境変数未設定のため既存動作（`localhost` スコープ）に影響なし
- **対象ファイル**: `be/app/controllers/concerns/authentication.rb`（`session_cookie_options` メソッド追加）、`be/config/deploy.yml`

## 結果

### 良い影響

- 本番環境でログイン後のメイン画面遷移が正常に動作するようになった
- CORS 直接通信方式（ADR-0014）のアーキテクチャを維持できた
- 開発環境への影響がない（環境変数未設定時はデフォルト動作）

### 悪い影響

- Cookie のスコープが `.tom-chiba.com` 配下の全サブドメインに広がる（将来、同一ドメイン下に別サービスを配置した場合に Cookie が不要に送信される可能性）
- 開発環境と本番環境で Cookie の挙動に差異がある（domain / secure フラグの有無）

## 補足

- 前提: ADR-0014（CORS 直接通信方式）、ADR-0016（Cookie セッション認証）
- 関連 PR: #61
- 開発環境では `localhost` が共通ドメインとなるため問題が顕在化せず、本番デプロイ後に初めて発覚したケース
