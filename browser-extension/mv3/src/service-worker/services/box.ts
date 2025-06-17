class Box {
  private registeredHandlers: Map<string, Function> = new Map();
  private rqHandlers: Map<string, Function> = new Map();

  addHandler(rqId: string, fn: Function) {
    if (!rqId || !fn) {
      return;
    }

    console.log("!!!debug", "addhandler callled", rqId, fn);
    this.rqHandlers.set(rqId, fn);
  }

  registerHandler(networkId: string, rqId: string) {
    if (!rqId || !networkId) {
      return;
    }

    console.log("!!!debug", "registerHandler called", rqId, networkId);

    const handler = this.rqHandlers.get(rqId);
    if (handler) {
      this.registeredHandlers.set(networkId, handler);
      this.rqHandlers.delete(rqId);
    }
  }

  invokeHandler(requestDetails: chrome.webRequest.WebResponseHeadersDetails) {
    const networkId = requestDetails.requestId;
    const handler = this.registeredHandlers.get(networkId);

    console.log("!!!debug", "invokeHandler called", networkId, handler);
    if (handler) {
      handler(requestDetails);
      this.registeredHandlers.delete(networkId);
    }
  }
}

export const box = new Box();
