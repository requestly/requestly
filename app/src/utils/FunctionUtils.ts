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
