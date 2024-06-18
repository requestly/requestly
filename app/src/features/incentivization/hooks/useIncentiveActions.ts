import { claimIncentiveRewards as rawClaimIncentiveRewards } from "backend/incentivization";
import { UserIncentiveEvent } from "../types";
import { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getUserAuthDetails } from "store/selectors";
import { incentivizationActions } from "store/features/incentivization/slice";
import { useIsIncentivizationEnabled } from "./useIsIncentivizationEnabled";

export const useIncentiveActions = () => {
  const dispatch = useDispatch();
  const user = useSelector(getUserAuthDetails);
  const isUserLoggedIn = user?.loggedIn;

  const isIncentivizationEnabled = useIsIncentivizationEnabled();

  const claimIncentiveRewards = useCallback(
    (event: UserIncentiveEvent) => {
      if (!isIncentivizationEnabled) {
        return;
      }

      if (isUserLoggedIn) {
        return rawClaimIncentiveRewards(event);
      } else {
        dispatch(incentivizationActions.setLocalIncentivizationEventsState({ event }));
      }
    },
    [dispatch, isUserLoggedIn, isIncentivizationEnabled]
  );

  return { claimIncentiveRewards };
};
