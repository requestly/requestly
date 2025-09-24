import { NativeError } from "errors/NativeError";

function isMultipleInstanceError(error: any): boolean {
  const errorMessage = error?.message || "";
  return (
    errorMessage.includes("Internal error opening backing store") ||
    errorMessage.includes("UnknownError") ||
    errorMessage.includes("blocked") ||
    errorMessage.includes("QuotaExceededError")
  );
}

export function handleDexieError(error: any): never {
  if (isMultipleInstanceError(error)) {
    const nativeError = new NativeError(
      "Another instance of Requestly is already running. Please close all instances and try again."
    );
    nativeError.addContext({
      originalError: error?.message,
      errorName: error?.name,
      errorStack: error?.stack,
    });
    throw nativeError;
  }
  throw error;
}

export async function withDexieErrorHandling<T>(operation: () => Promise<T>): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    handleDexieError(error);
  }
}
