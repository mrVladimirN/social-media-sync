import SocialMediaSync from './app';
import logger from './config/logger';

let socialMediaSync: SocialMediaSync;
const cleanup = () => {
  if (socialMediaSync) {
    socialMediaSync.stop();
  }
  // Perform any other cleanup tasks here
};
const start = async () => {
  socialMediaSync = new SocialMediaSync();
  await socialMediaSync.start();

  // Add event listeners for cleanup
  process.on('beforeExit', cleanup);
  process.on('exit', cleanup);
  process.on('SIGINT', cleanup); // Handles Ctrl+C

  // Handle unhandled promise rejections
  process.on('unhandledRejection', (reason, promise) => {
    logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
    cleanup();
  });
};

start();
