export const updateUserInfo = (prevState, action) => {
  prevState.user.loggedIn = action.payload.loggedIn;
  prevState.user.details = action.payload.details;
};

export const updateUserProfile = (prevState, action) => {
  prevState.user.details.profile = action.payload.userProfile;

  prevState.user.details.isSyncEnabled =
    action.payload.userProfile?.isSyncEnabled || false;

  prevState.user.details.isBackupEnabled =
    action.payload.userProfile?.isBackupEnabled || false;
};

export const updateUserPlanDetails = (prevState, action) => {
  prevState.user.details.planDetails = action.payload.userPlanDetails;
  prevState.user.details.isPremium = action.payload.isUserPremium;
};

export const updateUserPreferences = (prevState, action) => {
  prevState.userPreferences[action.payload.key] = action.payload.value;
};

export const updateUsername = (prevState, action) => {
  prevState.user.details.username = action.payload.username;
};
