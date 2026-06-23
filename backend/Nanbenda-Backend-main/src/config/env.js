require('dotenv').config();

module.exports = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: process.env.PORT || 5000,
  DB: {
    HOST: process.env.DB_HOST,
    USER: process.env.DB_USER,
    PASSWORD: process.env.DB_PASSWORD,
    NAME: process.env.DB_NAME,
    PORT: 3306
  },
  JWT_SECRET: process.env.JWT_SECRET || 'secret',
  GOOGLE_GEN_AI_KEY: process.env.GOOGLE_GEN_AI_KEY,
  PUBLIC_URL: process.env.PUBLIC_URL || 'http://localhost:5000'
};
