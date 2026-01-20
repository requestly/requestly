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
  storagePath?: string;
}

export interface RQMockCollection {
  id?: string;
  name: string;
  desc?: string;
  path?: string;
  type: MockType;
  isFavourite?: boolean;
  recordType: MockRecordType.COLLECTION;
  ownerId: string;
  children?: RQMockMetadataSchema[];
  deleted?: boolean;
  createdTs?: number;
  updatedTs?: number;
  createdBy?: string;
  lastUpdatedBy?: string;
}

export interface RQMockSchema extends MockSchema, RQMockMetadataSchema {}

export enum MockListSource {
  PICKER_MODAL,
}

export type MockTableHeaderFilter = "all" | "starred";
