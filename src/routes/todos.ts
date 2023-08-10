import { Router } from "express";

import { Todo } from "../models/todo";

let todos: Todo[] = [];

type RequestBody = { text: string };
type RequestParams = { todoId: string };

const router = Router();

router.get("/", (req, res, next) => {
  res.status(200).json({ todos });
});

router.post("/", (req, res, next) => {
  const body = req.body as RequestBody;

  const newTodo: Todo = {
    id: new Date().toISOString(),
    text: body.text,
  };

  todos.push(newTodo);

  res.status(201).json({ message: "Added Todo", todos });
});

router.put("/:todoId", (req, res, next) => {
  const params = req.params as RequestParams;
  const todoId = params.todoId;

  const todoIndex = todos.findIndex((todoItem) => todoItem.id === todoId);

  if (todoIndex >= 0) {
    todos[todoIndex] = { id: todos[todoIndex].id, text: req.body.text };

    return res.status(200).json({ message: "Updated todo", todos });
  }

  res.status(204).json({ message: "Could not find todo for this id." });
});

router.delete("/:todoId", (req, res, next) => {
  const params = req.params as RequestParams;
  const todoId = params.todoId;

  todos = todos.filter((todoItem) => todoItem.id !== todoId);

  res.status(200).json({ message: "Deleted", todos });
});

export default router;
