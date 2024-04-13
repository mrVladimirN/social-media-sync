/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable no-use-before-define */
/* eslint-disable no-underscore-dangle */

import { drive_v3 as GoogleDrive, google } from 'googleapis';
import { FileToBePosted } from 'src/types';
import GoogleDriveCronTask from './google-drive-extractor';
import TwitterCronTask from './twitter';
import FacebookCronTask from './facebook';

const { TwitterApi } = require('twitter-api-v2');

export const fileAccumulator: FileToBePosted[] = [];

export default class CronFactory {
  private static _instance: CronFactory;

  private static GoogleDriveCronTask: GoogleDriveCronTask;

  private static TwitterCronTask: TwitterCronTask;

  private static FacebookCronTask: FacebookCronTask;

  constructor() {
    if (CronFactory._instance) {
      throw new Error('Use Factory getInstance() instead');
    }
    CronFactory._instance = this;

    const googleAuth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_CLIENT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY!.replace(/\\n/g, '\n')
      },
      scopes: ['https://www.googleapis.com/auth/drive']
    });

    const twitterClient = new TwitterApi({
      appKey: process.env.TWITTER_CLIENT_API_KEY,
      appSecret: process.env.TWITTER_CLIENT_API_SECRET,
      accessToken: process.env.TWITTER_ACCESS_TOKEN,
      accessSecret: process.env.TWITTER_ACESS_TOKEN_SECRET
    }).readWrite;

    const twitterBearer = new TwitterApi(process.env.TWITTER_BEARER).readOnly;

    // Initialize Google Drive API using the authentication client
    const driveClient: GoogleDrive.Drive = google.drive({
      version: 'v3',
      auth: googleAuth
    });

    CronFactory.GoogleDriveCronTask = new GoogleDriveCronTask(driveClient);
    CronFactory.TwitterCronTask = new TwitterCronTask(
      twitterClient,
      twitterBearer
    );
    CronFactory.FacebookCronTask = new FacebookCronTask();
  }

  static getInstance(): CronFactory {
    return CronFactory._instance || new CronFactory();
  }

  getGoogleDriveCronTaskInstance(): GoogleDriveCronTask {
    return CronFactory.GoogleDriveCronTask;
  }

  getTwitterCronTaskInstance(): TwitterCronTask {
    return CronFactory.TwitterCronTask;
  }

  getFacebookCronTaskInstance(): FacebookCronTask {
    return CronFactory.FacebookCronTask;
  }
}
