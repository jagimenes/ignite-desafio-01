const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;
  const user = users.find(user => user.username === username);
  if (!user) {
    return response.status(404).json({error: "Username not found."})
  }

  request.user = user;

  next();
}

app.post('/users', (request, response) => {
  const { name, username } = request.body;

  if (users.find(user => user.username === username)) {
    return response.status(400).json({error: "This username already been registered yet."})
  }

  const user = {
    id: uuidv4(),
    name: name,
    username: username,
    todos: []

  }
  users.push(user);

  return response.status(201).json(user);
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  return response.json(request.user.todos);
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;

  const todo = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date()
  }

  const userIndex = users.findIndex(user => user.username === request.user.username);
  users[userIndex].todos.push(todo);

  return response.status(201).json(todo);
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;
  const { id } = request.params;

  if (!request.user.todos.find(todo => todo.id === id)) {
    response.status(404).json({error: "Todo not found."});
  }

  const userIndex = users.findIndex(user => user.username === request.user.username);
  const todoIndex = users[userIndex].todos.findIndex(todo => todo.id === id);
  
  if (title) {
    users[userIndex].todos[todoIndex].title = title;
  }

  if (deadline) {
    users[userIndex].todos[todoIndex].deadline = new Date(deadline);
  }

  return response.status(202).json(users[userIndex].todos[todoIndex]);
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { id } = request.params;

  if (!request.user.todos.find(todo => todo.id === id)) {
    response.status(404).json({error: "Todo not found."});
  }

  const userIndex = users.findIndex(user => user.username === request.user.username);
  const todoIndex = users[userIndex].todos.findIndex(todo => todo.id === id);
  users[userIndex].todos[todoIndex].done = true;

  return response.status(202).json(users[userIndex].todos[todoIndex]);
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { id } = request.params;
  const todo = request.user.todos.find(todo => todo.id === id);
  
  if (!todo) {
    response.status(404).json({error: "Todo not found."});
  }

  const userIndex = users.findIndex(user => user.username === request.user.username);
  
  users[userIndex].todos.splice(todo, 1);
  
  return response.status(204).send();
});

module.exports = app;