const express = require("express");
const mongoose = require("mongoose");

require("dotenv").config();

const URI = process.env.MONGO_URI || "";
const PORT = process.env.PORT || 3000;

class ContactServer {

    constructor() {
        this.server = null;
    }

    async start() {
        this.initServer();
        this.initMiddlewares();
        this.initRoures();
        await this.initDb();
        this.errorHandler;
        this.startListening();
    }

    initServer() {
        this.server = express(); 
    }

    initMiddlewares() {
        this.server.use(express.json());
    }

    initRoures() {
        this.server.use('/api', contactRouter);
    }

    async initDb() {
        const opts = {
            useNewUrlParser: true,
            useUnifiedTopology: true,
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
                const code = err.status ? err.status : 400;
                res.status(code).send({ message: err.message });
            }
        });    
    }

    startListening() {
        this.server.listen(
            PORT,
            () =>console.log(`Server was started on port: ${PORT}`),
        ); 
    }
}


module.exports = ContactServer;