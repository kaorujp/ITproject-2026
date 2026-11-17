import express, { Request, Response } from 'express';
import path from 'path';
import { pool } from './db'; // ★ 追加：db.tsからpoolをインポート
import todoRouter from './src/apps/todo/todoRouter';

const app = express(); // Expressアプリケーションを作成
const port: number = 3000; // ローカルで使用するポート番号


// ------------------------------
// Expressの基本設定
// ------------------------------
app.use(express.json()); // JSON形式のリクエストボディを受け取れるようにする
app.use(express.urlencoded({ extended: true })); // フォームから送信されたデータを受け取れるようにする
app.use(express.static(path.join(process.cwd(), 'public'), { redirect: false })); // CSSや画像などの静的ファイルを公開する
app.set('view engine', 'ejs'); // テンプレートエンジンにEJSを設定
app.set('views', path.join(process.cwd(), 'views')); // EJSファイルを保存するフォルダーを指定


// ------------------------------
// ルーティング
// ------------------------------

// 「/」にアクセスされたときの処理
app.get('/', (req: Request, res: Response): void => {
  res.send('Hello World!!!!');
});

// ★ 追加：Neonデータベースへの接続確認用API
app.get('/api/db-check', async (_req: Request, res: Response): Promise<void> => {
  try {
    const result = await pool.query('SELECT 1 AS connection_test');
    res.json({
      status: 'ok',
      database: result.rows[0].connection_test === 1 ? 'connected' : 'error',
    });
  } catch (error) {
    console.error('DB接続確認に失敗しました', error);
    res.status(503).json({ status: 'error', database: 'unavailable' });
  }
});

// TODO画面
app.get('/todo', (_req: Request, res: Response): void => {
  res.render('todo/index');
});

// TODO API
app.use('/api/v1/todos', todoRouter);


// ------------------------------
// サーバー起動
// ------------------------------

app.listen(port, (): void => {
  console.log(`Server started: http://localhost:${port}`);
});