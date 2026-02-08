# Architecture Decision Records (ADR)

本プロジェクトの技術的意思決定を記録するADR（Architecture Decision Records）の一覧。

## フォーマット

[MADR 4.0.0](https://adr.github.io/madr/)（Markdown Any Decision Records）を採用。テンプレートは [`template.md`](template.md) を参照。

## ADR一覧

| # | タイトル | ステータス | 日付 |
|---|---------|-----------|------|
| [ADR-0001](0001-monorepo-structure.md) | モノレポ構成（BE/FE分離、共有コードなし） | accepted | 2026-02-07 |
| [ADR-0002](0002-rails-api-nextjs-tech-stack.md) | Rails 8.1 API-only + Next.js 16 技術スタック | accepted | 2026-02-07 |
| [ADR-0003](0003-sqlite3-for-all-environments.md) | 全環境でSQLite3を使用 | accepted | 2026-02-07 |
| [ADR-0004](0004-biome-as-linter-formatter.md) | Biome をLinter/Formatterとして採用 | accepted | 2026-02-07 |
| [ADR-0005](0005-vitest-for-frontend-testing.md) | Vitest をフロントエンドテストに採用 | accepted | 2026-02-07 |
| [ADR-0006](0006-devcontainer-development-environment.md) | devcontainerによる開発環境統一 | accepted | 2026-02-07 |
| [ADR-0007](0007-washi-sumi-ink-ui-theme.md) | 和紙×墨インクUIテーマ | accepted | 2026-02-07 |

## 新しいADRの作成方法

1. [`template.md`](template.md) をコピーして新しいファイルを作成
2. ファイル名は `NNNN-kebab-case-title.md` 形式（4桁ゼロ埋め）
3. YAML front matter の `status`、`date`、`decision-makers` を記入
4. 各セクションを記述
5. この README の一覧テーブルにエントリを追加
