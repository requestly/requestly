export const retryOrFailSilently = (
  asyncfn: () => Promise<any>,
  interval: number,
  maxTimes: number,
  maxDuration: number
) => {
  const startTime = Date.now();
  let timesTried = 0;

  const functionToRetry = () => {
    timesTried++;
    asyncfn().catch(() => {
      if (Date.now() - startTime > maxDuration) return;
      if (timesTried > maxTimes - 1) return;

      setTimeout(() => {
        functionToRetry();
      }, interval);
    });
  };
  functionToRetry();
};

export const detectUnsettledPromise = async (promise: Promise<any>, timeoutMillis: number) => {
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
