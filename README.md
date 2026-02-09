# 開発のために環境立ち上げ直後に行うこと

1. `gh auth login` で `gh` コマンドを使えるように
2. `claude` を実行して使える環境を Claude Code を使えるように
3. Claude Code 内で `/plugin marketplace add thkt/claude-config`
4. Claude Code 内で `/plugin marketplace add masuP9/a11y-specialist-skills`
5. fe/.env.example をベースに fe/.env を作成
6. be/.env.example をベースに be/.env を作成
7. fe/ 内で `npm i`
8. be/ 内で `bundle install`
