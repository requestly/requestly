import { isEmpty } from "lodash";
import { FileType, MockType, RQMockMetadataSchema } from "../types";

export const oldMockToNewMockMetadataAdapter = (uid: string, data: any): RQMockMetadataSchema => {
  let url = "";

  if (!isEmpty(data?.path)) {
    url = `https://${uid.toLowerCase()}.requestly.me/${data.path}`;
  } else {
    url = `https://requestly.me/${data.mockID}`;
  }

  const mockMetadata: RQMockMetadataSchema = {
    id: data?.mockID,
    type: MockType.API,
    fileType: null,
    name: data?.name,
    method: data?.method,
    endpoint: data?.path,
    updatedTs: data?.modifiedTime,
    isOldMock: true,
    url: url,
  };

  return mockMetadata;
};

export const oldFileMockToNewMockMetadataAdapter = (uid: string, data: any): RQMockMetadataSchema => {
  let fileType = FileType.JS;

  switch (data?.contentType) {
    case "text/html":
      fileType = FileType.HTML;
      break;
    case "text/css":
      fileType = FileType.CSS;
      break;
    case "application/javascript":
      fileType = FileType.JS;
      break;
    case "image/png":
    case "image/jpeg":
      fileType = FileType.IMAGE;
      break;
  }

  const mockMetadata: RQMockMetadataSchema = {
    id: data?.mockID,
    type: MockType.FILE,
    fileType: fileType,
    name: data?.name,
    method: data?.method,
    endpoint: data?.path,
    updatedTs: data?.modifiedTime,
    url: data?.shortUrl,
    isOldMock: true,
    oldMockFilePath: data?.filePath,
  };

  return mockMetadata;
};
