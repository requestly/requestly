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
export const updateSingleChoicePersonaFields = (prevState, action) => {
  prevState.userPersona[action.payload.key] = action.payload.value;
};

export const updateSelectedPersonaUseCase = (prevState, action) => {
  const { useCases } = prevState.userPersona;
  const { payload } = action;

  const index = useCases.findIndex(
    (option) => JSON.stringify(option) === JSON.stringify(payload)
  );

  if (index === -1) {
    prevState.userPersona.useCases = [...useCases, payload];
  } else {
    prevState.userPersona.useCases = [
      ...useCases.slice(0, index),
      ...useCases.slice(index + 1),
    ];
  }
};

export const updateOtherPersonaUseCase = (prevState, action) => {
  const { useCases } = prevState.userPersona;
  const { payload } = action;

  const index = useCases.findIndex((option) => option.optionType === "other");

  if (index === -1) {
    if (payload.value.length) {
      prevState.userPersona.useCases.push(payload);
    }
  } else {
    if (payload.value.length) {
      prevState.userPersona.useCases[index].value = payload.value;
    } else {
      prevState.userPersona.useCases.splice(index, 1);
    }
  }
};

export const updateIsPersonaSurveyCompleted = (prevState, action) => {
  prevState.userPersona.isSurveyCompleted = action.payload;
};
export const updatePersonaSurveyPage = (prevState, action) => {
  prevState.userPersona.page = action.payload;
};
