import { PayloadAction } from "@reduxjs/toolkit";

import { GlobalModals, GlobalModalState } from "./types";
import { GlobalSliceState } from "../types";

const toggleActiveModal = (
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

// Exporting like this because reference don't work if exported directly
// https://github.com/microsoft/TypeScript/issues/59134
const caseReducers = {
  toggleActiveModal,
};
export default caseReducers;
