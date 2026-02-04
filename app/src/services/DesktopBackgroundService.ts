import type { RpcTransport } from "capnweb";
import { newMessagePortRpcSession, RpcSession } from "capnweb";
// import { WebAppTransport, isCapnWebAvailable } from "./WebAppTransport";
// import type { IHelloWorldService } from "./types";

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


/**
 * WebAppTransport for Cap'n Web RPC
 *
 * This implements Cap'n Web's RpcTransport interface for the Web App.
 * It uses window.rpcBridge (exposed by preload.js) to communicate
 * through the Main Process relay to the Background Window.
 *
 * Copy this file to your web app (app.requestly.io) to use Cap'n Web RPC.
 */

// import type { RpcBridge } from "./types";

/**
 * RpcTransport implementation for the Web App.
 *
 * This transport is used by Cap'n Web to send/receive messages.
 * The Web App acts as the "client" - it calls methods on RpcTarget
 * instances hosted in the Background Window.
 */
export class WebAppTransport implements RpcTransport {
  private messageQueue: string[] = [];
  private waitingReceivers: Array<(msg: string) => void> = [];
  private unsubscribe: (() => void) | null = null;
  private isAborted = false;
  private abortError: Error | null = null;
  private bridge: any;

  constructor() {
    if (!window.rpcBridge) {
      throw new Error(
        "window.rpcBridge is not available. " +
        "Make sure you're running in the Requestly Desktop App."
      );
    }

    this.bridge = window.rpcBridge;
    this.setupSubscription();
    console.log("[WebAppTransport] Initialized");
  }

  private setupSubscription() {
    this.unsubscribe = this.bridge.subscribe((message: string) => {
      console.log("[WebAppTransport] Received message:", message.substring(0, 100) + "...");

      if (this.waitingReceivers.length > 0) {
        // Someone is waiting for a message, give it to them immediately
        const resolve = this.waitingReceivers.shift()!;
        resolve(message);
      } else {
        // No one waiting, queue the message
        this.messageQueue.push(message);
      }
    });
  }

  /**
   * Send a message to the Background Window (via Main Process relay)
   */
  async send(message: string): Promise<void> {
    if (this.isAborted) {
      throw this.abortError || new Error("Transport has been aborted");
    }

    console.log("[WebAppTransport] Sending message:", message.substring(0, 100) + "...");
    this.bridge.send(message);
  }

  /**
   * Receive the next message from the Background Window
   * This will wait until a message arrives if none are queued.
   */
  async receive(): Promise<string> {
    if (this.isAborted) {
      throw this.abortError || new Error("Transport has been aborted");
    }

    // Check if we have a queued message
    if (this.messageQueue.length > 0) {
      return this.messageQueue.shift()!;
    }

    // Wait for the next message
    return new Promise((resolve, reject) => {
      if (this.isAborted) {
        reject(this.abortError || new Error("Transport has been aborted"));
        return;
      }

      this.waitingReceivers.push(resolve);
    });
  }

  /**
   * Abort the transport - called when the connection should be terminated
   */
  abort(reason?: any): void {
    console.log("[WebAppTransport] Aborting:", reason);
    this.isAborted = true;
    this.abortError = reason instanceof Error ? reason : new Error(String(reason || "Transport aborted"));

    // Clear any waiting receivers
    this.waitingReceivers = [];
    this.messageQueue = [];

    // Unsubscribe from messages
    this.unsubscribe?.();
    this.unsubscribe = null;
  }
}

/**
 * Helper function to check if Cap'n Web RPC is available
 */
export function isCapnWebAvailable(): boolean {
  return typeof window !== "undefined" && !!window.rpcBridge;
}

export interface IHelloWorldService {
  /** Simple greeting */
  greet(name: string): string;

  /** Returns current timestamp */
  getTimestamp(): number;

  /** Echo back whatever is sent */
  echo<T>(data: T): T;

  /** Simulates an async operation */
  delayedGreet(name: string, delayMs: number): Promise<string>;

  /** Returns system info from the background process */
  getSystemInfo(): {
    platform: string;
    nodeVersion: string;
    electronVersion: string;
    pid: number;
  };

  /** Add two numbers - simple computation test */
  add(a: number, b: number): number;

  /** Throws an error - for testing error handling */
  throwError(message: string): never;
}

export function createHelloWorldSession() {
  if (!isCapnWebAvailable()) {
    console.log("Not running in desktop app - Cap'n Web RPC not available");
    return null;
  }

  const transport = new WebAppTransport();
  const session = new RpcSession<IHelloWorldService>(transport);
  const api = session.getRemoteMain();

  return { session, api };
}

/**
 * RpcBridge-Backed MessagePort for Web App
 *
 * This creates a MessagePort-like interface backed by window.rpcBridge.
 * Use with newMessagePortRpcSession() to get Cap'n Web's native session
 * without writing a custom RpcTransport.
 *
 * Usage:
 *   import { newMessagePortRpcSession } from "capnweb";
 *
 *   const port = new RpcBridgeBackedMessagePort();
 *   const api = newMessagePortRpcSession<IHelloWorldService>(port);
 *
 *   const greeting = await api.greet("World");
 */

