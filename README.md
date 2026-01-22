
# WARAKADO VISION Web Member App

WARAKADO VISIONの公式会員アプリ（Vercelデプロイ用パッケージ）です。

## Vercelへのデプロイ方法
1. このリポジトリをGitHubにプッシュします。
2. Vercelのダッシュボードで「New Project」を作成し、リポジトリを選択します。
3. Framework Presetは「Other」を選択してください。
4. デプロイ完了後、発行されたURL（例: `https://your-app.vercel.app`）をメモしてください。

## ジンドゥー (Jimdo) への埋め込み方法
1. Jimdoのエディタで「コンテンツを追加」＞「HTML / ウィジェット」を選択します。
2. 本リポジトリ内の `jimdo-embed.html` の中身をコピーし、`src` のURLをあなたのVercel URLに書き換えて貼り付けてください。

## 注意事項
- 決済機能を使用する場合は、Vercelの環境変数に `STRIPE_SECRET_KEY` を設定する必要があります。
- 広告を表示する場合は `AdBanner.tsx` 内の `ca-pub-...` をご自身のIDに更新してください。
