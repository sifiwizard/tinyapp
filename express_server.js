//Setup prerequisites
const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
const cookieSession = require('cookie-session');

//Hashing and helper-functions
const {hasher, comparer} = require('./crypt');
const {lookup, urlsForUser, generateRandomString} = require('./helpers');

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({extended: true}));

app.use(cookieSession({ //Encryption for user cookies
  name : 'user_id',
  keys: ['black', 'white', 'red']
}));

const urlDatabase = { //Test data-bases and users
  "b2xVn2": {
    longURL : "http://www.lighthouselabs.ca",
    userID : "IIII"},
  "9sm5xK": {
    longURL :"http://www.google.com",
    userID : "IIII"
  }
};

const testHash = hasher("1111");

const users = {
  "IIII" : {
    id: "IIII",
    email: "test@test",
    password: testHash
  },
};

//
// GET Functions
//

app.get("/", (req, res) => {
  if (!req.session.user_id) { //Checks if user is logged out, directs to login.
    res.redirect("/login");
  }
  res.redirect("/urls");
});

app.get("/urls", (req, res) => {
  const urls = urlsForUser(req.session.user_id, urlDatabase);
  const templateVars = { urls, user_id: users[req.session.user_id] };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  if (!req.session.user_id) {
    res.redirect("/login");
  }
  const templateVars = { user_id: users[req.session.user_id] };
  res.render("urls_new", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  if (!urlDatabase[req.params.shortURL]) { //Evalutes in order; If Url exists, If user is logged in, If url belongs to user.
    return res.status(404).send("Url Not Found");
  }
  if (!req.session.user_id) {
    return res.status(401).send("User Not Logged In");
  }
  if (urlDatabase[req.params.shortURL].userID !== req.session.user_id) {
    return res.status(403).send("Forbidden Action");
  }
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL].longURL, user_id: users[req.session.user_id]};
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const URL = urlDatabase[shortURL];
  if (!URL) { //Checks is shortURL exists
    return res.status(404).send("URL Not Found");
  }
  res.redirect(URL.longURL);
});

app.get("/login", (req, res) => {
  if (req.session.user_id) { //If user logged in directs to urls
    res.redirect("/urls");
  }
  res.render("login", { user_id: users[req.session.user_id] });
});

app.get("/register", (req, res) => {
  if (req.session.user_id) {
    res.redirect("/urls");
  }
  res.render("register", { user_id: users[req.session.user_id] });
});

//
//// Post Functions
//

app.post("/urls", (req, res) => {
  if (!req.session.user_id) {
    return res.status(401).send("User Not Logged In");
  }
  const userID = req.session.user_id;
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = {longURL : req.body.longURL, userID}; //Combines random string and longUrl to make new short url key value pair, user id is the same as current logged in user
  res.redirect(`/urls/${shortURL}`);
});

app.post("/urls/:shortURL/delete", (req, res) => {
  const shortURL = req.params.shortURL;
  if (!urlDatabase[shortURL]) { //Evalutes in order; If Url exists, If user is logged in, If url belongs to user.
    return res.status(404).send("Url Not Found");
  }
  if (!req.session.user_id) {
    return res.status(401).send("User Not Logged In");
  }
  if (urlDatabase[shortURL].userID !== req.session.user_id) {
    return res.status(403).send("Forbidden Action");
  }
  delete urlDatabase[shortURL]; //Deletes shourtURL Index
  res.redirect("/urls");
});

app.post("/urls/:id", (req, res) => {
  const id = req.params.id;
  if (!urlDatabase[id]) { //Evalutes in order; If Url exists, If user is logged in, If url belongs to user.
    return res.status(404).send("Url Not Found");
  }
  if (!req.session.user_id) {
    return res.status(401).send("User Not Logged In");
  }
  if (urlDatabase[id].userID !== req.session.user_id) {
    return res.status(403).send("Forbidden Action");
  }
  const longURL = req.body.longURL;
  urlDatabase[id].longURL = longURL; //Updates longURL of shortURl
  res.redirect("/urls");
});

app.post("/login" , (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const user = lookup(users, email); //Returns user object if found, false if not
  if (!user) {
    return res.status(404).send("Email Not Found");
  }
  if (!comparer(password, user.password)) { //Compares password and hash
    return res.status(403).send("Incorrect Password");
  }
  req.session.user_id = user.id; //Sets cookies to user id
  res.redirect("/urls");
});

app.post("/logout", (req, res) => {
  req.session = null; //Removes Cookies
  res.redirect("/urls");
});

app.post("/register", (req, res) => {
  const id = generateRandomString();
  const email = req.body.email;
  let password = req.body.password;
  if (!email || !password) { //Email of password is empty
    return res.status(403).send('Invalid Entry');
  }
  if (lookup(users, email)) { //If it returns object
    return res.status(403).send('Email taken');
  }
  password = hasher(password); //Hashes password, promptly forgets original.
  users[id] = { id, email, password }; //Sets users with id, email and password hash
  req.session.user_id = id; //Sets cookies to user id
  res.redirect("/urls");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

//
////Old app.gets that were used for testing
//


// app.get("/urls.json", (req, res) => {
//   res.json(urlDatabase);
// });

// app.get("/hello", (req, res) => {
//   res.send("<html><body>Hello <b>World</b></body></html>\n");
// });