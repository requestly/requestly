export enum ExportType {
  REQUESTLY = "requestly",
  POSTMAN = "postman",
  OPENAPI = "openapi",
}

export interface ExportResult {
  file: {
    fileName: string;
    content: Blob;
    type: string;
  }[];
  metadata: Array<{
    key: string;
    value: string[] | number | string;
  }>;
}

export type ExporterFunction = () => ExportResult;
