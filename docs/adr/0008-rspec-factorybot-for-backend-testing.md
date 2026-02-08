---
status: "accepted"
date: 2026-02-08
decision-makers: []
---

# ADR-0008: バックエンドテストフレームワークにRSpec + FactoryBotを採用

## コンテキストと課題

OpenAPIコードファーストアプローチ（rswag）の導入を計画しているが、rswagはRSpecベースのDSLで構築されている。現在のバックエンドはRailsデフォルトのMinitestを使用しており、rswagを利用するにはRSpecへの移行が必要である。

あわせて、テストデータ管理にFixturesを使用しているが、より柔軟なデータ生成手法への移行も検討する。

## 検討した選択肢

### 選択肢1: Minitest を維持

Railsデフォルトのテストフレームワークを継続使用する。

- 良い点: 追加Gem不要、Railsデフォルトでシンプル
- 悪い点: rswag（OpenAPIコードファースト）が利用不可、BDD記法やネスト構造が使えない

### 選択肢2: RSpec + FactoryBot に移行

RSpecをテストフレームワーク、FactoryBotをテストデータ管理に採用する。

- 良い点: rswagが利用可能、BDDスタイルの記述力、FactoryBotによる動的データ生成・trait・関連の柔軟性
- 悪い点: 移行コスト、Gem追加による依存増加

## 決定

**選択肢2: RSpec + FactoryBot に移行** を採用する。

rswag導入の前提条件としてRSpecが必須であることが最大の理由。加えて、FactoryBotはRuby/Railsにおけるテストデータ管理のデファクトスタンダードであり、Fixturesと比較して動的データ生成・trait・関連の柔軟性に優れる。

## 結果

### 良い影響

- rswag（OpenAPIコードファースト）導入が可能になる
- BDDスタイルの記述でテストの意図が明確になる
- FactoryBotのtrait・関連により、テストデータ管理が柔軟になる

### 悪い影響

- 既存のMinitestテストを全てRSpecに書き換える移行コストが発生
- rspec-rails, factory_bot_railsの依存が追加される

## 補足

- 関連Issue: #3（RSpec移行）、#2（rswag導入）
- rswag: https://github.com/rswag/rswag
