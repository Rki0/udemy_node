"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
let todos = [];
const router = (0, express_1.Router)();
router.get("/", (req, res, next) => {
    res.status(200).json({ todos });
});
router.post("/", (req, res, next) => {
    const body = req.body;
    const newTodo = {
        id: new Date().toISOString(),
        text: body.text,
    };
    todos.push(newTodo);
    res.status(201).json({ message: "Added Todo", todos });
});
router.put("/:todoId", (req, res, next) => {
    const params = req.params;
    const todoId = params.todoId;
    const todoIndex = todos.findIndex((todoItem) => todoItem.id === todoId);
    if (todoIndex >= 0) {
        todos[todoIndex] = { id: todos[todoIndex].id, text: req.body.text };
        return res.status(200).json({ message: "Updated todo", todos });
    }
    res.status(204).json({ message: "Could not find todo for this id." });
});
router.delete("/:todoId", (req, res, next) => {
    const params = req.params;
    const todoId = params.todoId;
    todos = todos.filter((todoItem) => todoItem.id !== todoId);
    res.status(200).json({ message: "Deleted", todos });
});
exports.default = router;
