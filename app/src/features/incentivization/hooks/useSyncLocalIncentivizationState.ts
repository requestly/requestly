import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  getIncentivizationMilestones,
  getLocalIncentivizationEventsState,
} from "store/features/incentivization/selectors";
import { getUserAuthDetails } from "store/selectors";
import { UserMilestoneAndRewardDetails } from "../types";
import { HttpsCallableResult } from "firebase/functions";
import { incentivizationActions } from "store/features/incentivization/slice";
import { useIncentiveActions } from "./useIncentiveActions";

export const useSyncLocalIncentivizationState = () => {
  const dispatch = useDispatch();
  const milestones = useSelector(getIncentivizationMilestones);
  const localEventsState = useSelector(getLocalIncentivizationEventsState);
  const user = useSelector(getUserAuthDetails);

  const { claimIncentiveRewards } = useIncentiveActions();

  useEffect(() => {
    // TODO: add incentive check

    if (Object.keys(milestones).length === 0) {
      return;
    }

    if (user?.loggedIn && localEventsState.length > 0) {
      const localEventTypesSet = new Set();
      localEventsState.forEach((event) => {
        localEventTypesSet.add(event.type);
      });

      const dedupedLocalEvents = localEventsState.filter((event) => localEventTypesSet.has(event.type));

      const allPromises = dedupedLocalEvents.map((event) => {
        return claimIncentiveRewards(event);
      });

      Promise.all(allPromises).then(
        (response: HttpsCallableResult<{ success: boolean; data: UserMilestoneAndRewardDetails }>[]) => {
          const success = response?.[response.length - 1]?.data?.success;
          const updatedData = response?.[response.length - 1]?.data?.data;

          if (success) {
            dispatch(
              incentivizationActions.setUserMilestoneAndRewardDetails({ userMilestoneAndRewardDetails: updatedData })
            );
            dispatch(incentivizationActions.resetLocalIncentivizationEventsState());
          }
        }
      );
    }
  }, [user?.loggedIn, milestones, localEventsState, dispatch, claimIncentiveRewards]);
};
