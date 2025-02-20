export const isGlobalEnvironment = (environmentId: string) => {
  // FIXME: isGlobalEnvironment should be a method, which operates on an object or a flag.
  return environmentId === "global" || environmentId.endsWith("/environments/global.json");
};
