const express = require("express");
const logger = require("morgan");
const mongoose = require("mongoose");

const contactsRouter = require("./contacts/contacts.routes");
const usersRouter = require("./users/users.routes");

require("dotenv").config();

const URI = process.env.MONGO_URI || "";
const PORT = process.env.PORT || 3000;

class UserServer {

    constructor() {
        this.server = null;
    }

    async start() {
        this.initServer();
        this.initMiddlewares();
        this.initRoures();
        await this.initDbConnection();
        this.errorHandler();
        this.startListening();
    }

    initServer() {
        this.server = express();
    }

    initMiddlewares() {
        this.server.use(express.json());
        this.server.use('/images', express.static('public/images'));
        this.server.use(logger('dev'));
    }

    initRoures() {
        this.server.use('/api/contacts', contactsRouter);
        this.server.use('/api/users', usersRouter);
    }

    async initDbConnection() {
        const opts = {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        }

        try {
            await mongoose.connect(URI, opts)    
        } catch (err) {
            console.log("Server was closed with connect to db")
            process.exit(1)            
        }

        console.log("Database connection successful")  
    }

    errorHandler() {
        this.server.use((err, req, res, next) => {
            if (err) {
                const code = err.status ? err.status : 400
                res.status(code).send({ message: err.message })
            }
        })
    }

    startListening() {
        this.server.listen(PORT, () => console.log(`Server was started on port: ${PORT}`))
    }   

}    

module.exports = UserServer;    