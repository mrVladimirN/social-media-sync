import request from 'request';

const download = (uri: string): Promise<Buffer> => new Promise((resolve, reject) => {
  request({ url: uri, encoding: null }, (error, response, body) => {
    if (error) {
      reject(error);
    } else if (response.statusCode !== 200) {
      reject(new Error(`Failed to download file. Status code: ${response.statusCode}`));
    } else {
      resolve(body);
    }
  });
});

const delay = (milliseconds: number): Promise<void> => new Promise<void>((resolve) => {
  setTimeout(() => {
    resolve();
  }, milliseconds);
});
export { download, delay };
