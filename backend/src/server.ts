import { createApp } from './app';
import { env } from './config/env';
import { logger } from './utils/logger';

const app = createApp();

app.listen(env.PORT, () => {
  logger.info(`RMA Manager API rodando na porta ${env.PORT} (${env.NODE_ENV})`);
});
