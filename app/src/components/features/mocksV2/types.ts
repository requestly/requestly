import { MockMetadataSchema, MockSchema } from "@requestly/mock-server";

export enum MockType {
  API = "API",
  FILE = "FILE",
}

export enum FileType {
  JS = "JS",
  CSS = "CSS",
  HTML = "HTML",
  IMAGE = "IMAGE",
}

// Extends MockSchema and adds powers Requestly Mock Server specific features
export interface RQMockMetadataSchema extends MockMetadataSchema {
  type: MockType;
  fileType?: FileType;
  isOldMock?: boolean;
  oldMockFilePath?: string;
  url?: string;
  createdBy?: string;
  lastUpdatedBy?: string;
}

export interface RQMockSchema extends MockSchema, RQMockMetadataSchema {}
