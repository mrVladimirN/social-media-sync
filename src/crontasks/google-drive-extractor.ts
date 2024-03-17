import { drive_v3 as GoogleDrive } from 'googleapis';
import cron from 'node-cron';
import logger from '../config/logger';
import { DriveFileFolder } from '../types';

class GoogleDriveCronTask {
  private drive: GoogleDrive.Drive;

  constructor(drive: GoogleDrive.Drive) {
    this.drive = drive;
  }

  public async start(): Promise<void> {
    // Schedule the task to run every minute
    cron.schedule('* * * * *', async () => {
      await this.executeTask();
    });

    // Run the task immediately when starting the app
    await this.executeTask();
  }

  private async executeTask(): Promise<void> {
    try {
      // Extract post files from Google Drive
      const folders = await this.extractPostFiles();

      // Process files and documents
      await this.processFiles(folders);

      logger.info('Successfully completed task.');
    } catch (error) {
      logger.error('Error executing task:', error);
    }
  }

  private async extractPostFiles(): Promise<DriveFileFolder[]> {
    const response = await this.drive.files.list({
      pageSize: 1,
      q: "name contains 'Post'",
      fields: 'files(id, name, mimeType)'
    });
    return response.data.files as DriveFileFolder[];
  }

  private async processFiles(folders: DriveFileFolder[]): Promise<void> {
    await Promise.all(
      folders.map(async (folder) => {
        const response = await this.drive.files.list({
          q: `'${folder.id}' in parents and mimeType = 'application/vnd.google-apps.document'`,
          fields: 'files(id, name)'
        });

        const files: DriveFileFolder[] = response.data.files as DriveFileFolder[];
        logger.info(`Files in folder '${folder.name}':`);
        await this.processDocuments(files);
      })
    );
  }

  private async processDocuments(documents: DriveFileFolder[]): Promise<void> {
    await Promise.all(
      documents.map(async (document) => {
        const response = await this.drive.files.export({
          fileId: document.id,
          mimeType: 'text/plain'
        });

        const content = response.data;
        logger.info(`Content of document '${document.name}':`);
        logger.info(content);
      })
    );
  }
}

export default GoogleDriveCronTask;
