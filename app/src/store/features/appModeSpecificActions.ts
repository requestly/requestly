import { PayloadAction } from "@reduxjs/toolkit";
import { GlobalSliceState } from "store/slices/global/types";

export const updateDesktopSpecificDetails = (prevState: GlobalSliceState, action: PayloadAction<any>) => {
  Object.assign(prevState.desktopSpecificDetails, action.payload);
};

export const updateUserCountry = (prevState: GlobalSliceState, action: PayloadAction<string>) => {
  prevState.country = action.payload;
};

export const updateInitializations = (
  prevState: GlobalSliceState,
  action: PayloadAction<{
    initType: "auth";
    initValue: boolean;
  }>
) => {
  prevState.initializations[action.payload.initType] = action.payload.initValue;
};

export const updateDesktopSpecificAppProperty = (
  prevState: GlobalSliceState,
  action: PayloadAction<{
    appId: string;
    property: string;
    value: any;
  }>
) => {
  const { appId, property, value } = action.payload;

  prevState.desktopSpecificDetails.appsList[appId][property] = value;
};

export const updateDesktopSpecificAppDetails = (
  prevState: GlobalSliceState,
  action: PayloadAction<{
    appId: string;
    appDetails: any;
  }>
) => {
  const { appId, appDetails } = action.payload;

  prevState.desktopSpecificDetails.appsList[appId] = appDetails;
};

export const updateDesktopAppsList = (prevState: GlobalSliceState, action: PayloadAction<any>) => {
  const { appsList } = action.payload;
  prevState.desktopSpecificDetails.appsList = appsList;
};

export const updateHasConnectedApp = (prevState: GlobalSliceState, action: PayloadAction<boolean>) => {
  prevState.misc.persist.hasConnectedApp = action.payload;
};

export const updateIsExtensionEnabled = (prevState: GlobalSliceState, action: PayloadAction<boolean>) => {
  prevState.isExtensionEnabled = action.payload;
};
