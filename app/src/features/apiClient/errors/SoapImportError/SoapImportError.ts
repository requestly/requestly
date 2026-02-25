import { NativeError } from "errors/NativeError";

export enum WsdlFetchErrorType {
  INVALID_URL = "INVALID_URL",
  FETCH_FAILED = "FETCH_FAILED",
  INVALID_RESPONSE = "INVALID_RESPONSE",
  NETWORK_ERROR = "NETWORK_ERROR",
  TIMEOUT = "TIMEOUT",
}

export const SOAP_IMPORT_ERROR_MESSAGES: Record<WsdlFetchErrorType, string> = {
  [WsdlFetchErrorType.INVALID_URL]: "Please enter a valid WSDL URL",
  [WsdlFetchErrorType.FETCH_FAILED]: "Failed to fetch WSDL from the provided URL",
  [WsdlFetchErrorType.INVALID_RESPONSE]: "The response does not appear to be valid WSDL/XML",
  [WsdlFetchErrorType.NETWORK_ERROR]: "Network error while fetching WSDL",
  [WsdlFetchErrorType.TIMEOUT]: "Request timeout while fetching WSDL",
};

export class WsdlFetchError extends NativeError {
  constructor(readonly errorType: WsdlFetchErrorType, customMessage?: string, readonly originalError?: unknown) {
    const message = customMessage || SOAP_IMPORT_ERROR_MESSAGES[errorType];
    super(message);
    this.name = "WsdlFetchError";

    if (originalError) {
      this.cause = originalError;
    }

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }

  static invalidUrl(originalError?: unknown) {
    return new WsdlFetchError(WsdlFetchErrorType.INVALID_URL, undefined, originalError);
  }

  static fetchFailed(customMessage?: string, originalError?: unknown) {
    return new WsdlFetchError(WsdlFetchErrorType.FETCH_FAILED, customMessage, originalError);
  }

  static invalidResponse(originalError?: unknown) {
    return new WsdlFetchError(WsdlFetchErrorType.INVALID_RESPONSE, undefined, originalError);
  }

  static networkError(customMessage?: string, originalError?: unknown) {
    return new WsdlFetchError(WsdlFetchErrorType.NETWORK_ERROR, customMessage, originalError);
  }

  static timeout(originalError?: unknown) {
    return new WsdlFetchError(WsdlFetchErrorType.TIMEOUT, undefined, originalError);
  }
}
