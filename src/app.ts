import { config } from 'dotenv';
import CronFactory from './crontasks/factory';

export default class SocialMediaSync {
  constructor() {
    // Load environment variables
    config();
  }

  async start(): Promise<void> {
    await CronFactory.getInstance().getGoogleDriveCronTaskInstance().start();
    // Implement your start logic here
  }

  async stop(): Promise<void> {
    // Implement your stop logic here
  }
}
