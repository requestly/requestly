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
  const rpcId = `${namespace}-${method}-${Date.now()}`;
  const startTime = performance.now();

  console.log(`[RPC] Starting ${rpcId} with timeout ${timeout || IPC_TIMEOUT}ms`);

  return new Promise((resolve, reject) => {
    const timeoutId = setTimeout(() => {
      const elapsed = performance.now() - startTime;
      console.error(`[RPC] ❌ TIMEOUT ${rpcId} after ${elapsed.toFixed(2)}ms`);
      reject(new TimoutError(method));
    }, timeout || IPC_TIMEOUT);

    window.RQ.DESKTOP.SERVICES.IPC.invokeEventInBG(`${namespace}-${method}`, args)
      .then((res: any) => {
        clearTimeout(timeoutId);
        const elapsed = performance.now() - startTime;
        console.log(`[RPC] ✅ Success ${rpcId} in ${elapsed.toFixed(2)}ms`);

        if (res.success) {
          resolve(res.data);
        } else {
          console.error(`[RPC] ❌ Response error ${rpcId}:`, res.data);
          reject(res.data);
        }
      })
      .catch((err) => {
        clearTimeout(timeoutId);
        const elapsed = performance.now() - startTime;
        console.error(`[RPC] ❌ IPC error ${rpcId} after ${elapsed.toFixed(2)}ms:`, err);
        reject(err);
      });
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
  const maxRetries = params.retryCount;
  let retries = maxRetries;
  const startTime = performance.now();

  console.log(
    `[RPC-RETRY] Starting ${params.namespace}-${params.method} with ${maxRetries} retries, ${params.timeout}ms timeout per attempt`
  );

  while (retries >= 0) {
    const attemptNum = maxRetries - retries + 1;
    console.log(`[RPC-RETRY] Attempt ${attemptNum}/${maxRetries + 1}`, {
      namespace: params.namespace,
      method: params.method,
      retries,
      args,
    });

    try {
      const result = await rpc(
        {
          namespace: params.namespace,
          method: params.method,
          timeout: params.timeout,
        },
        ...args
      );

      const totalTime = performance.now() - startTime;
      console.log(`[RPC-RETRY] ✅ Success after ${attemptNum} attempt(s), total time: ${totalTime.toFixed(2)}ms`);

      return result;
    } catch (err: any) {
      const totalTime = performance.now() - startTime;
      console.log(`[RPC-RETRY] Attempt ${attemptNum} failed after ${totalTime.toFixed(2)}ms`, { error: err, retries });

      // Check if error is "No handler registered" - background process not ready yet
      const isHandlerNotReady = err?.message?.includes("No handler registered");

      if (err instanceof TimoutError || isHandlerNotReady) {
        retries--;

        if (retries < 0) {
          console.error(`[RPC-RETRY] ❌ All retries exhausted after ${totalTime.toFixed(2)}ms`);
          throw err;
        }

        if (isHandlerNotReady) {
          console.warn(
            `[RPC-RETRY] Background process not ready yet, waiting 1s before retry... (${retries} retries remaining)`
          );
          await new Promise((resolve) => setTimeout(resolve, 1000)); // Wait 1s before retry
        } else {
          console.warn(`[RPC-RETRY] Timeout, retrying immediately... (${retries} retries remaining)`);
        }
        continue;
      }

      console.error(`[RPC-RETRY] ❌ Non-retryable error, aborting:`, err);
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
