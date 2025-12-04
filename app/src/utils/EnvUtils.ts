enum NODE_ENV {
  DEVELOPMENT = "development",
  PRODUCTION = "production",
}

enum BACKEND_ENV {
  PROD = "prod",
  BETA = "beta",
  EMULATOR = "emulator",
}

const getBackendEnv = () => {
  return process.env.VITE_BACKEND_ENV as BACKEND_ENV;
};

const getNodeEnv = () => {
  return process.env.NODE_ENV as NODE_ENV;
};

console.log("getBackendEnv()", getBackendEnv());
console.log("VITE_BACKEND_ENV", process.env.VITE_BACKEND_ENV);
console.log("getBuildEnv()", getNodeEnv());
console.log("VITE_BACKEND_BASE_URL", process.env.VITE_BACKEND_BASE_URL);
console.log("MODE", import.meta.env.MODE);

/* When running local emulator */
export const isBackendEnvEmulator = (): boolean => {
  return getBackendEnv() === BACKEND_ENV.EMULATOR;
};

/* When backend is requestly beta */
export const isBackendEnvBeta = (): boolean => {
  return getBackendEnv() === BACKEND_ENV.BETA;
};

export const isNodeEnvDev = (): boolean => {
  return getNodeEnv() === NODE_ENV.DEVELOPMENT;
};

const detectHeadless = () => {
  return /HeadlessChrome/.test(window.navigator.userAgent) === true;
};

function bypassAutomation() {
  return localStorage.getItem("__BYPASS_AUTOMATION___");
}

export const isEnvAutomation = () => {
  return !bypassAutomation() && (window.navigator.webdriver === true || detectHeadless());
};
