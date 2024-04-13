/* eslint-disable @typescript-eslint/no-explicit-any */
import cron from 'node-cron';
import { fileAccumulator } from './factory';
import logger from '../config/logger';
import { download } from '../utils/utilities';

class TwitterCronTask {
  private twitterClient: any;

  private twitterBearer: any;

  constructor(twitterClient: any, twitterBearer: any) {
    this.twitterClient = twitterClient;
    this.twitterBearer = twitterBearer;
  }

  public async start(): Promise<void> {
    await this.executeTask();
  }

  private async executeTask(): Promise<void> {
    await Promise.all(
      fileAccumulator.map(async (filesAccumulated) => {
        const {
          content: { textToBePosted, media }
        } = filesAccumulated;
        let uploadMediaIds: string[] = [];
        if (media?.length) {
          uploadMediaIds = await Promise.all(
            media.map((m) => this.uploadMedia(m.mediaLink, m.mimeType))
          );
        }
        await this.tweet(textToBePosted, uploadMediaIds);
      })
    );
  }

  private async uploadMedia(
    mediaLink: string,
    mimeType: string
  ): Promise<string> {
    try {
      const downloadedContent = await download(mediaLink);
      // eslint-disable-next-line max-len
      const mediaId = await this.twitterClient.v1.uploadMedia(
        Buffer.from(downloadedContent as Buffer),
        { mimeType }
      );
      return mediaId;
    } catch (error) {
      logger.error('Error uploading media', error);
      throw error;
    }
  }

  private async tweet(message: string, mediaIds: string[]): Promise<void> {
    try {
      if (mediaIds.length > 0) {
        await this.twitterClient.v2.tweet({
          text: message,
          media: {
            media_ids: mediaIds
          }
        });
      } else {
        await this.twitterClient.v2.tweet(message);
      }
    } catch (error) {
      logger.error('Error uploading media', error);
      throw new Error('Error tweeting with media');
    }
  }
}

export default TwitterCronTask;
