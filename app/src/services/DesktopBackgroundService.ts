const IPC_TIMEOUT = 15000;

export function rpc(namespace: string, method: string, ...args: any[]) {
	console.log('hhhh rpc happening', namespace, method, args);
	return new Promise((resolve, reject) => {
      setTimeout(() => {
        reject(
          new Error(
            `IPC Timeout: no response for [${method}] RPC call. Please make sure method is implemented correctly in Background process`
          )
        );
      }, IPC_TIMEOUT);

      window.RQ.DESKTOP.SERVICES.IPC.invokeEventInBG(`${namespace}-${method}`, args)
        .then((res: any) => {
          if (res.success) {
            resolve(res.data);
          } else {
            reject(res.data);
          }
        })
        .catch(reject);
    });
}

/* Expects the service to be present in Desktop background process */
export default class BackgroundServiceAdapter {
  private RPC_CHANNEL_PREFIX: string;
  private LIVE_EVENTS_CHANNEL: string;

  constructor(serviceName: string) {
    if (window?.RQ?.MODE !== "DESKTOP") {
      throw new Error('BackgroundServiceAdapter is only supported in desktop app!')
    }
    this.RPC_CHANNEL_PREFIX = `${serviceName}`;
    this.LIVE_EVENTS_CHANNEL = `SERVICE-${serviceName}-LIVE-EVENTS`;
  }

  protected invokeProcedureInBG(method: string, ...args: any): Promise<any> {
		return rpc(this.RPC_CHANNEL_PREFIX, method, ...args);
  }

  /*
    !!! Imposing only one listener at a time.
    Multiple listeners are possible but not implemented yet for simplicity.
  */
  setEventListener(listener: Function): void {
    window.RQ.DESKTOP.SERVICES.IPC.registerEvent(this.LIVE_EVENTS_CHANNEL, listener);
  }

  removeEventListeners(): void {
    window.RQ.DESKTOP.SERVICES.IPC.unregisterEvent(this.LIVE_EVENTS_CHANNEL);
  }
}
