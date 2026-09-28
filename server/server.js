const app = require('./app');
const config = require('./config/env');
const connectDB = require('./config/db');
const verifyDatabase = require('./utils/verifyDatabase');

const startServer = async () => {
  try {
    await connectDB();
    await verifyDatabase();

    const server = app.listen(config.port, () => {
      console.log(`[InterviewHub Server]: Running on http://localhost:${config.port} (${config.nodeEnv} mode)`);
    });

    const handleShutdown = (signal) => {
      console.log(`[Server Notice]: Received ${signal}. Shutting down gracefully...`);
      server.close(() => {
        console.log('[Server Notice]: Express server closed.');
        process.exit(0);
      });
    };

    process.on('SIGTERM', () => handleShutdown('SIGTERM'));
    process.on('SIGINT', () => handleShutdown('SIGINT'));
  } catch (error) {
    console.error(`[Server Fatal Error]: ${error.message}`);
    process.exit(1);
  }
};

startServer();
