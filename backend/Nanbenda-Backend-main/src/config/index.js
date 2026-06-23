const env = require('./env');
const db = require('./database');

module.exports = {
  ...env,
  db
};
