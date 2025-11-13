const IPC_TIMEOUT = 15000;

class TimoutError extends Error {
  constructor(method: string) {
    super(
      `IPC Timeout: no response for [${method}] RPC call. Please make sure method is implemented correctly in Background process`
    );
  }
}

export function rpc(
  params: {
    namespace: string;
    method: string;
    timeout?: number;
  },
  ...args: any[]
) {
  const { namespace, method, timeout } = params;
  console.log("dgb1: calling ", namespace, method, args, Date.now());
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      console.log("dgb1: timed out calling ", namespace, method, args, Date.now());
      reject(new TimoutError(method));
    }, timeout || IPC_TIMEOUT);

    window.RQ.DESKTOP.SERVICES.IPC.invokeEventInBG(`${namespace}-${method}`, args)
      .then((res: any) => {
        if (res.success) {
          console.log("dgb1: received result ", namespace, method, args, Date.now());
          resolve(res.data);
        } else {
          console.log("dgb1: errored call ", namespace, method, args, Date.now());
          reject(res.data);
        }
      })
      .catch((e) => {
        console.log("dgb1: errored call ", namespace, method, args, Date.now());
        throw e;
      })
      .catch(reject);
  });
}

export async function rpcWithRetry(
  params: {
    namespace: string;
    method: string;
    retryCount: number;
    timeout: number;
  },
  ...args: any[]
) {
  let retries = params.retryCount;
  while (retries >= 0) {
    console.log("attempt", retries);
    try {
      return await rpc(
        {
          namespace: params.namespace,
          method: params.method,
          timeout: params.timeout,
        },
        ...args
      );
    } catch (err) {
      console.log("attempt error", retries, err);
      if (err instanceof TimoutError) {
        retries--;
        continue;
      }
      console.log("weird error", retries, err);
      throw err;
    }
  }
}

/* Expects the service to be present in Desktop background process */
export default class BackgroundServiceAdapter {
  private RPC_CHANNEL_PREFIX: string;
  private LIVE_EVENTS_CHANNEL: string;

  constructor(serviceName: string) {
    if (window?.RQ?.MODE !== "DESKTOP") {
      throw new Error("BackgroundServiceAdapter is only supported in desktop app!");
    }
    this.RPC_CHANNEL_PREFIX = `${serviceName}`;
    this.LIVE_EVENTS_CHANNEL = `SERVICE-${serviceName}-LIVE-EVENTS`;
  }

  protected invokeProcedureInBG(method: string, ...args: any): Promise<any> {
    return rpc(
      {
        namespace: this.RPC_CHANNEL_PREFIX,
        method,
      },
      ...args
    );
  }

  protected async invokeProcedureInBGWithRetries(
    method: string,
    config: { retryCount: number; timeout: number },
    ...args: any
  ): Promise<any> {
    return await rpcWithRetry(
      {
        namespace: this.RPC_CHANNEL_PREFIX,
        method,
        timeout: config.timeout,
        retryCount: config.retryCount,
      },
      ...args
    );
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
