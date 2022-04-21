const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

//middleware para fazer a checagem se o usuario existe
function checksExistsUserAccount(request, response, next) {
  const {username} = request.headers;

  //busca o id do usuario 
  const user = users.find((user) => user.username === username);

  //valida se o id é existente, caso não retornar um status de erro
  if(!user){
    return response.status(400).json({error: "User not found!"});
  }

  //exporta o usuario encontrado
  request.user = user;

  //segue com a execução do programa
  return next();
}

//metodo para criação de usuario
app.post('/users', (request, response) => {

  //parametros nescessarios para criação do usuario
  const {name, username} = request.body;

  const verifyUsername = users.find((user) => user.username === username);

  if(verifyUsername){
    return response.status(400).json({error: "User Already exists!"})
  }

  //montando usuario
  const user = {
    id: uuidv4(),
    name, 
    username,
    todos: []
  }

  //adicionando usuario no array
  users.push(user);

  //returnando a requisição
  return response.status(201).json(user);

});///metodo ok

///rota que deve retornar a lista completa dos "todos" de um username
app.get('/todos', checksExistsUserAccount, (request, response) => {

  const {username} = request.headers;

  //recupera o user recebido pelo header
  const user = users.find((user) => user.username === username);
  
  //retorna a lista de todo
  return response.status(200).send(user.todos);


});

//a rota ira receber o cadastro de todos por user
app.post('/todos', checksExistsUserAccount, (request, response) => {
  
  const {title, deadline} = request.body;

  const {user} = request;

  //const {username} = request.headers;

  const todoList = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date()
  }

  user.todos.push(todoList);

  return response.status(201).json(todoList);


});

//rota para alterar dead line e title
app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  
  const {title, deadline} = request.body;

  const {id} = request.params;

  const {user} = request;

  //buscamos o indice dos todos para atualizar seus atributos
  const todoIndex = user.todos.findIndex((todos) => todos.id === id)

  //se o indice retornar menor que 0 significa que não encontrou
  if(todoIndex < 0){
    return response.status(404).json({error: "Todo List Not Found!"});
  }
  
  user.todos[todoIndex].title = title;
  user.todos[todoIndex].deadline = new Date(deadline);
   

  return response.json(user.todos[todoIndex]);

});

//alteração do atributo done
app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  // Complete aqui
  const {id} = request.params;

  const {user} = request;

  //buscamos o indice dos todos para atualizar seus atributos
  const todoIndex = user.todos.findIndex((todos) => todos.id === id)

  //se o indice retornar menor que 0 significa que não encontrou
  if(todoIndex < 0){
    return response.status(404).json({error: "Todo List Not Found!"});
  }else{
    user.todos[todoIndex].done = true;    
  }  
  

  return response.json(user.todos[todoIndex])
});

//metodo para deletar uma todoList
app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  // Complete aqui
  const {id} = request.params;

  const {user} = request;

  //buscamos o indice dos todos para atualizar seus atributos
  const todoIndex = user.todos.findIndex((todos) => todos.id === id)

  //se o indice retornar menor que 0 significa que não encontrou
  
  if(todoIndex < 0){
    return response.status(404).json({error: "Todo List Not Found!"});
  }else{
    user.todos.splice(todoIndex,1);    
  }  
  

  return response.status(204).send();
});

module.exports = app;