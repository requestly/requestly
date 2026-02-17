import { NativeError } from "errors/NativeError";

export enum SoapImportErrorType {
  INVALID_URL = "INVALID_URL",
  FETCH_FAILED = "FETCH_FAILED",
  INVALID_RESPONSE = "INVALID_RESPONSE",
  NETWORK_ERROR = "NETWORK_ERROR",
  TIMEOUT = "TIMEOUT",
}

export const SOAP_IMPORT_ERROR_MESSAGES: Record<SoapImportErrorType, string> = {
  [SoapImportErrorType.INVALID_URL]: "Please enter a valid WSDL URL",
  [SoapImportErrorType.FETCH_FAILED]: "Failed to fetch WSDL from the provided URL",
  [SoapImportErrorType.INVALID_RESPONSE]: "The response does not appear to be valid WSDL/XML",
  [SoapImportErrorType.NETWORK_ERROR]: "Network error while fetching WSDL",
  [SoapImportErrorType.TIMEOUT]: "Request timeout while fetching WSDL",
};

export class SoapImportError extends NativeError {
  constructor(readonly errorType: SoapImportErrorType, customMessage?: string) {
    const message = customMessage || SOAP_IMPORT_ERROR_MESSAGES[errorType];
    super(message);
    this.name = "SoapImportError";
  }

  static invalidUrl() {
    return new SoapImportError(SoapImportErrorType.INVALID_URL);
  }

  static fetchFailed(customMessage?: string) {
    return new SoapImportError(SoapImportErrorType.FETCH_FAILED, customMessage);
  }

  static invalidResponse() {
    return new SoapImportError(SoapImportErrorType.INVALID_RESPONSE);
  }

  static networkError(customMessage?: string) {
    return new SoapImportError(SoapImportErrorType.NETWORK_ERROR, customMessage);
  }

  static timeout() {
    return new SoapImportError(SoapImportErrorType.TIMEOUT);
  }
}
