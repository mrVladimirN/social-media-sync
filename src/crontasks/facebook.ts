/* eslint-disable max-len */
/* eslint-disable @typescript-eslint/no-explicit-any */
import cron from 'node-cron';
import axios from 'axios';
import logger from '../config/logger';
import { fileAccumulator } from './factory';

class FacebookCronTask {
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
        await this.post(textToBePosted, uploadMediaIds);
      })
    );
  }

  private async uploadMedia(
    mediaLink: string,
    mimeType: string
  ) {
    try {
      let uploadMediaData;
      if (['image/bmp', 'image/jpeg', 'image/x-png', 'image/png', 'image/gif'].includes(mimeType)) {
        uploadMediaData = await axios.post(
          `https://graph.facebook.com/v19.0/${process.env.FACEBOOK_PAGE_ID}/photos?access_token=${process.env.FACEBOOK_PAGE_ACCESS_TOKEN}`,
          {
            url: mediaLink,
            published: false
          }
        );
      } else {
        uploadMediaData = await axios.post(
          `https://graph.facebook.com/v19.0/${process.env.FACEBOOK_PAGE_ID}/videos?access_token=${process.env.FACEBOOK_PAGE_ACCESS_TOKEN}`,
          {
            url: mediaLink,
            published: false
          }
        );
      }

      return uploadMediaData.data.id;
    } catch (error:unknown) {
      logger.error('Error uploading media', (error as Error).message);
      throw error;
    }
  }

  private async post(textToBePosted: string, uploadMediaIds: string[]): Promise<void> {
    try {
      const attachedMedia = uploadMediaIds.map((mediaId) => ({ media_fbid: mediaId }));

      const postData = {
        message: textToBePosted,
        attached_media: attachedMedia,
        access_token: process.env.FACEBOOK_PAGE_ACCESS_TOKEN
      };

      const response = await axios.post(
        `https://graph.facebook.com/v19.0/${process.env.FACEBOOK_PAGE_ID}/feed`,
        postData
      );

      logger.info('Post created successfully:', response.data);
    } catch (error: unknown) {
      logger.error('Error creating post:', (error as Error).message);
      throw error;
    }
  }
}
export default FacebookCronTask;
