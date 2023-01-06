import app from './app';
import http from 'http';
import getLogger from './utils/logger';

const logger = getLogger();

const port = process.env.PORT || 3003;
app.set('port', port);

const server = http.createServer(app);

server.listen(port, () => {
  logger.info(`Server is running on port ${port}.`);
});
