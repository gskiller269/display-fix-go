const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUI = require('swagger-ui-express');
const options = require('./config');

const specs = swaggerJsDoc(options);

module.exports = {
  swaggerUI,
  specs,
};
