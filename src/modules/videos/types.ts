export type UploadFileInfo = {
  filename: string;
  originalName: string;
  url: string;
  copyCount: number;
};

export type UploadApiResponse = {
  message: string;
  files: UploadFileInfo[];
};
