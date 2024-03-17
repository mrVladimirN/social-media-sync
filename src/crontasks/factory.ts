/* eslint-disable no-use-before-define */
/* eslint-disable no-underscore-dangle */

import { drive_v3 as GoogleDrive, google } from 'googleapis';
import GoogleDriveCronTask from './google-drive-extractor';

export default class CronFactory {
  private static _instance: CronFactory;

  private static GoogleDriveCronTask: GoogleDriveCronTask;

  constructor() {
    if (CronFactory._instance) {
      throw new Error('Use Factory getInstance() instead');
    }
    CronFactory._instance = this;
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_CLIENT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY!.replace(/\\n/g, '\n')
      },
      scopes: ['https://www.googleapis.com/auth/drive']
    });

    // Initialize Google Drive API using the authentication client
    const drive: GoogleDrive.Drive = google.drive({ version: 'v3', auth });

    CronFactory.GoogleDriveCronTask = new GoogleDriveCronTask(drive);
  }

  static getInstance(): CronFactory {
    return CronFactory._instance || new CronFactory();
  }

  getGoogleDriveCronTaskInstance(): GoogleDriveCronTask {
    return CronFactory.GoogleDriveCronTask;
  }
}
