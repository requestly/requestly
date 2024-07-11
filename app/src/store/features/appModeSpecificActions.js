export const updateDesktopSpecificDetails = (prevState, action) => {
  Object.assign(prevState.desktopSpecificDetails, action.payload);
};

export const updateUserCountry = (prevState, action) => {
  prevState.country = action.payload;
};

export const updateInitializations = (prevState, action) => {
  prevState.initializations[action.payload.initType] = action.payload.initValue;
};

export const updateDesktopSpecificAppProperty = (prevState, action) => {
  const { appId, property, value } = action.payload;

  prevState.desktopSpecificDetails.appsList[appId][property] = value;
};

export const updateDesktopAppsList = (prevState, action) => {
  const { appsList } = action.payload;
  prevState.desktopSpecificDetails.appsList = appsList;
};

export const updateHasConnectedApp = (prevState, action) => {
  prevState.misc.persist.hasConnectedApp = action.payload;
};

export const updateIsExtensionEnabled = (prevState, action) => {
  prevState.isExtensionEnabled = action.payload;
};
