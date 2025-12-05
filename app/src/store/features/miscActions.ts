import { PayloadAction } from "@reduxjs/toolkit";

export const updateAppLanguage = (prevState: any, action: PayloadAction<string>) => {
  prevState.appLanguage = action.payload;
};

// TODO: MOVE OTHER MISC ACTIONS HERE
export const updateLastUsedFeaturePath = (prevState: any, action: PayloadAction<string>) => {
  prevState.misc.persist.lastUsedFeaturePath = action.payload;
};

export const updatePopupConfig = (prevState: any, action: PayloadAction<any>) => {
  prevState.popupConfig = action.payload;
};

export const updateHasGeneratedAITests = (prevState: any, action: PayloadAction<boolean>) => {
  prevState.misc.persist.hasGeneratedAITests = action.payload;
};
