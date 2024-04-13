type DriveFileFolder = {
  mimeType: string;
  id: string;
  name: string;
};

type Content = {
  textToBePosted: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  media?: { mediaLink: string; mimeType: string }[];
  originalFile: string;
};
type FileToBePosted = {
  content: Content;
};

export { DriveFileFolder, FileToBePosted };
