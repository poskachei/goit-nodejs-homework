const express = require('express');
const cors = require('cors');
const logger = require('morgan');

const contactRouter = require('./contacts/contacts.routes');

require('dotenv').config();

const PORT = process.env.PORT || 3000;

class ContactService {
  constructor() {
    this.server = null;
  }

  start() {
    this.initServer();
    this.initMiddleware();
    this.initRoutes();
    this.erroHandler();
    this.startListening();
  }

  initServer() {
    this.server = express();
  }

  initMiddleware() {
    this.server.use(express.json());
    this.server.use(cors({ origin: 'http://localhost:3000' }));
    this.server.use(logger('dev'));
  }

  initRoutes() {
    this.server.use('/api', contactRouter);
  }

  erroHandler() {
    this.server.use((err, req, res, next) => {
      if (err) {
        const code = err.status ? err.status : 400;
        res.status(code).send({ message: err.message });
      }
    });
  }

  startListening() {
    this.server.listen(PORT, () =>
      console.log(`Server was started on port: ${PORT}`),
    );
  }
}

module.exports = ContactService;
