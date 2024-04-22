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

export enum MockRecordType {
  MOCK = "mock",
  COLLECTION = "collection",
}

export interface RQMockCollection {
  id?: string;
  name: string;
  description?: string;
  type: MockType;
  recordType: MockRecordType.COLLECTION;
  ownerId: string;
  deleted?: boolean;
  createdTs?: number;
  updatedTs?: number;
  createdBy?: string;
  lastUpdatedBy?: string;
}

// Extends MockSchema and adds powers Requestly Mock Server specific features
export interface RQMockMetadataSchema extends MockMetadataSchema {
  type: MockType;
  fileType?: FileType;
  isOldMock?: boolean;
  oldMockFilePath?: string;
  url?: string;
  recordType?: MockRecordType;
  isFavourite?: boolean;
  collectionId?: string;
  createdBy?: string;
  lastUpdatedBy?: string;
}

export interface RQMockSchema extends MockSchema, RQMockMetadataSchema {}

export enum MockListSource {
  PICKER_MODAL,
}
