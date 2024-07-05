import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getFunctions, httpsCallable } from "firebase/functions";
import { IncentivizeEvent, Milestones, UserMilestoneAndRewardDetails } from "../types";
import { incentivizationActions } from "store/features/incentivization/slice";
import { getUserAuthDetails } from "store/selectors";
import { useSyncLocalIncentivizationState } from "./useSyncLocalIncentivizationState";
import { useIsNewUserForIncentivization } from "./useIsNewUserForIncentivization";

export const useFetchIncentivizationDetails = () => {
  const dispatch = useDispatch();
  const user = useSelector(getUserAuthDetails);
  const uid = user?.details?.profile?.uid;
  const isNewUserForIncentivization = useIsNewUserForIncentivization("2024-07-05");

  useSyncLocalIncentivizationState();

  useEffect(() => {
    const getIncentivizationDetails = async () => {
      try {
        dispatch(incentivizationActions.setIsIncentivizationDetailsLoading({ isLoading: true }));

        const getMilestones = httpsCallable(getFunctions(), "incentivization-getMilestones");

        const milestones = (await getMilestones()) as { data: { milestones: Milestones } };

        const oldUserMilestones = [IncentivizeEvent.RULE_CREATED, IncentivizeEvent.RULE_TESTED];
        const newUserMilestones = [IncentivizeEvent.RULE_CREATED_AND_TESTED];
        const milestoneToBeRemoved = isNewUserForIncentivization ? oldUserMilestones : newUserMilestones;

        const updatedMilestones = Object.values(milestones.data.milestones).reduce((result, milestone) => {
          if (milestoneToBeRemoved.includes(milestone.type)) {
            return result;
          } else {
            return { ...result, [milestone.type]: milestone };
          }
        }, {} as Milestones);

        dispatch(incentivizationActions.setMilestones({ milestones: updatedMilestones }));

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
  }, [dispatch, uid, isNewUserForIncentivization]);
};
