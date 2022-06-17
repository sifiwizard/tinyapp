const bcrypt = require('bcryptjs');

const hasher = password => {
  const salt = bcrypt.genSaltSync(10);
  const hashedPassword = bcrypt.hashSync(password, salt);
  return hashedPassword;
};

const comparer = (password, hashedPassword) => {
  return bcrypt.compareSync(password, hashedPassword);
};

module.exports = {hasher, comparer};