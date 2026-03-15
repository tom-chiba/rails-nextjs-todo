---
status: "superseded"
date: 2026-03-07
decision-makers: []
superseded-by: "0024-atomic-todo-creation-with-image.md"
---

# ADR-0022: 画像専用エンドポイントによる Todo 画像 API 設計

## コンテキストと課題

Todo に画像を付与する機能（Issue #7）の API 設計を決定する必要がある。既存の Todo CRUD API は JSON（`application/json`）で統一されており、画像アップロードには `multipart/form-data` が必要になる。

現在の API 構成:
- `GET /api/v1/todos` — 一覧取得（JSON）
- `POST /api/v1/todos` — 作成（JSON）
- `PATCH /api/v1/todos/:id` — 更新（JSON）
- `DELETE /api/v1/todos/:id` — 削除
- OpenAPI スキーマから Orval で TanStack Query hooks を自動生成（ADR-0020）

## 検討した選択肢

### 選択肢1: 画像専用エンドポイント

既存 API はそのまま維持し、画像操作用のエンドポイントを別途追加する。

- `POST /api/v1/todos/:id/image` — 画像アップロード（multipart/form-data）
- `DELETE /api/v1/todos/:id/image` — 画像削除

フロントエンドは Todo 作成後に画像がある場合のみ追加リクエストで画像をアップロードする。

- 良い点: 既存の JSON API に変更なし、既存テストが全てそのまま通る、画像操作が独立しているためテスト・デバッグが容易、Orval の multipart 生成が画像エンドポイントのみに限定される
- 悪い点: Todo 作成 + 画像アップロードが2リクエストになる（フロントエンドで隠蔽可能）

### 選択肢2: 既存エンドポイントを multipart/form-data に変更

`POST /api/v1/todos` と `PATCH /api/v1/todos/:id` の Content-Type を `multipart/form-data` に変更し、テキストと画像を1リクエストで送信する。

- 良い点: 1リクエストで Todo + 画像を作成できる、API の利用側から見るとシンプル
- 悪い点: 既存の全 Todo エンドポイントの Content-Type が変わり後方互換性が崩れる、既存テスト・Swagger スペックの全面修正が必要、rswag の multipart サポートが限定的、Orval の全 Todo mutation が multipart 生成に変わり生成コードが複雑化

## 決定

**選択肢1: 画像専用エンドポイント** を採用する。

既存 API への影響がゼロで、画像機能を独立した関心事として扱える。2リクエストになるデメリットはフロントエンドの `onSuccess` コールバックで隠蔽し、ユーザー体験への影響はない。

### 実装方針

#### バックエンド

- `Api::V1::TodoImagesController` を新設（create / destroy）
- ルーティング: `resource :image` を `resources :todos` のネストとして追加
- レスポンス: 操作後の Todo JSON（`image_url` 含む）を返却
- Todo 一覧レスポンスに `image_url: string | null` フィールドを追加

#### フロントエンド

- Orval が `postApiV1TodosTodoIdImage` / `deleteApiV1TodosTodoIdImage` を自動生成
- Todo 作成の `useTodosMutation` で `onSuccess` コールバックを利用し、画像がある場合は自動アップロード
- `deleteImageMutation` で画像のみの削除（Todo は残る）に対応

## 結果

### 良い影響

- 既存の Todo CRUD API が完全に無変更で、後方互換性を維持
- 既存テスト 139 件が修正なしで通過
- 画像関連のテスト・スペックを独立したファイルで管理でき、関心の分離が明確
- Orval が multipart の FormData 生成を自動で行うため、手動のフォーム構築が不要

### 悪い影響

- Todo 作成 + 画像アップロードが2つの HTTP リクエストになり、ネットワークラウンドトリップが増加
- 画像アップロードが Todo 作成とアトミックでないため、Todo 作成成功 + 画像アップロード失敗のケースが発生しうる（画像なしの Todo が残る）

## 補足

- 前提: ADR-0020（Orval + TanStack Query）、ADR-0010（rswag）、ADR-0014（CORS 直接通信）
- 関連: ADR-0021（Active Storage によるストレージ選択）
- 関連 Issue: #7

### 将来の拡張パス

- **複数画像対応**: `resource :image`（単数）を `resources :images`（複数）に変更し、コントローラに index / show アクションを追加する。既存の単一画像 API を非推奨にするか、互換性を維持するかは別途 ADR で決定する
- **アトミック作成**: 画像付き Todo のアトミックな作成が必要になった場合、専用の `POST /api/v1/todos/with_image`（multipart）エンドポイントを追加する方針で対応可能。既存エンドポイントは変更しない
