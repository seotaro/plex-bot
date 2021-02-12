# plex-bot

[plex media server](https://www.plex.tv/) の webhook を使って、曲のレーティングが変更されたら twitter に投稿する。

webhook のエンドポイントは Google Cloud Run（以下、GCR） に実装した。

## Deploy

1. Google Cloud Platform に GCR をデプロイするプロジェクトを作成する。
2. .env.yaml に twitter api のキーとトークンを設定する。
3. 以下を実行する。

```bash
make login-gcp
make deploy
```