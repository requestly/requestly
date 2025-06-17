class ApiRequestCorrelationManager {
  private registeredHandlers: Map<string, Function> = new Map();
  private handlers: Map<string, Function> = new Map();

  addHandler(rqId: string, fn: Function) {
    if (!rqId || !fn) {
      return;
    }

    this.handlers.set(rqId, fn);
  }

  bindHandlerToRequestId(networkId: string, rqId: string) {
    if (!rqId || !networkId) {
      return;
    }

    const handler = this.handlers.get(rqId);
    if (handler) {
      this.registeredHandlers.set(networkId, handler);
      this.handlers.delete(rqId);
    }
  }

  invokeHandler(requestDetails: chrome.webRequest.WebResponseHeadersDetails) {
    const networkId = requestDetails.requestId;
    const handler = this.registeredHandlers.get(networkId);

    if (handler) {
      handler(requestDetails);
      this.registeredHandlers.delete(networkId);
    }
  }
}

export const apiRequestCorrelationManager = new ApiRequestCorrelationManager();
