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
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      reject(new TimoutError(method));
    }, timeout || IPC_TIMEOUT);

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
    // console.log(`attempt`, { ...params, retries, args, timestamp: Date.now() });
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
      // console.log(`attempt error`, { ...params, retries, err, args, timestamp: Date.now() });
      if (err instanceof TimoutError) {
        retries--;

        if (retries < 0) {
          throw err;
        }

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
