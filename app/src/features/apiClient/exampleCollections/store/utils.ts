export const markAsSample = <T>(record: T) => ({ ...(record ?? {}), isSample: true } as T);
