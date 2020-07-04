require('dotenv').config();
const { env: { PORT = 8080, MONGODB_URL, NODE_ENV: env, HOST } } = process;
const express = require('express');
const { mongoose } = require('hexad-library-data');
const morgan = require('morgan');
const winston = require('winston');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const router = require('./routes');

/* The connection to the database will be required even before the express server can start at all. 
This will ensure that no access to the API can be stablished if the database is not running beforehand.*/
mongoose.connect(MONGODB_URL, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        // Logger configuration with Morgan and Winston
        const logger = winston.createLogger({
            level: env === 'development' ? 'debug' : 'info',
            format: winston.format.json(),
            transports: [
                new winston.transports.File({ filename: 'server.log' })
            ]
        })

        if (env !== 'production') {
            logger.add(new winston.transports.Console({
                format: winston.format.simple()
            }));
        }

        const accessLogStream = fs.createWriteStream(path.join(__dirname, 'access.log'), { flags: 'a' });

        // API init with express.js
        const api = express();

        // Middlewares to be used
        api.use(cors());
        api.use(morgan('combined', { stream: accessLogStream }));

        // Re-path to all endpoints using express.Router
        api.use('/api', router);

        // Log if the server has been successfully initiated
        api.listen(PORT, HOST, () => logger.info(`Server running and listening at http://${HOST}:${PORT}`));

        // Log if the server is abruptly disconnected
        process.on('SIGINT', () => {
            logger.info('Server abruptly stopped')

            process.exit(0)
        })
    })