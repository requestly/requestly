export interface NetworkFilters {
  search: string;
  method: string[];
  statusCode: string[];
}

export enum FilterKeys {
  SEARCH = "search",
  METHOD = "method",
  STATUS_CODE = "statusCode",
}
