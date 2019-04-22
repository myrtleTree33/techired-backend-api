// load environment variables
const dotenv = require('dotenv');
dotenv.config();

import https from 'https';
import fs from 'fs';
// import logger
import logger from './logger';
// import app
import app from './app';

const { PORT = 8080, SSL_CERT_PATH, SSL_KEY_PATH } = process.env;

const key = fs.readFileSync(SSL_KEY_PATH);
const cert = fs.readFileSync(SSL_CERT_PATH);

const options = { key, cert };

const httpsServer = https.createServer(options, app);
httpsServer.listen(PORT, () => logger.info(`Listening on port ${PORT}`)); // eslint-disable-line no-console
