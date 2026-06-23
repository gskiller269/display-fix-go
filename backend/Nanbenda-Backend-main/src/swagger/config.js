const path = require('path');
const { PUBLIC_URL } = require('../config');

const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Nanbenda Advanced API',
      version: '1.1.0',
      description: 'A professional and secure API for the Nanbenda application, featuring rate limiting, layered architecture, and comprehensive entity management.',
      contact: {
        name: 'Nanbenda Support',
        email: 'support@nanbenda.in',
      },
    },
    servers: [
      {
        url: `${PUBLIC_URL}/api`,
        description: 'Current Environment Server',
      },
      {
        url: 'https://backend.nanbenda.in/api',
        description: 'Production Server (Domain)',
      },
      {
        url: 'http://178.238.226.206:5000/api',
        description: 'Production Server (Direct IP)',
      },
      {
        url: 'https://t91tqd6x-5000.inc1.devtunnels.ms/api',
        description: 'Development Server (Tunnel)',
      },
      {
        url: 'http://localhost:5000/api',
        description: 'Local Server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    security: [{
      bearerAuth: [],
    }],
  },
  apis: [
    path.join(__dirname, './schemas.js'),
    path.join(__dirname, '../routes/*.js')
  ],
};

module.exports = swaggerOptions;
