const ENV = {
  // Are set by scripts in package.json on start
  DEV: "DEV",
  EMULATOR: "EMULATOR",
};

const isEnv = (env) => {
  return process.env.REACT_APP_ENV === ENV[env];
};
/* When running local emulator */
export const isEnvEmulator = () => {
  return isEnv(ENV.EMULATOR);
};
/* When backend is requestly beta */
export const isEnvBeta = () => {
  return isEnv(ENV.DEV);
};

export const isEnvDev = () => {
  return isEnvBeta() || isEnvEmulator();
};
