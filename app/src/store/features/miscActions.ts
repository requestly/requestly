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

export const updateBottomSheetToggle = (
  prevState: any,
  action: PayloadAction<{ context: "api_client" | "rules"; open: boolean }>
) => {
  prevState.bottomSheetOrientation[action.payload.context].open = action.payload.open;
};

export const updateBottomSheetPlacement = (
  prevState: any,
  action: PayloadAction<{ context: "api_client" | "rules"; placement: "bottom" | "right" }>
) => {
  prevState.bottomSheetOrientation[action.payload.context].placement = action.payload.placement;
};

export const updateBottomSheetSize = (
  prevState: any,
  action: PayloadAction<{ context: "api_client" | "rules"; size: [number, number] }>
) => {
  prevState.bottomSheetOrientation[action.payload.context].size = action.payload.size;
};
