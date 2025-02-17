/* Expects the service to be present in Desktop background process */
export default class BackgroundServiceAdapter<MethodNames = string> {
  private RPC_CHANNEL_PREFIX: string;
  private LIVE_EVENTS_CHANNEL: string;

  private IPC_TIMEOUT = 15000;

  constructor(serviceName: string) {
    if (window?.RQ?.MODE !== "DESKTOP") {
      throw new Error("This service is only available on the desktop app");
    }
    this.RPC_CHANNEL_PREFIX = `${serviceName}-`;
    this.LIVE_EVENTS_CHANNEL = `SERVICE-${serviceName}-LIVE-EVENTS`;
  }

  protected invokeProcedureInBG(method: MethodNames, ...args: any): Promise<any> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        reject(
          new Error(
            `IPC Timeout: no response for [${method}] RPC call. Please make sure method is implemented correctly in Background process`
          )
        );
      }, this.IPC_TIMEOUT);

      window.RQ.DESKTOP.SERVICES.IPC.invokeEventInBG(`${this.RPC_CHANNEL_PREFIX}${method}`, args)
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

export abstract class Singleton<MethodNames = string> extends BackgroundServiceAdapter<MethodNames> {
  static instance: BackgroundServiceAdapter;

  static getInstance() {}
}
