import { Request, Response } from 'express';
import {
  createTodo,
  deleteTodo,
  findAllTodos,
  updateTodoCompletion,
} from './todoModel';

function parsePositiveIntId(rawId: unknown): number | null {
  const value = Array.isArray(rawId) ? rawId[0] : rawId;
  if (typeof value !== 'string' || !/^\d+$/.test(value)) {
    return null;
  }
  const parsed = Number(value);
  if (!Number.isSafeInteger(parsed) || parsed < 1) {
    return null;
  }
  return parsed;
}

export async function getTodos(_req: Request, res: Response): Promise<void> {
  try {
    const todos = await findAllTodos();
    res.status(200).json({ todos });
  } catch (error) {
    console.error('タスク一覧の取得に失敗しました:', error);
    res.status(500).json({ error: '予期せぬエラーです' });
  }
}

export async function createTodoHandler(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const rawTitle = req.body?.title;
    if (typeof rawTitle !== 'string') {
      res.status(400).json({ error: 'タイトルは文字列で入力してください' });
      return;
    }

    const trimmedTitle = rawTitle.trim();
    if (trimmedTitle.length < 1 || trimmedTitle.length > 100) {
      res
        .status(400)
        .json({ error: 'タイトルは1〜100文字で入力してください' });
      return;
    }

    const todo = await createTodo(trimmedTitle);
    res.status(201).json({ todo });
  } catch (error) {
    console.error('タスクの登録に失敗しました:', error);
    res.status(500).json({ error: '予期せぬエラーです' });
  }
}

export async function updateTodoHandler(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const id = parsePositiveIntId(req.params.id);
    if (id === null) {
      res.status(400).json({ error: 'IDは1以上の整数で指定してください' });
      return;
    }

    const isCompleted = req.body?.isCompleted;
    if (typeof isCompleted !== 'boolean') {
      res
        .status(422)
        .json({ error: 'isCompletedは真偽値(boolean)で指定してください' });
      return;
    }

    const todo = await updateTodoCompletion(id, isCompleted);
    if (!todo) {
      res.status(404).json({ error: '指定されたタスクが見つかりません' });
      return;
    }

    res.status(200).json({ todo });
  } catch (error) {
    console.error('タスクの更新に失敗しました:', error);
    res.status(500).json({ error: '予期せぬエラーです' });
  }
}

export async function deleteTodoHandler(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const id = parsePositiveIntId(req.params.id);
    if (id === null) {
      res.status(400).json({ error: 'IDは1以上の整数で指定してください' });
      return;
    }

    const deleted = await deleteTodo(id);
    if (!deleted) {
      res.status(404).json({ error: '指定されたタスクが見つかりません' });
      return;
    }

    res.status(204).send();
  } catch (error) {
    console.error('タスクの削除に失敗しました:', error);
    res.status(500).json({ error: '予期せぬエラーです' });
  }
}
