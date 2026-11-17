TODO機能 実装手順書 (03_implementation_plan.md)
本ドキュメントは、01_requirements.md と 02_design.md を根拠に、既存のプロジェクト構成（index.ts, db.ts, tsconfig.json, package.json）を一切壊さず、安全かつ段階的にTODO機能を実装するための詳細な手順を定義するものです。


工程一覧
[工程 1] SQLファイルの作成とGit保存（テーブル定義）
[工程 2] Neon SQL Editorでのテーブル作成（手動実行）
[工程 3] バックエンド層のモデル実装 (src/apps/todo/todoModel.ts)
[工程 4] バックエンド層のコントローラー実装 (src/apps/todo/todoController.ts)
[工程 5] バックエンド層のルーター実装 (src/apps/todo/todoRouter.ts)
[工程 6] index.ts へのルーター登録と画面用ルートの追加
[工程 7] フロントエンド用ビューの作成 (views/todo/index.ejs)
[工程 8] フロントエンド用スクリプトの作成 (public/todo/todo.js)
[工程 9] 動作確認・結合テスト


各工程の詳細
[工程 1] SQLファイルの作成とGit保存（テーブル定義）
対象ファイル: sql/todo/020_create_todo_tasks.sql
作業内容: テーブル作成用のSQLファイルを新規作成し、Gitリポジトリに保存します。

-- sql/todo/020_create_todo_tasks.sql
CREATE TABLE IF NOT EXISTS todo_tasks (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    is_completed BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

その後、Gitにコミットします。

確認コマンド:

git status
git add sql/todo/020_create_todo_tasks.sql
git commit -m "Add todo_tasks table migration script"

期待結果: ファイルが作成され、Gitのトラッキング対象としてコミットされること。
失敗時に最初に見る場所: パス名（sql/todo/）やファイル名（020_create_todo_tasks.sql）の誤りがないか確認する。


[工程 2] Neon SQL Editorでのテーブル作成（手動実行）
対象ファイル: Neonコンソール / SQL Editor
作業内容: 工程1で作成した sql/todo/020_create_todo_tasks.sql の内容をコピーし、NeonのSQL Editorに貼り付けて手動でクエリを実行します。
確認コマンド: Neonのテーブル一覧画面、または以下のコマンド等でテーブルが存在することを確認：

# 必要に応じて既存のDB接続確認スクリプト等を実行
npm run dev

期待結果: todo_tasks テーブルがNeonデータベース上に正常に作成されること。
失敗時に最初に見る場所: 接続しているデータベースの環境変数（.env の DATABASE_URL）が正しいか、SQL構文にエラーがないか確認する。


[工程 3] バックエンド層のモデル実装 (todoModel.ts)
対象ファイル: src/apps/todo/todoModel.ts
作業内容: データベース（PostgreSQL / db.ts）とのデータやり取りを行うモデル層を実装します。SQLインジェクションを防ぐため、パラメータ化クエリ（$1, $2 等）を使用します。また、DBの snake_case とAPIの camelCase（is_completed ⇄ isCompleted, created_at ⇄ createdAt）の変換を行います。
確認コマンド:

npm run build

期待結果: コンパイルエラーが発生せず、ビルドが成功すること。
失敗時に最初に見る場所: db.ts からのインポートパスが正しいか、クエリのプレースホルダー（$1 等）やSQL構文が正しいか確認する。


[工程 4] バックエンド層のコントローラー実装 (todoController.ts)
対象ファイル: src/apps/todo/todoController.ts
作業内容: リクエストの受付・バリデーション・エラーハンドリングおよびレスポンス返却の制御ロジックを実装します。タイトルの必須チェックおよび1～100文字のバリデーションを行います。
確認コマンド:

npm run build

期待結果: コンパイルエラーが発生せず、ビルドが成功すること。
失敗時に最初に見る場所: todoModel.ts の関数呼び出しにおける型定義や引数の数が一致しているか確認する。


[工程 5] バックエンド層のルーター実装 (todoRouter.ts)
対象ファイル: src/apps/todo/todoRouter.ts
作業内容: Expressの Router を用いて、各APIエンドポイント（GET、POST、PATCH、DELETE）とコントローラーのハンドラー関数を紐付けるルーティング定義を行います。
確認コマンド:

npm run build

期待結果: ルーターファイルが正しくビルドされること。
失敗時に最初に見る場所: コントローラーの関数名やインポートパスが正しいか確認する。


[工程 6] index.ts へのルーター登録と画面用ルートの追加
対象ファイル: index.ts
作業内容: 既存のTOPルートやDB接続設定を一切壊さないよう配慮しつつ、既存の index.ts に todoRouter をインポートして /api/v1/todos にマウントします。また、TODO画面用のGETルート（/todo）を追加します。
確認コマンド:

npm run dev

ブラウザ等で http://localhost:3000/api/v1/todos または http://localhost:3000/ にアクセス。

期待結果: 既存のTOPページが正常に表示され、サーバー起動時にエラーが発生しないこと。
失敗時に最初に見る場所: index.ts 内のインポートパス、および app.use の登録順序や構文エラーを確認する。


[工程 7] フロントエンド用ビューの作成 (views/todo/index.ejs)
対象ファイル: views/todo/index.ejs
作業内容: 白黒シルバーを基調としたミニマリズムデザインに基づくTODO画面のEJSテンプレートを作成します。タイトル入力フォーム、エラー通知バナー、タスク一覧リストを配置します。
確認コマンド: ブラウザで http://localhost:3000/todo にアクセス。
期待結果: TODO画面のHTML/CSSレイアウトが正しくブラウザに描画されること。
失敗時に最初に見る場所: ビューエンジンの設定、テンプレートファイルの配置場所（views/todo/index.ejs）、および静的ファイルのパスを確認する。


[工程 8] フロントエンド用スクリプトの作成 (public/todo/todo.js)
対象ファイル: public/todo/todo.js
作業内容: Fetch APIを用いてバックエンドの各API（GET, POST, PATCH, DELETE）と非同期通信を行い、画面の動的更新やエラーハンドリングを行うクライアントサイドスクリプトを実装します。
確認コマンド: ブラウザのコンソールを開きエラーがないことを確認しながら http://localhost:3000/todo を操作。
期待結果: ページの再読み込みなし（または適切な遷移）でタスクの追加・完了状態変更・削除が動作すること。
失敗時に最初に見る場所: ブラウザのデベロッパーツール（Console / Networkタブ）でFetchのリクエストURL（/api/v1/todos）やステータスコード、レスポンス内容を確認する。


[工程 9] 動作確認・結合テスト
対象ファイル: ローカル環境 / 各エンドポイント
作業内容: REQ-01（一覧取得）、REQ-02（登録）、REQ-03（完了状態変更）、REQ-04（削除）の4つの操作がすべて意図通りに動作するか、ブラウザ操作および curl コマンド等で最終確認を行います。
確認コマンド:

# 一覧取得の確認例
curl http://localhost:3000/api/v1/todos

# 登録の確認例
curl -X POST -H "Content-Type: application/json" -d '{"title":"テストタスク"}' http://localhost:3000/api/v1/todos

すべての要件が満たされていることを確認後、成果物をGitにコミットします。

期待結果: すべてのCRUD操作が成功し、期待通りのステータスコードとJSONレスポンス（camelCase）が返されること。
失敗時に最初に見る場所: データベースのデータ状態、モデル層のSQL文、コントローラーのバリデーションロジックを確認する。
