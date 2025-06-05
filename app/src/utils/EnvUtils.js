const REACT_ENV = {
  // Are set by scripts in package.json on start
  DEV: "DEV",
  EMULATOR: "EMULATOR",
};

const isReactEnv = (env) => {
  return process.env.REACT_APP_ENV === REACT_ENV[env];
};

/* When running local emulator */
export const isEnvEmulator = () => {
  return isReactEnv(REACT_ENV.EMULATOR);
};
/* When backend is requestly beta */
export const isEnvBeta = () => {
  return isReactEnv(REACT_ENV.DEV);
};

export const isEnvDevWithBeta = () => {
  return process.env.NODE_ENV === "development" && !isEnvEmulator();
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
