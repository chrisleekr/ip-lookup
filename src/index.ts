import { buildApp } from '@/app';
import logger from '@/utils/logger';

const PORT = process.env.PORT || 3000;

const start = async (): Promise<void> => {
  try {
    const app = await buildApp();
    await app.listen({ port: Number(PORT), host: '0.0.0.0' });
    logger.info(`Server is running on port ${PORT}`);
  } catch (err) {
    logger.error('Failed to start server:', {
      error: err instanceof Error ? err.message : String(err),
      stack: err instanceof Error ? err.stack : undefined,
    });
    process.exit(1);
  }
};

start();
