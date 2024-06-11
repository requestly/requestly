import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getFunctions, httpsCallable } from "firebase/functions";
import { Milestones, UserMilestoneDetails } from "../types";
import { incentivizationActions } from "store/features/incentivization/slice";
import { getUserAuthDetails } from "store/selectors";

export const useFetchIncentivizationDetails = () => {
  const dispatch = useDispatch();
  const user = useSelector(getUserAuthDetails);
  const uid = user?.details?.profile?.uid;

  useEffect(() => {
    const getIncentivizationDetails = async () => {
      try {
        dispatch(incentivizationActions.setIsIncentivizationDetailsLoading({ isLoading: true }));

        const getMilestones = httpsCallable(getFunctions(), "incentivization-getMilestones");

        const milestones = (await getMilestones()) as { data: { milestones: Milestones } };
        dispatch(incentivizationActions.setMilestones({ milestones: milestones.data.milestones }));

        if (uid) {
          const getUserMilestoneDetails = httpsCallable(getFunctions(), "incentivization-getUserMilestoneDetails");

          const userMilestoneDetails = (await getUserMilestoneDetails()) as {
            data: { success: boolean; data: UserMilestoneDetails | null };
          };

          if (userMilestoneDetails.data?.success) {
            dispatch(
              incentivizationActions.setUserMilestoneDetails({ userMilestoneDetails: userMilestoneDetails.data?.data })
            );
          }
        }
      } catch (error) {
        // do nothing
      } finally {
        dispatch(incentivizationActions.setIsIncentivizationDetailsLoading({ isLoading: false }));
      }
    };

    getIncentivizationDetails();
  }, [dispatch, uid]);
};
