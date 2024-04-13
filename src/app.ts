import { config } from 'dotenv';
import express, { Express } from 'express';
import cors from 'cors';
import * as http from 'http';
import logger from './config/logger';
import CronFactory from './crontasks/factory';

export default class SocialMediaSync {
  private expressApp: Express = express();

  private httpServer: http.Server | undefined;

  constructor() {
    this.expressApp.use(
      cors({
        origin: '*',
        methods: 'GET, POST, OPTIONS, PUT, PATH, DELETE',
        allowedHeaders: [
          'Access-Control-Allow-Headers',
          'Content-Type, Authorization'
        ],
        credentials: true
      })
    );
    this.expressApp.use(express.json());
    // Load environment variables
    config();
  }

  async start(): Promise<void> {
    // const port: number = process.env.SOCIAL_MEDIA_SYNC_PORT
    //   ? +process.env.SOCIAL_MEDIA_SYNC_PORT
    //   : 0;

    // this.httpServer = this.expressApp.listen(port, '0.0.0.0', () => {
    //   logger.info(
    //     `server is listening on ${process.env.SOCIAL_MEDIA_SYNC_PORT}`
    //   );
    // });
    // this.httpServer.on('error', (error) => {
    //   logger.error(error);
    // });
    await CronFactory.getInstance().getGoogleDriveCronTaskInstance().start();
    await CronFactory.getInstance().getTwitterCronTaskInstance().start();
    await CronFactory.getInstance().getFacebookCronTaskInstance().start();
  }

  async stop(): Promise<void> {
    // return Promise.resolve().then(async () => {
    //   this.httpServer?.close();
    // });
  }
}
