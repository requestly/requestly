export const waitForPromiseToSettle = async (promise: Promise<any>, timeoutMillis: number) => {
  let isResolved = false;
  let isRejected = false;

  const timeoutPromise = new Promise((_, reject) => {
    setTimeout(() => {
      if (!isResolved && !isRejected) {
        reject(new Error("Promise did not settle within the specified timeout."));
      }
    }, timeoutMillis);
  });

  return Promise.race([promise, timeoutPromise])
    .then((result) => {
      isResolved = true;
      return result;
    })
    .catch((error) => {
      isRejected = true;
      throw error;
    });
};
