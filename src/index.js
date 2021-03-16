const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;
  const { id } = request.params;
  const user = users.find(user => user.username === username);
  
  if (!user) {
    return response.status(404).json({error: "Username not found."})
  }

  request.user = user;

  if (id) {
    const todo = user.todos.find(todo => todo.id === id);

    if (!todo) {
      return response.status(404).json({error: "Todo not found."});
    }

    request.todo = todo;
  }

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
  const { user } = request;

  const todo = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date()
  }

  user.todos.push(todo);

  return response.status(201).json(todo);
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;
  const { todo } = request;

  if (title) {
    todo.title = title;
  }

  if (deadline) {
    todo.deadline = new Date(deadline);
  }

  return response.status(202).json(todo);
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { todo } = request;

  todo.done = true;

  return response.status(202).json(todo);
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { user, todo } = request;
    
  user.todos.splice(todo, 1);
  
  return response.status(204).send();
});

module.exports = app;