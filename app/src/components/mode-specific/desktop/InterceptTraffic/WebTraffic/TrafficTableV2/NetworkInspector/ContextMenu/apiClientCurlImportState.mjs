const API_CLIENT_CURL_IMPORT_MODAL = "CURL";
const TRAFFIC_TABLE_IMPORT_SOURCE = "traffic_table";

export const getApiClientCurlImportState = (log = {}) => ({
  modal: API_CLIENT_CURL_IMPORT_MODAL,
  curlCommand: log.requestShellCurl || "",
  source: TRAFFIC_TABLE_IMPORT_SOURCE,
  pageURL: log.url || "",
});
