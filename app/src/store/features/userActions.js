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

//Persona Survey actions

export const updateUserPersona = (prevState, action) => {
  prevState.userPersona.persona = action.payload;
};

export const updatePersonaReferralChannel = (prevState, action) => {
  prevState.userPersona.referralChannel = action.payload;
};

export const updateSelectedPersonaUseCase = (prevState, action) => {
  let flag = false;
  for (const option of prevState.userPersona.useCases) {
    if (JSON.stringify(option) === JSON.stringify(action.payload)) {
      flag = true;
      break;
    }
  }
  if (!flag) prevState.userPersona.useCases.push(action.payload);
  else {
    prevState.userPersona.useCases = prevState.userPersona.useCases.filter(
      (useCase) => JSON.stringify(useCase) !== JSON.stringify(action.payload)
    );
  }
};

export const updateOtherPersonaUseCase = (prevState, action) => {
  let flag = false;
  for (const option of prevState.userPersona.useCases) {
    if (option.optionType === "other") {
      flag = true;
      break;
    }
  }
  if (!flag) prevState.userPersona.useCases.push(action.payload);
  else {
    if (action.payload.value.length) {
      for (const option of prevState.userPersona.useCases) {
        if (option.optionType === "other") option.value = action.payload.value;
      }
    } else {
      prevState.userPersona.useCases = prevState.userPersona.useCases.filter(
        (useCase) => useCase.optionType !== "other"
      );
    }
  }
};

export const updateIsPersonaSurveyCompleted = (prevState, action) => {
  prevState.userPersona.isSurveyCompleted = action.payload;
};
export const updatePersonaSurveyPage = (prevState, action) => {
  prevState.userPersona.page = action.payload;
};
