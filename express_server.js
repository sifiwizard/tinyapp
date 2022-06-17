const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');
const {hasher, comparer} = require('./crypt');

app.set("view engine", "ejs");

const urlDatabase = {
  "b2xVn2": {
    longURL : "http://www.lighthouselabs.ca",
    userID : "IIII"},
  "9sm5xK": {
    longURL :"http://www.google.com",
    userID : "IIII"
  }
};

const testHash = hasher("1111")

const users = {
  "IIII" : {
  id: "IIII",
  email: "test@test",
  password: testHash
  },
};

const generateRandomString = function() {
  let rString = "";
  let i = 0;
  while (i < 6) {
    if (Math.random() > 0.5) {
      if (Math.random() > 0.5) {
        rString += String.fromCharCode(Math.floor(Math.random() * 26) + 65);
      } else {
        rString += String.fromCharCode(Math.floor(Math.random() * 26) + 97);
      }
    } else {
      rString += Math.floor(Math.random() * 10);
    }
    i ++;
  }
  return rString;
};

const lookup = (users, email, password = false) => {
  console.log(email,password);
  for (const user in users) {
    if (email === users[user].email) {
      if (password && comparer(password, users[user].password)) {
        return users[user];
      }
      return false;
    }
  }
  return "empty";
};

const urlsForUser = id => {
  let URLs = {}
  for (const url in urlDatabase) {
    if (urlDatabase[url].userID === id) {
      URLs[url] = urlDatabase[url];
    }
  }
  return URLs
}

app.use(bodyParser.urlencoded({extended: true}));

app.use(cookieParser());


app.get("/urls/new", (req, res) => {
  if (!req.cookies["user_id"]) {
    res.redirect("/login");
  }
  const templateVars = { user_id: users[req.cookies["user_id"]] };
  res.render("urls_new", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  if (urlDatabase[req.params.shortURL].userID !== req.cookies["user_id"]) {
    res.status(403).send("ShortURL Unavalible");
    return false;
  }
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL].longURL, user_id: users[req.cookies["user_id"]]};
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const URL = urlDatabase[shortURL];
  if (!URL) {
    res.status(404).send("URL Not Found");
    return false;
  }
  res.redirect(URL.longURL);
});

app.get("/urls", (req, res) => {
  const urls = urlsForUser(req.cookies["user_id"])
  const templateVars = { urls, user_id: users[req.cookies["user_id"]] };
  res.render("urls_index", templateVars);
});

app.get("/register", (req, res) => {
  if (req.cookies["user_id"]) {
    res.redirect("/urls");
  }
  res.render("register", { user_id: users[req.cookies["user_id"]] });
});

app.get("/login", (req, res) => {
  if (req.cookies["user_id"]) {
    res.redirect("/urls")
  }
  res.render("login", { user_id: users[req.cookies["user_id"]] });
});

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.post("/urls", (req, res) => {
  if (!req.cookies["user_id"]) {
    res.status(403).send("User Not Logged In");
    return false;
  }
  const userID = req.cookies["user_id"];
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = {longURL : req.body.longURL, userID};
  res.redirect(`/urls/${shortURL}`);
});

app.post("/urls/:shortURL/delete", (req, res) => {
  const shortURL = req.params.shortURL;
  if (urlDatabase[shortURL].userID !== req.cookies["user_id"]) {
    res.status(403).send("ShortURL Unavalible");
    return false;
  }
  delete urlDatabase[shortURL];
  res.redirect("/urls");
});

app.post("/urls/:id", (req, res) => {
  const longURL = req.body.longURL;
  const id = req.params.id;
  if (urlDatabase[id].userID !== req.cookies["user_id"]) {
    res.status(403).send("ShortURL Unavalible");
    return false;
  }
  urlDatabase[id].longURL = longURL;
  res.redirect("/urls");
});

app.post("/login" , (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const user = lookup(users, email, password);
  if (user === "empty") {
    res.status(403).send("Email Not Found");
    return false;
  }
  if (!user) {
    res.status(403).send("Incorrect Password");
    return false;
  }
  res.cookie("user_id", user.id);
  res.redirect("/urls");
});

app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/urls");
});

app.post("/register", (req, res) => {
  const id = generateRandomString();
  const email = req.body.email;
  let password = req.body.password;
  if (!email || !password) {
    res.status(400).send('Invalid Entry');
    return false;
  }
  if (lookup(users, email) !== "empty") {
    res.status(400).send('Email taken');
    return false;
  }
  password = hasher(password);
  users[id] = { id, email, password };
  console.log(users[id]);
  res.cookie('user_id', id);
  res.redirect("/urls");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});