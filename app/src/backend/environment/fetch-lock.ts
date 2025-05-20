import { withTimeout, Mutex } from "async-mutex";
export class MutexTimeoutError extends Error { }
export const fetchLock = withTimeout(new Mutex(), 0, new MutexTimeoutError());
