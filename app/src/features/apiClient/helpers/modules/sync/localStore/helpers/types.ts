export type ApiClientLocalDbMetadata = { version: number };

export enum ApiClientLocalDbTable {
  APIS = "apis",
  ENVIRONMENTS = "environments",
}

export interface ApiClientLocalDbInterface {
  tableName: ApiClientLocalDbTable;
}
