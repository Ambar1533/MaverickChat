//** Nodejs API/server.js */
'use strict';

const express = require("express");
const http = require('http');
const socketio = require('socket.io');
const cors = require('cors');
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet');
const path = require('path');
require('dotenv').config(); // Load .env

const socketEvents = require('./web/socket');
const routes = require('./web/routes');
const appConfig = require('./config/app-config');
const errorHandler = require('./middleware/errorHandler'); // Centralized error handler

class Server {
    constructor() {
        this.app = express();
        this.http = http.Server(this.app);
        this.socket = socketio(this.http, {
            cors: {
                origin: '*', // Replace with frontend URL in production
                methods: ['GET', 'POST']
            }
        });
    }

    appConfig() {
        // ✅ Environment config
        new appConfig(this.app).includeConfig();

        // ✅ Security middleware
        this.app.use(helmet());
        this.app.use(mongoSanitize({ replaceWith: '_' }));

        // ✅ Enable CORS (allow frontend access)
        this.app.use(cors({ origin: '*' })); // Replace * with frontend domain in production

        // ✅ Serve uploaded static files
        this.app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
    }

    includeRoutes() {
        // ✅ API and socket routes
        new routes(this.app).routesConfig();
        new socketEvents(this.socket).socketConfig();

        // ✅ Centralized error handler (must be last)
        this.app.use(errorHandler);
    }

    appExecute() {
        this.appConfig();
        this.includeRoutes();

        const port = process.env.PORT || 4000;
        const host = process.env.HOST || 'localhost';

        this.http.listen(port, host, () => {
            console.log(`✅ Server running at http://${host}:${port}`);
        });
    }
}

const app = new Server();
app.appExecute();
