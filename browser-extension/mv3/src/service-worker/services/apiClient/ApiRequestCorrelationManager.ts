class ApiRequestCorrelationManager {
  private handlers: Map<string, Function> = new Map(); // requestlyId to handler
  private webRequestToRqIdMap: Map<string, string> = new Map(); // webRequestId to requestlyId

  addHandler(rqId: string, fn: Function) {
    if (!rqId || !fn) {
      return;
    }

    this.handlers.set(rqId, fn);
  }

  linkWebRequestToRqId(webRequestId: string, rqId: string) {
    if (!webRequestId || !rqId) {
      return;
    }
    this.webRequestToRqIdMap.set(webRequestId, rqId);
  }

  invokeHandler(requestDetails: chrome.webRequest.WebResponseHeadersDetails) {
    const networkId = requestDetails.requestId;
    const rqId = this.webRequestToRqIdMap.get(networkId);
    const handler = this.handlers.get(rqId);

    if (handler) {
      handler(requestDetails);
      this.handlers.delete(networkId);
      this.webRequestToRqIdMap.delete(networkId);
    }
  }

  removeHandler(rqId: string) {
    if (!rqId) {
      return;
    }

    this.handlers.delete(rqId);
  }
}

export const apiRequestCorrelationManager = new ApiRequestCorrelationManager();
