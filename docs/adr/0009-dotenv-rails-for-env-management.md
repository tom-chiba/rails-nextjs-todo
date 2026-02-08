---
status: "accepted"
date: 2026-02-08
decision-makers: []
---

# ADR-0009: dotenv-railsによる環境変数管理

## コンテキストと課題

バックエンドアプリケーションはCORS設定等で環境変数を必要とする。従来はDocker Composeの`env_file`ディレクティブでコンテナに環境変数を注入していたが、devcontainer内で開いたシェルセッションにはこれらの環境変数が伝播しないことが判明した。`env_file`はコンテナのメインプロセス（PID 1）にのみ環境変数を渡すため、後から起動するシェルやRailsプロセスからは参照できない。

## 検討した選択肢

### 選択肢1: Docker Compose env_file を維持

`compose.yaml`の`env_file`でコンテナに環境変数を注入する方式を継続する。

- 良い点: Rails側に追加Gem不要
- 悪い点: devcontainerのシェルセッションに環境変数が伝播しない。テスト実行やrailsコマンドで環境変数が参照できない

### 選択肢2: devcontainer.json の containerEnv に集約

全ての環境変数を`devcontainer.json`の`containerEnv`で管理する。

- 良い点: devcontainer標準機能、追加Gem不要
- 悪い点: 環境変数の値がリポジトリにコミットされる。秘匿値の管理に不向き

### 選択肢3: dotenv-rails を導入

`dotenv-rails` gemでRails起動時に`.env`ファイルを自動読み込みする。

- 良い点: Rails起動時に確実に読み込まれる。`.env`を`.gitignore`できるため秘匿値管理が容易。開発・テスト環境で統一的に動作する
- 悪い点: Gem依存の追加

## 決定

**選択肢3: dotenv-rails を導入**する。`compose.yaml`の`env_file`は削除する。

Railsが利用する環境変数（CORS設定、APIキー等）は`.env`で管理し、`dotenv-rails`で読み込む。DBの接続先等のインフラ寄りの環境変数が将来必要になった場合は、`devcontainer.json`の`containerEnv`で管理する。

## 結果

### 良い影響

- devcontainerのシェルセッション、テスト実行、railsコマンドのいずれからも環境変数が参照可能になる
- `.env`をgitignoreすることで秘匿値をリポジトリから除外できる
- `.env.example`でチームメンバーへの設定項目の共有が容易

### 悪い影響

- `dotenv-rails` gemへの依存が追加される（development, testグループのみ）

## 補足

- `dotenv-rails`はdevelopment/test環境でのみ読み込まれる。本番環境では環境変数は実行環境（コンテナオーケストレーター等）から注入する前提
- https://github.com/bkeepers/dotenv
