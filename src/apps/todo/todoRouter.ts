import { Router } from 'express';
import {
  createTodoHandler,
  deleteTodoHandler,
  getTodos,
  updateTodoHandler,
} from './todoController';

const todoRouter = Router();

todoRouter.get('/', getTodos);
todoRouter.post('/', createTodoHandler);
todoRouter.patch('/:id', updateTodoHandler);
todoRouter.delete('/:id', deleteTodoHandler);

export default todoRouter;
