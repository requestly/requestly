import { PayloadAction } from "@reduxjs/toolkit";
import { RequestBotModel } from "features/requestBot/types";
import { GlobalSliceState } from "store/slices/global/types";

export const updateRequestBot = (
  prevState: GlobalSliceState,
  action: PayloadAction<{ isActive: boolean; modelType?: RequestBotModel }>
) => {
  prevState.misc.nonPersist.requestBot.isActive = action.payload.isActive;
  prevState.misc.nonPersist.requestBot.modelType = action.payload.modelType ?? "app";
};
