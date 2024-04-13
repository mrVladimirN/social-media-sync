/* eslint-disable @typescript-eslint/no-explicit-any */
import { drive_v3 as GoogleDrive } from 'googleapis';
// import cron from 'node-cron';
import logger from '../config/logger';
import { DriveFileFolder } from '../types';
import { fileAccumulator } from './factory';

class GoogleDriveCronTask {
  private drive: GoogleDrive.Drive;

  constructor(drive: GoogleDrive.Drive) {
    this.drive = drive;
  }

  public async start(): Promise<void> {
    // Schedule the task to run every minute
    // cron.schedule('*/1 * * * *', async () => {
    //   await this.executeTask();
    // });

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
      q: "name contains 'Post'",
      fields: 'files(id, name, mimeType)'
    });
    return response.data.files as DriveFileFolder[];
  }

  private async processFiles(folders: DriveFileFolder[]): Promise<void> {
    await Promise.all(
      folders.map(async (folder) => {
        const response = await this.drive.files.list({
          q: `'${folder.id}' in parents`,
          fields: 'files(id, name, mimeType)'
        });

        const files: DriveFileFolder[] = response.data
          .files as DriveFileFolder[];
        logger.info(`Files in folder '${folder.name}':`);

        // Filter out documents (Google Docs) from the files list
        const documentFiles = files.filter(
          (file) => file.mimeType === 'application/vnd.google-apps.document'
        );

        // Process documents
        const postMessage = await this.processDocuments(documentFiles);

        // Logging or further processing for media files can be added here
        const mediaFiles = await this.processMediaFiles(files.filter(
          (file) => file.mimeType.startsWith('image/')
            || file.mimeType.startsWith('video/')
        ));
        fileAccumulator.push({
          content: {
            textToBePosted: postMessage,
            media: mediaFiles,
            originalFile: folder.name
          }
        });
      })
    );
  }

  private processMediaFiles = async (mediaFiles: DriveFileFolder[]): Promise<{ mediaLink: string; mimeType: string; }[]> => {
    const processedFiles = await Promise.all(mediaFiles.map(async (mediaFile) => {
      // Create a permission for public access
      await this.drive.permissions.create({
        fileId: mediaFile.id,
        requestBody: {
          role: 'reader',
          type: 'anyone'
        }
      });

      // Retrieve media link and MIME type
      const mediaLink = `https://drive.google.com/uc?export=download&id=${mediaFile.id}`;
      const { mimeType } = mediaFile;

      return { mediaLink, mimeType };
    }));

    return processedFiles;
  };

  private async processDocuments(
    documents: DriveFileFolder[]
  ): Promise<string> {
    let finalPost = '';
    await Promise.all(
      documents.map(async (document) => {
        const response = await this.drive.files.export({
          fileId: document.id,
          mimeType: 'text/plain'
        });

        const content = response.data;
        logger.info(`Content of document '${document.name}':`);
        logger.info(content);
        finalPost += content;
      })
    );
    return finalPost;
  }
}

export default GoogleDriveCronTask;
