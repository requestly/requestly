import { withTimeout, Mutex } from "async-mutex";

export const fetchLock = withTimeout(new Mutex(), 0);
