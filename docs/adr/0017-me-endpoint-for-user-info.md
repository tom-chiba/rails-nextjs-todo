---
status: "accepted"
date: 2026-02-23
decision-makers: []
---

# ADR-0017: ユーザー情報取得を /me エンドポイントに統一

## コンテキストと課題

Issue #44 の初期実装では、ログイン/登録時の API レスポンスから取得した `email_address` をクライアント側の Cookie（`user_email`）に保存し、ヘッダーのユーザー情報表示に使用していた。この方式には以下の問題が指摘された:

- **Cookie の二重管理**: 認証用 `session_id`（httpOnly）と表示用 `user_email`（JS アクセス可能）の 2 つを手動管理
- **データの陳腐化**: ログイン時に 1 回だけ設定し、以降サーバーと同期しない
- **拡張性の制限**: ユーザー名やアバターなど新しいフィールドを追加するたびに Cookie の管理が必要
- **不要な Cookie 露出**: `user_email` が httpOnly でないため、XSS 時にメールアドレスが漏洩するリスク

## 検討した選択肢

### 選択肢1: Cookie 直接管理（初期実装の維持）

ログイン/登録時に `user_email` Cookie を JS アクセス可能な Cookie として設定し、`useSyncExternalStore` でリアクティブに読み取る。

- 良い点: 追加の API コールが不要、オフラインでも表示可能
- 悪い点: セキュリティリスク（XSS で `user_email` 漏洩）、データ陳腐化、Cookie の二重管理、新フィールド追加のたびに Cookie 管理が複雑化

### 選択肢2: /me エンドポイント

`GET /api/v1/me` を新設し、認証済みセッション（`Current.user`）からユーザー情報を返す。FE は `useAuth` フック内で `/me` を呼び出す。

- 良い点: サーバーサイドで常に最新のユーザー情報を取得、httpOnly Cookie 以外に個人情報を露出しない、新フィールドの追加が API レスポンスの拡張だけで完結
- 悪い点: ページロード時に API コールが必要（loading 状態の管理が必要）、`useAuth()` を複数コンポーネントで使用すると N+1 API コールが発生する可能性（Issue #59）

### 選択肢3: セッション Cookie にユーザー情報を暗号化して格納

Rails の `signed` / `encrypted` Cookie にユーザー情報をまとめて格納する。

- 良い点: API コール不要、サーバーサイドで暗号化されるため安全
- 悪い点: Cookie サイズ制限（4KB）の制約、FE から直接復号できない（SSR が必要）、本プロジェクトの構成（FE: Vercel, BE: 別ドメイン）では非実用的

## 決定

**選択肢2: /me エンドポイント** を採用する。

サーバーサイドの `/me` エンドポイントからユーザー情報を取得する方式に統一し、`user_email` Cookie と関連する `auth-cookie.ts` を削除する。

### 具体的な構成

- **BE**: `GET /api/v1/me` → `{ id, email_address }`（`Current.user` から取得）
- **FE**: `useAuth` フック内で `getMe()` を呼び出し、`useState` + `useEffect` で管理
- **loading 状態**: `useAuth` に `loading` フラグを追加し、API レスポンス待ちのフラッシュを防止
- **削除**: `auth-cookie.ts`（`getUserEmail`, `setUserEmail`, `clearUserEmail`）

## 結果

### 良い影響

- httpOnly Cookie 以外に個人情報が露出しなくなり、XSS リスクが低減
- ユーザー情報が常にサーバーサイドの最新データと一致する
- 新しいユーザーフィールドの追加が API レスポンスの拡張だけで完結する
- `auth-cookie.ts` の削除によりコードが簡素化された

### 悪い影響

- ページロード時に `/me` API コールが必要（体感的なラグは軽微）
- `useAuth()` を複数コンポーネントで使用すると N+1 API コールが発生する（Issue #59 で追跡、SWR / React Context での対応を予定）

## 補足

- 前提: ADR-0016（Cookie セッション認証）
- 関連 Issue: #57, #44, #59
- PR #56 の申し送りコメントおよび PR #58 のレビュー指摘がきっかけ
