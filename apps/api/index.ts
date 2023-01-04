import app from './app';
import http from 'http';
import logger from './utils/logger';

const port = process.env.PORT || 3003;
app.set('port', port);

http.createServer(app);

logger.info(`Server is running on port ${port}.`);
