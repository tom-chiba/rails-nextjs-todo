---
status: "accepted"
date: 2026-02-08
decision-makers: []
---

# ADR-0012: CI での OpenAPI スキーマ整合性チェック

## コンテキストと課題

ADR-0010 で rswag によるコードファースト OpenAPI スキーマ生成を、ADR-0011 で openapi-typescript による FE 型自動生成を採用した。これらの生成物（`swagger.yaml`、`app/generated/api.ts`）は git 管理されているが、API 実装を変更した際に再生成を忘れてマージされると、BE/FE 間でスキーマの不整合が発生するリスクがある。

この不整合を CI で自動検出する仕組みが必要である。

## 検討した選択肢

### 選択肢1: 生成物を git 管理せず CI で都度生成

swagger.yaml や api.ts を `.gitignore` に追加し、CI やビルド時に毎回生成する。

- 良い点: 生成忘れの問題自体が発生しない
- 悪い点: PR レビューで API 変更の diff を確認できなくなる、ビルド時に BE のスキーマが必要になりデプロイが複雑化

### 選択肢2: git diff による整合性チェック

CI で生成物を再生成し、コミット済みのファイルとの差分を `git diff --exit-code` で検出する。差分があれば CI を失敗させる。

- 良い点: PR レビューでの diff 確認を維持できる、実装がシンプル、既存のワークフローに自然に統合できる
- 悪い点: CI に再生成の実行時間が追加される

## 決定

**選択肢2: git diff による整合性チェック** を採用する。

ADR-0010 で swagger.yaml を git 管理する方針を決定済みであり、PR レビューでの diff 確認は重要な利点である。`git diff --exit-code` によるチェックはシンプルで信頼性が高い。

### 具体的な適用範囲

- **BE CI**: `bin/rake rswag:specs:swaggerize` で再生成し `swagger/v1/swagger.yaml` の差分をチェック
- **BE ローカル CI** (`bin/ci`): 同様のステップを追加
- **FE CI**: `npm run generate:types` で再生成し `app/generated/api.ts` の差分をチェック

## 結果

### 良い影響

- API 実装変更時にスキーマ再生成の漏れを CI が自動検出する
- BE/FE 間のスキーマ不整合がマージ前に発見される
- FE CI ワークフローの新規導入により、lint・テスト・型チェックも CI で実行される

### 悪い影響

- CI の実行時間がスキーマ再生成の分だけ増加する（ただし並列ジョブのため全体への影響は軽微）

## 補足

- 前提: ADR-0010（rswag によるコードファースト OpenAPI スキーマ生成）、ADR-0011（openapi-typescript による型自動生成）
- 関連 Issue: #6（CI - OpenAPI スキーマ整合性チェック）
