export const updateAppMode = (prevState, action) => {
  prevState.appMode = action.payload.appMode ? action.payload.appMode : prevState.appMode;
};

export const updateAppTheme = (prevState, action) => {
  prevState.appTheme = action.payload.appTheme;
};
