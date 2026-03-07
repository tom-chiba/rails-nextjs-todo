---
status: "accepted"
date: 2026-03-07
decision-makers: []
---

# ADR-0021: Active Storage による Todo 画像ストレージ

## コンテキストと課題

Issue #7 で Todo に画像を付与する機能を追加する。画像の保存先と管理方法を決定する必要がある。

現在の状況:
- Rails 8.1 の Active Storage が設定済み（`config/storage.yml` に local / test サービス定義あり）
- `image_processing` gem が Gemfile に含まれている
- 本番環境は Kamal + Docker で KAGOYA VPS にデプロイ（ADR-0013）
- 全環境で SQLite3 を使用（ADR-0003）

## 検討した選択肢

### 選択肢1: Active Storage (Disk サービス)

Rails 標準のファイル管理機構。`has_one_attached :image` でモデルに宣言するだけでアップロード・削除・URL 生成が得られる。ストレージバックエンドは設定で切り替え可能。

- 良い点: Rails 標準で追加 gem 不要、設定済みですぐ使える、`image_processing` によるバリアント（サムネイル）生成が容易、ストレージバックエンドの差し替えが `config/storage.yml` の変更だけで可能
- 悪い点: Disk サービスはサーバーローカルに保存するためスケールアウトに不向き、Active Storage のテーブル（blobs, attachments, variant_records）のマイグレーションが必要

### 選択肢2: 外部オブジェクトストレージ (S3 / GCS) 直接利用

Active Storage を経由せず、AWS SDK 等で直接 S3 にアップロード・管理する。

- 良い点: スケーラビリティが高い、CDN 配信が容易
- 悪い点: 追加 gem・インフラ設定が必要、認証情報管理が増える、Todo アプリの規模に対してオーバーエンジニアリング

## 決定

**選択肢1: Active Storage (Disk サービス)** を採用する。

Rails 標準機能であり既にプロジェクトに設定済みのため、最小の変更で導入できる。Todo アプリの規模では Disk サービスで十分であり、将来的にストレージバックエンドの切り替えも容易。

### 実装方針

- `Todo` モデルに `has_one_attached :image` を宣言（1 Todo = 1 画像）
- バリデーション: 許可形式は JPEG / PNG / GIF / WebP、最大 5MB
- `Todo#image_url` メソッドで Active Storage の URL を返却
- `Todo#as_json` をオーバーライドして `image_url` をレスポンスに含める
- Active Storage テーブルのマイグレーションを追加

## 結果

### 良い影響

- 追加 gem なしで画像管理が実現できた
- `has_one_attached` の宣言的な API によりモデル層のコードがシンプル
- `image_processing` gem でサムネイルバリアント生成が可能

### 悪い影響

- Active Storage のテーブル（3テーブル）が追加され、SQLite3 のスキーマが増加
- Disk サービスはサーバーローカル保存のため、複数サーバー構成への拡張には追加対応が必要

## 補足

- 前提: ADR-0003（全環境 SQLite3）、ADR-0013（Kamal デプロイ）
- 関連: ADR-0022（画像 API エンドポイント設計）
- 関連 Issue: #7

### 将来の拡張パス

- **外部ストレージへの移行**: `config/storage.yml` に S3 / GCS サービスを追加し、`config/environments/production.rb` の `config.active_storage.service` を切り替えるだけで移行可能。アプリケーションコードの変更は不要
- **複数画像対応**: `has_one_attached :image` を `has_many_attached :images` に変更し、コントローラとフロントエンドを対応させる。Active Storage の API は同じパターンなので移行コストは低い
- **CDN 配信**: Active Storage は `config.active_storage.resolve_model_to_route = :cdn` で CDN URL 生成に対応。ストレージを S3 等に移行した上で CloudFront 等を前段に配置する
