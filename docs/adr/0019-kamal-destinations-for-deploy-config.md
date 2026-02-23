---
status: "accepted"
date: 2026-02-23
decision-makers: []
---

# ADR-0019: Kamal Destinations によるデプロイ先設定の分離

## コンテキストと課題

デプロイ先サーバーのIPアドレスやドメインが `be/config/deploy.yml` にハードコードされていた。サーバーを頻繁に変更する運用（ConoHa VPS → KAGOYA VPS への移行など）において、デプロイ先の変更のたびに `deploy.yml` を編集・コミットする必要があった（#49）。

IPアドレスやドメインといったデプロイ先固有の設定を、コード変更なしに切り替えられるようにしたい。

## 検討した選択肢

### 選択肢1: ERB + 環境変数

`deploy.yml` 内で `<%= ENV.fetch("KAMAL_SERVER_IP") %>` のように環境変数を参照する。

- 良い点: ファイル構成が変わらない、シンプル
- 悪い点: デプロイ時に毎回環境変数の設定が必要、設定値の一覧性が低い、staging 等の追加時に環境変数が増える

### 選択肢2: Kamal Destinations

Kamal の Destinations 機能を使い、`deploy.yml`（共通設定）と `deploy.production.yml`（本番固有設定）に分離する。

- 良い点: Kamal 公式の機能で設定の分離が可能、destination ファイルに設定値が一覧でまとまる、staging 追加時は `deploy.staging.yml` を作るだけ
- 悪い点: デプロイコマンドに `-d production` の指定が必要になる

## 決定

**選択肢2: Kamal Destinations** を採用する。

サーバーIP・ドメインはシークレットではなく「デプロイ先ごとに異なる設定」であり、Destinations の用途に合致する。さらに、IPアドレスが頻繁に変わる運用を考慮し、destination ファイルを gitignore して `.example` テンプレートのみ git 管理する。

### 具体的な構成

| ファイル | git管理 | 役割 |
|---|---|---|
| `config/deploy.yml` | する | 共通設定（サービス名、レジストリ、ビルダー等） |
| `config/deploy.production.yml` | **しない** | 本番固有の設定（IP、ドメイン等） |
| `config/deploy.production.yml.example` | する | テンプレート |
| `.kamal/secrets` | する | シークレットの取得方法を記述 |

### デプロイコマンド

```bash
bin/kamal deploy -d production
```

### サーバー移行時

`config/deploy.production.yml` のIPアドレスを書き換えてデプロイするだけ。コード変更やコミットは不要。

## 結果

### 良い影響

- サーバーIPの変更がコミット不要になり、運用が簡素化される
- 設定値が destination ファイルに集約され、一覧性が高い
- staging 等の環境追加が `deploy.<destination>.yml` を作るだけで対応可能

### 悪い影響

- デプロイコマンドに `-d production` の指定が必要になる
- 初回セットアップ時に `.example` からのコピーが必要

## 補足

- 前提: ADR-0013（本番デプロイ構成）
- 関連 Issue: #50、#49
- 参考: [Kamal Destinations ドキュメント](https://kamal-deploy.org/docs/configuration/overview/)
