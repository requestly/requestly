import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getFunctions, httpsCallable } from "firebase/functions";
import { Milestones, UserMilestoneAndRewardDetails } from "../types";
import { incentivizationActions } from "store/features/incentivization/slice";
import { getUserAuthDetails } from "store/selectors";
import { useSyncLocalIncentivizationState } from "./useSyncLocalIncentivizationState";
// import { useIsIncentivizationEnabled } from "./useIsIncentivizationEnabled";

export const useFetchIncentivizationDetails = () => {
  const dispatch = useDispatch();
  const user = useSelector(getUserAuthDetails);
  const uid = user?.details?.profile?.uid;

  // const isIncentivizationEnabled = useIsIncentivizationEnabled();

  useSyncLocalIncentivizationState();

  useEffect(() => {
    const getIncentivizationDetails = async () => {
      try {
        dispatch(incentivizationActions.setIsIncentivizationDetailsLoading({ isLoading: true }));

        const getMilestones = httpsCallable(getFunctions(), "incentivization-getMilestones");

        const milestones = (await getMilestones()) as { data: { milestones: Milestones } };

        dispatch(incentivizationActions.setMilestones({ milestones: milestones.data.milestones }));

        if (uid) {
          const getUserIncentivizationDetails = httpsCallable(
            getFunctions(),
            "incentivization-getUserIncentivizationDetails"
          );

          const userMilestoneAndRewardDetails = (await getUserIncentivizationDetails()) as {
            data: { success: boolean; data: UserMilestoneAndRewardDetails | null };
          };

          if (userMilestoneAndRewardDetails.data?.success) {
            dispatch(
              incentivizationActions.setUserMilestoneAndRewardDetails({
                userMilestoneAndRewardDetails: userMilestoneAndRewardDetails.data?.data,
              })
            );
          }
        }
      } catch (error) {
        // do nothing
      } finally {
        dispatch(incentivizationActions.setIsIncentivizationDetailsLoading({ isLoading: false }));
      }
    };

    // TODO: add a new user check
    getIncentivizationDetails();
  }, [dispatch, uid]);
};
