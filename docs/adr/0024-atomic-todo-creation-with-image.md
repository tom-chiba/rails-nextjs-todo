---
status: "accepted"
date: 2026-03-14
decision-makers: []
---

# ADR-0024: Todo作成と画像アップロードを1リクエストに統合

## コンテキストと課題

ADR-0022 で画像専用エンドポイント方式を採用し、Todo作成（JSON）と画像アップロード（multipart/form-data）を別リクエストで行う設計にした。しかし運用の中で以下の問題が顕在化した（Issue #81）:

1. Todo作成は成功したが画像アップロードが失敗するケースがあり、データの整合性が保てない
2. 2回のリクエストが必要なため、ネットワーク的に非効率
3. フロントエンド側で2つのリクエストの成功/失敗を個別にハンドリングする必要があり、コードが複雑

ADR-0022 では将来の拡張パスとして「専用の `POST /api/v1/todos/with_image` エンドポイントを追加する」方針を示していたが、既存エンドポイントの変更で十分対応可能と判断した。

## 検討した選択肢

### 選択肢1: 既存の `POST /api/v1/todos` を multipart/form-data に変更

既存エンドポイントの Content-Type を `multipart/form-data` に変更し、オプションの `image` フィールドを追加する。

- 良い点: エンドポイント数が増えない、フロントエンドの変更が最小限、1リクエストでアトミックにTodo+画像を作成できる
- 悪い点: 既存の JSON リクエストとの後方互換性が崩れる（クライアント側の変更が必要）

### 選択肢2: 新規 `POST /api/v1/todos/with_image` エンドポイントを追加

ADR-0022 で示された拡張パスに従い、専用エンドポイントを追加する。

- 良い点: 既存エンドポイントに影響なし、後方互換性を完全維持
- 悪い点: 類似機能のエンドポイントが2つになり、どちらを使うべきかの判断が必要、フロントエンドで使い分けロジックが必要

## 決定

**選択肢1: 既存エンドポイントを multipart/form-data に変更** を採用する。

このアプリはフロントエンドとバックエンドが密結合しており、外部APIとして公開していない。後方互換性の懸念よりも、シンプルさとアトミック性を優先する。ADR-0022 の `status` を `superseded` に変更する。

### 実装方針

#### バックエンド

- `TodosController#create` で `params[:image]` を受け取り、`@todo.image.attach` する
- 画像付きの場合、未保存レコードへの `attach` は `attachment_changes` に記録されるのみで、`save` 時にレコードと共にまとめて永続化される。save が失敗した場合は blob も永続化されないため、データの整合性が保証される（Active Storage の遅延添付の挙動）
- 画像バリデーション（型・サイズ）は既存の `Todo#acceptable_image` がそのまま機能する
- rswag spec を `multipart/form-data` に変更し、swagger.rake のポスト処理（ADR-0023）を拡張

#### フロントエンド

- Orval が `postApiV1Todos` を `FormData` ベースに自動生成
- `page.tsx` の `addMutation` から2段階リクエストのロジックを削除し、単一の `postApiV1Todos` 呼び出しに統合
- 既存の画像追加・削除エンドポイント（`POST/DELETE /api/v1/todos/:id/image`）は維持

## 結果

### 良い影響

- Todo作成と画像アップロードがアトミックになり、データ整合性の問題が解消
- フロントエンドのエラーハンドリングが大幅に簡素化（`imageUploadFailed` ステート削除）
- ネットワークラウンドトリップが1回に削減

### 悪い影響

- Todo作成の Content-Type が `application/json` から `multipart/form-data` に変更（内部利用のみのため影響は限定的）
- swagger.rake のポスト処理が複数 formData パラメータの混在ケースに対応する必要がある

## 補足

- 前提: ADR-0022（superseded）、ADR-0023（swagger ポスト処理）
- 関連 Issue: #81
- 既存の画像専用エンドポイント（ADR-0022）は、既存Todoへの画像追加・削除用として引き続き維持
