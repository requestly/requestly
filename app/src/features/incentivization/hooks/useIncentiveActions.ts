import {
  ClaimIncentiveRewardsResponse,
  claimIncentiveRewards as rawClaimIncentiveRewards,
} from "backend/incentivization";
import { UserIncentiveEvent } from "../types";
import { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getUserAuthDetails } from "store/selectors";
import { incentivizationActions } from "store/features/incentivization/slice";
import { useIsIncentivizationEnabled } from "./useIsIncentivizationEnabled";
import { HttpsCallableResult } from "firebase/functions";

export const useIncentiveActions = () => {
  const dispatch = useDispatch();
  const user = useSelector(getUserAuthDetails);
  const isUserLoggedIn = user?.loggedIn;

  const isIncentivizationEnabled = useIsIncentivizationEnabled();

  const claimIncentiveRewards = useCallback(
    (event: UserIncentiveEvent): Promise<HttpsCallableResult<ClaimIncentiveRewardsResponse>> => {
      if (!isIncentivizationEnabled) {
        return Promise.resolve({ data: { success: false, data: null } });
      }

      if (isUserLoggedIn) {
        return rawClaimIncentiveRewards(event);
      } else {
        dispatch(incentivizationActions.setLocalIncentivizationEventsState({ event }));
        return Promise.resolve({ data: { success: false, data: null } });
      }
    },
    [dispatch, isUserLoggedIn, isIncentivizationEnabled]
  );

  return { claimIncentiveRewards };
};
