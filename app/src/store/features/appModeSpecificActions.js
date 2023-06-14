export const updateDesktopSpecificDetails = (prevState, action) => {
  Object.assign(prevState.desktopSpecificDetails, action.payload);
};

export const updateUserCountry = (prevState, action) => {
  prevState.country = action.payload;
};

// not used anywhere
export const updateTrialModeEnabled = (prevState, action) => {
  prevState.trialModeEnabled = action.payload;
};

export const updateMobileDebuggerAppDetails = (prevState, action) => {
  prevState.mobileDebugger.app = action.payload;
};

export const updateMobileDebuggerInterceptorDetails = (prevState, action) => {
  prevState.mobileDebugger.interceptor = action.payload;
};

export const updateInitializations = (prevState, action) => {
  prevState.initializations[action.payload.initType] = action.payload.initValue;
};

export const updateDesktopSpecificAppProperty = (prevState, action) => {
  const { appId, property, value } = action.payload;

  prevState.desktopSpecificDetails.appsList[appId][property] = value;
};

export const updateHasConnectedApp = (prevState, action) => {
  prevState.misc.persist.hasConnectedApp = action.payload;
};
