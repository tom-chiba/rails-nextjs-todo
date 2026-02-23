---
status: "accepted"
date: 2026-02-22
decision-makers: []
---

# ADR-0016: API-only 構成でのセッション（Cookie）ベース認証

## コンテキストと課題

API-only の Rails アプリケーションでは JWT トークン認証が一般的な選択肢だが、ADR-0015 で採用した Rails 8 Authentication Generator はセッション（Cookie）ベースの認証を生成する。API-only 構成で Cookie セッションを採用するか、JWT に切り替えるかを決定する必要があった。

また、ADR-0014 で決定した CORS 直接通信方式（FE と BE が異なるドメイン）との組み合わせで、Cookie の送受信にクロスオリジン対応が必要になることも考慮事項だった。

## 検討した選択肢

### 選択肢1: JWT トークン認証

`Authorization: Bearer <token>` ヘッダーでトークンを送受信する。Rails 8 Auth Generator の生成コードを JWT ベースに書き換える。

- 良い点: ステートレスでスケーラブル、CORS 環境で Cookie の扱いを気にしなくてよい、モバイルアプリ等との互換性が高い
- 悪い点: トークンの無効化にブラックリスト管理（サーバーサイド状態）が必要、リフレッシュトークンのフロー実装が追加で必要、Rails 8 Auth Generator の生成コードを大幅に改変する必要がある、XSS でトークンが漏洩するリスク（localStorage 保存の場合）

### 選択肢2: Cookie セッション認証

Rails 8 Auth Generator が生成するセッション管理をそのまま活用する。`session_id` を `httpOnly` Cookie で管理し、CORS 設定で `credentials: true` を有効化して Cookie を送受信する。

- 良い点: Rails 8 Auth Generator のコードをそのまま活用できる、`httpOnly` Cookie により XSS でのトークン漏洩リスクが低い、セッションの即時無効化が容易（サーバーサイドで Session レコードを削除するだけ）
- 悪い点: CORS + `credentials: true` の設定が必要、クロスサイト Cookie の制約（SameSite 属性、サブドメイン間共有）に注意が必要、モバイルアプリとの互換性で追加考慮が必要

## 決定

**選択肢2: Cookie セッション認証** を採用する。

Rails 8 Authentication Generator が生成するセッション管理をそのまま活用することで、実装の改変を最小限に抑える。`httpOnly` Cookie によりクライアント側の JavaScript からセッション情報にアクセスできないため、XSS 攻撃に対するセキュリティが高い。

### 具体的な構成

- **Cookie**: `session_id` を `httpOnly`, `permanent`, `same_site: :lax` で設定
- **CORS**: `rack-cors` の `credentials: true` で Cookie の送受信を許可（ADR-0014）
- **FE API クライアント**: 全リクエストに `credentials: "include"` を付与
- **セッション管理**: `Session` モデルで DB 管理、即時無効化可能

## 結果

### 良い影響

- Rails 8 Auth Generator のコードを最小限の改変で利用でき、実装コストが低い
- `httpOnly` Cookie により XSS 攻撃からの保護が強い
- セッションの即時無効化が DB 操作（Session レコード削除）だけで実現できる

### 悪い影響

- CORS 環境での Cookie 送受信に `credentials: true` / `credentials: "include"` の設定が FE・BE 両方で必要
- 本番環境でのクロスサイト Cookie に起因する問題が発生した（ADR-0018 で対応）

## 補足

- 前提: ADR-0014（CORS 直接通信方式）、ADR-0015（Rails 8 Authentication Generator）
- 関連 Issue: #37, #39, #40, #44
