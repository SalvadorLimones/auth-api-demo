const express = require("express");
const cors = require("cors");
const fs = require("fs");
const app = express();
const port = 4000;

app.use(express.json());
app.use(cors());

const users = require("./users.json");

const sessions = {};

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.post("/api/signup", (req, res) => {
  if (!req.body.username || !req.body.password) {
    return res.sendStatus(400);
  }

  for (let user of users) {
    if (user.username === req.body.username) {
      return res.sendStatus(409);
    }
  }

  const newUser = {
    username: req.body.username,
    password: req.body.password,
    todolist: [],
  };
  users.push(newUser);
  fs.writeFileSync("./users.json", JSON.stringify(users, null, 4));
  res.sendStatus(200);
});

app.get("/api/todo", (req, res) => {
  const sessionID = req.header("Authorization");
  if (!sessionID) return res.sendStatus(401);

  const sessionUser = sessions[sessionID];
  const username = sessionUser.username;
  const password = sessionUser.password;
  const user = users.find(
    (user) => username === user.username && password === user.password
  );

  if (!user) return res.sendStatus(401);

  return res.json(user.todolist);
});

app.post("/api/todo", (req, res) => {
  const sessionID = req.header("Authorization");
  if (!sessionID) return res.sendStatus(401);

  const sessionUser = sessions[sessionID];
  const username = sessionUser.username;
  const password = sessionUser.password;
  const user = users.find(
    (user) => username === user.username && password === user.password
  );

  if (!user) return res.sendStatus(401);

  if (!req.body.msg) return res.sendStatus(400);
  user.todolist.push(req.body.msg);
  fs.writeFileSync("./users.json", JSON.stringify(users, null, 4));
  res.sendStatus(200);
});

app.post("/api/login", (req, res) => {
  const authHeader = req.header("Authorization");
  if (!authHeader) return res.sendStatus(401);

  const credentials = authHeader.split("&&&");
  const username = credentials[0];
  const password = credentials[1];
  const user = users.find(
    (user) => username === user.username && password === user.password
  );

  if (!user) return res.sendStatus(401);
  let sessionId = Math.random().toString();
  sessions[sessionId] = user;
  console.log(sessions);
  setTimeout(() => {
    delete sessions[sessionId];
    console.log("session ended");
  }, 10 * 1000);
  res.json(sessionId);
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
