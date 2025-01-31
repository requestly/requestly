import { PayloadAction } from "@reduxjs/toolkit";

export const updateAppLanguage = (prevState: any, action: PayloadAction<string>) => {
  prevState.appLanguage = action.payload;
};

// TODO: MOVE OTHER MISC ACTIONS HERE
export const updateLastVisitedPath = (prevState: any, action: PayloadAction<string>) => {
  prevState.misc.persist.lastVisitedPath = action.payload;
};
