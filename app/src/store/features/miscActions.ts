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

export const updateBottomSheetState = (
  prevState: any,
  action: PayloadAction<{
    context: "api_client" | "rules";
    state: {
      open?: boolean;
      placement?: "bottom" | "right";
      size?: number[];
    };
  }>
) => {
  const { context, state } = action.payload;
  if (state.open !== undefined) {
    prevState.bottomSheetOrientation[context].open = state.open;
  }
  if (state.placement !== undefined) {
    prevState.bottomSheetOrientation[context].placement = state.placement;
  }
  if (state.size !== undefined) {
    if (state.size.length === 2) {
      prevState.bottomSheetOrientation[context].size = state.size;
    }
  }
};
