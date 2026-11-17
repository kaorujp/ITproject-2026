import { pool } from '../../../db';

export interface TodoTask {
  id: number;
  title: string;
  isCompleted: boolean;
  createdAt: string;
}

interface TodoTaskRow {
  id: number;
  title: string;
  is_completed: boolean;
  created_at: Date | string;
}

function mapRowToTodo(row: TodoTaskRow): TodoTask {
  return {
    id: row.id,
    title: row.title,
    isCompleted: row.is_completed,
    createdAt:
      row.created_at instanceof Date
        ? row.created_at.toISOString()
        : String(row.created_at),
  };
}

export async function findAllTodos(): Promise<TodoTask[]> {
  const result = await pool.query<TodoTaskRow>(
    'SELECT id, title, is_completed, created_at FROM todo_tasks ORDER BY created_at DESC, id DESC'
  );
  return result.rows.map(mapRowToTodo);
}

export async function createTodo(title: string): Promise<TodoTask> {
  const result = await pool.query<TodoTaskRow>(
    'INSERT INTO todo_tasks (title) VALUES ($1) RETURNING id, title, is_completed, created_at',
    [title]
  );
  return mapRowToTodo(result.rows[0]);
}

export async function updateTodoCompletion(
  id: number,
  isCompleted: boolean
): Promise<TodoTask | null> {
  const result = await pool.query<TodoTaskRow>(
    'UPDATE todo_tasks SET is_completed = $1 WHERE id = $2 RETURNING id, title, is_completed, created_at',
    [isCompleted, id]
  );
  if (result.rows.length === 0) {
    return null;
  }
  return mapRowToTodo(result.rows[0]);
}

export async function deleteTodo(id: number): Promise<boolean> {
  const result = await pool.query(
    'DELETE FROM todo_tasks WHERE id = $1 RETURNING id',
    [id]
  );
  return (result.rowCount ?? 0) > 0;
}
