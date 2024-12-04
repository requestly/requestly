import { PayloadAction } from "@reduxjs/toolkit";

import { GlobalModals, GlobalModalState } from "./types";
import { GlobalSliceState } from "../types";

export const toggleActiveModal = (
  prevState: GlobalSliceState,
  action: PayloadAction<{
    modalName: keyof GlobalModals;
    newValue?: GlobalModalState["isActive"];
    newProps?: GlobalModalState["props"];
  }>
) => {
  const modalName = action.payload.modalName;

  prevState.activeModals[modalName].isActive = action.payload.newValue ?? !prevState.activeModals[modalName].isActive;

  prevState.activeModals[modalName].props = action.payload.newProps ?? prevState.activeModals[modalName].props;
};
