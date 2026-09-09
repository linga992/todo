# TODO

React + TypeScript + Vite で作った TODO アプリ。データはブラウザの localStorage に保存します。

**公開先: https://linga992.github.io/todo/**

## セットアップ

```bash
npm install
```

## コマンド

| コマンド           | 内容                                        |
| ------------------ | ------------------------------------------- |
| `npm run dev`      | 開発サーバー。保存すると画面に即反映（HMR） |
| `npm run build`    | 型チェック（`tsc -b`）してから本番ビルド    |
| `npm run preview`  | ビルド結果をローカルで確認                  |
| `npm test`         | テストを監視モードで実行                    |
| `npm run test:run` | テストを 1 回だけ実行                       |
| `npm run lint`     | oxlint で静的チェック                       |
| `npm run format`   | Prettier で整形                             |

## できること

| 操作               | やり方                                                                       |
| ------------------ | ---------------------------------------------------------------------------- |
| 追加               | 入力欄に書いて Enter（または「追加」ボタン）                                 |
| 完了 / 未完了      | 左のチェックボックス                                                         |
| 編集               | テキストをダブルクリック、または「編集」ボタン。Enter で確定、Esc で取り消し |
| 削除               | 「削除」ボタン（編集で中身を空にして Enter でも削除）                        |
| 絞り込み           | 「すべて」/「未完了」/「完了」                                               |
| 並べ替え           | 行をドラッグ（「すべて」表示のときのみ）                                     |
| 完了をまとめて削除 | 「完了を削除」ボタン                                                         |

## ファイル構成

```
index.html                     Vite のエントリ
vite.config.ts                 Vite + Vitest の設定
src/
  main.tsx                     React のマウント
  App.tsx                      状態と操作をまとめて持つ
  types.ts                     Todo / Filter 型
  storage.ts                   localStorage の読み書きと検証
  reorder.ts                   並べ替えの計算
  styles.css                   見た目（OS のライト / ダークに追従）
  components/
    NewTodoForm.tsx            追加フォーム
    Filters.tsx                絞り込みと「完了を削除」
    TodoList.tsx               リスト
    TodoItem.tsx               1 行（表示 / 編集を切り替え）
    EditField.tsx              編集中だけ現れる入力欄
  storage.test.ts              保存データの検証テスト
  reorder.test.ts              並べ替えのテスト
```

## 設計のメモ

### 状態は App.tsx に集約

`todos` / `filter` / `editingId` / `draggingId` の 4 つだけ。子コンポーネントは
props で受け取って表示し、操作はコールバックで親に返します。この規模では状態管理
ライブラリは不要です。

絞り込み後のリストや残り件数は state に持たず、`todos` と `filter` から毎回計算して
います（派生状態）。二重に持つと必ずずれるためです。

### 日本語入力の Enter

日本語入力では Enter が変換の確定に使われます。その keydown は `isComposing` が
true になるので、そのときは送信しません。これを見ないと、変換途中の文字列が
タスクとして登録されてしまいます。`NewTodoForm.tsx` と `EditField.tsx` の両方で
対応しています。

### 編集欄は編集中だけマウントする

`EditField` は編集中のみ描画されます。編集を始めるたびに新しくマウントされるため、
`useState(initialText)` の初期値がそのまま編集開始時の文字列になり、`useEffect` で
下書きを同期する必要がありません。

### 並べ替え

`TodoItem` の `key` に `todo.id` を渡しているのが前提です。これがあると、ドラッグ中に
配列の順序を変えても React は要素を作り直さず既存の DOM ノードを移動するので、
ドラッグ操作が途中で切れません。

絞り込み中は隠れた行との前後関係が決まらないため、並べ替えを無効にしています。

### 保存データの検証

`localStorage` の中身は手で書き換えられるうえ、将来の形式変更でも壊れえます。
1 件でも壊れていたら全部捨てる作りだとタスクを丸ごと失うので、`parseTodos` は
1 件ずつ検証して通ったものだけを返します。

`localStorage` に触らない純関数なので、DOM 環境なしでそのままテストできます。

## データの保存先

キー `todo-app.items.v1` に保存されます。バニラ版（`master` ブランチ）と同じキー・
同じ形式なので、同じブラウザで開けば以前のタスクがそのまま読めます。

- 同じブラウザで開き直せばデータは残ります。
- ブラウザや PC が変わると引き継がれません。
- シークレットウィンドウで開いた場合、閉じると消えます。
- ブラウザの閲覧データ削除でサイトデータを消すと、一緒に消えます。

## デプロイ

`master` に push すると `.github/workflows/deploy.yml` が動き、lint → test → build を
通してから GitHub Pages へ公開されます。手動実行は Actions タブの「Run workflow」から。

Pages は `https://linga992.github.io/todo/` というサブパスで配信されるため、
`vite.config.ts` ではビルド時のみ `base` をリポジトリ名にしています。開発サーバーは
ルートのままなので、`npm run dev` は `http://localhost:5173/` で開けます。

## 以前のバニラ版

依存パッケージなしの素の HTML/CSS/JS 版が `master` ブランチに残っています。

```bash
git show master:app.js
```
