const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
let cookieParser = require('cookie-parser');


app.set("view engine", "ejs");

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = {

}

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

const lookup = (users, email, password= null) => {
  for (const user in users) {
    if (email === users[user].email) {
      if (password === users[user].password) {
        return users[user];
      }
      return false;
    }
  }
  return "empty";
}

app.use(bodyParser.urlencoded({extended: true}));

app.use(cookieParser());


app.get("/urls/new", (req, res) => {
  const templateVars = { user_id: users[req.cookies["user_id"]] };
  res.render("urls_new", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL], user_id: users[req.cookies["user_id"]]};
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL];
  res.redirect(longURL);
});

app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase, user_id: users[req.cookies["user_id"]] };
  res.render("urls_index", templateVars);
});

app.get("/register", (req, res) => {
  res.render("register", { user_id: users[req.cookies["user_id"]] })
});

app.get("/login", (req, res) => {
  res.render("login", { user_id: users[req.cookies["user_id"]] })
})

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
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = req.body.longURL;
  res.redirect(`/urls/${shortURL}`);
});

app.post("/urls/:shortURL/delete", (req, res) => {
  const shortURL = req.params.shortURL;
  delete urlDatabase[shortURL];
  res.redirect("/urls");
});

app.post("/urls/:id", (req, res) => {
  const longURL = req.body.longURL;
  const id = req.params.id;
  urlDatabase[id] = longURL;
  res.redirect("/urls");
});

app.post("/login" , (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const user = lookup(users, email, password);
  if (user === "empty"){
    res.status(403).send("Email Not Found")
  }
  if (!user) {
    res.status(403).send("Incorrect Password")
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
  const password = req.body.password;
  if(!email || !password){
    res.status(400).send('Invalid Entry');
  }
  if (lookup(users, email) !== "empty") {
    res.status(400).send('Email taken');
  }
  users[id] = { id, email, password };
  console.log(users[id]);
  res.cookie('user_id', id);
  res.redirect("/urls");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});