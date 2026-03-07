---
status: "accepted"
date: 2026-03-07
decision-makers: []
---

# ADR-0023: rswag 生成の OpenAPI スキーマをポスト処理で OpenAPI 3.0 準拠に変換

## コンテキストと課題

Todo 画像アップロード API（ADR-0022）で `multipart/form-data` のファイルアップロードを rswag で定義する必要がある。しかし rswag 2.17 では以下の矛盾が発生する:

1. **テスト実行時**: `parameter name: :image, in: :formData, type: :file` でないとファイルが実際に POST されない（`in: :body` ではファイルが送信されず 400 エラー）
2. **swagger.yaml 生成時**: 上記の定義から `type: file`（OpenAPI 2.0 形式）が出力される。Orval は OpenAPI 3.0 としてパースするため、`type: file` を認識できずバリデーションエラーになる

つまり「rswag テストが通る書き方」と「OpenAPI 3.0 準拠の swagger.yaml が出る書き方」が両立しない。

## 検討した選択肢

### 選択肢1: Rake タスクによるポスト処理

`rswag:specs:swaggerize` の後に `type: file` を OpenAPI 3.0 の `type: object` + `type: string, format: binary` に自動変換する Rake タスクを追加する。`Rake::Task#enhance` で swaggerize 後に自動実行する。

- 良い点: rswag spec は標準的な `in: :formData, type: :file` で記述でき、テストが正常に動作する。swagger.yaml は自動変換され手動修正が不要。CI でも再現性がある
- 悪い点: Rake タスクが追加され、swagger.yaml 生成のパイプラインに1ステップ増える。rswag のバージョンアップで不要になる可能性がある

### 選択肢2: swagger.yaml を手動で修正・管理

rswag の自動生成後に手動で `type: file` を修正する。画像エンドポイント部分のみ手動管理とする。

- 良い点: 追加のコードが不要
- 悪い点: rswag 再生成のたびに手動修正が必要で忘れやすい。CI で検知できない

## 決定

**選択肢1: Rake タスクによるポスト処理** を採用する。

手動修正は再生成のたびに必要で忘れやすく、自動化すべきである。`be/lib/tasks/swagger.rake` に変換ロジックを配置し、`rswag:specs:swaggerize` の `enhance` で自動実行することで、開発者が意識せずとも常に正しい OpenAPI 3.0 が出力される。

## 結果

### 良い影響

- `bin/rake rswag:specs:swaggerize` を実行するだけで、Orval 互換の正しい OpenAPI 3.0 が生成される
- rswag spec は標準的な formData パラメータ記法のまま、テストも正常に動作する
- 変換ロジックが明示的にコード化されており、レビュー・テストが可能

### 悪い影響

- rswag の生成物を後処理で書き換えるため、rswag の内部動作に依存する部分がある
- 将来 rswag が OpenAPI 3.0 の multipart を正しくサポートした場合、この Rake タスクは不要になる

## 補足

- 関連: ADR-0022（画像専用エンドポイント）、ADR-0010（rswag）、ADR-0020（Orval）
- 実装: `be/lib/tasks/swagger.rake`
- rswag の関連 Issue: multipart/form-data の OpenAPI 3.0 サポートは rswag コミュニティで議論されている既知の課題