declare global {
  interface Window {
    rpcBridge?: {
      send: (message: string | null) => void;
      subscribe: (callback: (message: string) => void) => () => void;
    };
  }
}

export class RpcBridgeBackedMessagePort {
  private messageListeners: Array<(event: { data: any }) => void> = [];
  private errorListeners: Array<(event: { data: any }) => void> = [];
  private unsubscribe: (() => void) | null = null;
  private bridge: NonNullable<Window['rpcBridge']>;
  private started = false;

  constructor() {
    if (!window.rpcBridge) {
      throw new Error(
        "window.rpcBridge is not available. " +
        "Make sure you're running in the Requestly Desktop App."
      );
    }

    this.bridge = window.rpcBridge;
    console.log("[RpcBridgeBackedMessagePort] Created (waiting for start())");
  }

  /**
   * Start receiving messages.
   * Called by Cap'n Web's MessagePortTransport in its constructor.
   */
  start(): void {
    if (this.started) return;
    this.started = true;

    // Subscribe to incoming messages via rpcBridge
    this.unsubscribe = this.bridge.subscribe((data: string) => {
      console.log("[RpcBridgeBackedMessagePort] Received:", data.substring(0, 80) + '...');

      // Create MessageEvent-like object (Cap'n Web only reads .data)
      const messageEvent = { data };

      // Notify all message listeners
      this.messageListeners.forEach(listener => {
        try {
          listener(messageEvent);
        } catch (err) {
          console.error("[RpcBridgeBackedMessagePort] Listener error:", err);
        }
      });
    });

    console.log("[RpcBridgeBackedMessagePort] Started listening via rpcBridge");
  }

  /**
   * Add event listener.
   * Cap'n Web uses "message" and "messageerror" events.
   */
  addEventListener(type: string, callback: (event: { data: any }) => void): void {
    if (type === "message") {
      this.messageListeners.push(callback);
    } else if (type === "messageerror") {
      this.errorListeners.push(callback);
    }
  }

  /**
   * Send a message to the Background Window.
   * Cap'n Web sends strings, or null as a close signal.
   */
  postMessage(message: string | null): void {
    console.log("[RpcBridgeBackedMessagePort] Sending:", typeof message === 'string' ? message.substring(0, 80) + '...' : message);
    this.bridge.send(message);
  }

  /**
   * Close the port and clean up.
   * Called by Cap'n Web's MessagePortTransport in abort().
   */
  close(): void {
    console.log("[RpcBridgeBackedMessagePort] Closing");
    this.unsubscribe?.();
    this.unsubscribe = null;
    this.messageListeners = [];
    this.errorListeners = [];
    this.started = false;
  }
}

/**
 * Check if we're in the Requestly Desktop App
 */
export function isDesktopApp(): boolean {
  return typeof window !== "undefined" && !!window.rpcBridge;
}

async function exampleUsage() {
  const api = newMessagePortRpcSession<IHelloWorldService>(new RpcBridgeBackedMessagePort() as unknown as MessagePort);
  // const result = createHelloWorldSession();
  if (!api) {
    console.log("Skipping - not in desktop app");
    return;
  }

  // const { session, api } = api;

  try {
    console.group('ass');
    // Simple greeting
    console.log("--- Testing greet ---");
    const greeting = await api.greet("World");
    console.log("Greeting:", greeting);

    // Get system info
    console.log("\n--- Testing getSystemInfo ---");
    const info = await api.getSystemInfo();
    console.log("System Info:", info);

    // Echo test
    console.log("\n--- Testing echo ---");
    const echoed = await api.echo({ foo: "bar", num: 42 });
    console.log("Echoed:", echoed);

    // Arithmetic
    console.log("\n--- Testing add ---");
    const sum = await api.add(10, 32);
    console.log("10 + 32 =", sum);

    // Timestamp
    console.log("\n--- Testing getTimestamp ---");
    const timestamp = await api.getTimestamp();
    console.log("Timestamp:", timestamp, "=", new Date(timestamp).toISOString());

    // Delayed greeting (async)
    console.log("\n--- Testing delayedGreet ---");
    const delayedGreeting = await api.delayedGreet("Async World", 1000);
    console.log("Delayed greeting:", delayedGreeting);

    // Error handling
    console.log("\n--- Testing error handling ---");
    try {
      await api.throwError("This is a test error");
    } catch (error: any) {
      console.log("Caught expected error:", error.message);
    }

    const times = await Promise.all([
      api.getTimestamp(),
      api.getSystemInfo(),
      api.greet("test"),
    ]);

    console.log('times', times);

    console.log("\n--- All tests passed! ---");

  } finally {
    // Clean up the session
    (api as any)[Symbol.dispose]?.();
    console.log("Session disposed");
  }
  console.groupEnd();
}

setTimeout(() => {
  exampleUsage();
}, 10000);


// window.RQ.DESKTOP.SERVICES.IPC.onRegister((d: any) => {
  // console.log('yam', d);
  // port.start();
  // port.addEventListener('ass', (v) => {
  //   console.log('yam1', v)
  // });
  // port.onmessage = (e) => {
  //   console.log('yam2', e);
  // };
// });

// const {port1, port2} = new MessageChannel()
// window.RQ.DESKTOP.SERVICES.IPC.sendPort(port1);
