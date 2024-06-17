import { Dispatch } from "@reduxjs/toolkit";
import { UserIncentiveEvent } from "features/incentivization/types";
import { getFunctions, httpsCallable } from "firebase/functions";
import { incentivizationActions } from "store/features/incentivization/slice";

export const claimIncentiveRewards = ({
  event,
  dispatch,
  isUserloggedIn,
}: {
  event: UserIncentiveEvent;
  dispatch?: Dispatch;
  isUserloggedIn: boolean;
}) => {
  const claimRewards = httpsCallable<UserIncentiveEvent>(getFunctions(), "incentivization-claimIncentiveRewards");
  if (isUserloggedIn) {
    return claimRewards(event);
  } else {
    dispatch(incentivizationActions.setLocalIncentivizationEventsState({ event }));
  }
};
