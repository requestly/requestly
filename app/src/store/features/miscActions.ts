import { PayloadAction } from "@reduxjs/toolkit";

export const updateAppLanguage = (prevState: any, action: PayloadAction<string>) => {
  prevState.appLanguage = action.payload;
};

// TODO: MOVE OTHER MISC ACTIONS HERE
