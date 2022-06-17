const lookup = (users, email) => { //Searches through user database for user with matching email, returns user object
  for (const user in users) {
    if (email === users[user].email) {
      return users[user];
    }
  }
  return false;
};

const urlsForUser = (id, urlDatabase) => { //Finds all tinyUrls with specific user ids before returning them
  let URLs = {};
  for (const url in urlDatabase) {
    if (urlDatabase[url].userID === id) {
      URLs[url] = urlDatabase[url];
    }
  }
  return URLs;
};

const generateRandomString = function() { //Does what is on the tin, generates six digit random string
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

module.exports = {lookup, urlsForUser, generateRandomString};