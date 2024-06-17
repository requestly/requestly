import { createSlice } from "@reduxjs/toolkit";
import { IncentivizeEvent, Milestones, UserMilestoneAndRewardDetails } from "features/incentivization/types";
import { ReducerKeys } from "store/constants";
import getReducerWithLocalStorageSync from "store/getReducerWithLocalStorageSync";
import { IncentivizationModal, IncentivizationModals } from "./types";

const initialState = {
  milestones: {} as Milestones,
  userMilestoneAndRewardDetails: {} as UserMilestoneAndRewardDetails,
  isIncentivizationDetailsLoading: false,
  localIncentivizationEventsState: [] as IncentivizeEvent[],
  activeModals: {
    [IncentivizationModal.TASKS_LIST_MODAL]: {
      isActive: false,
      props: {},
    },
    [IncentivizationModal.TASK_COMPLETED_MODAL]: {
      isActive: false,
      props: {},
    },
  } as IncentivizationModals,
};

const slice = createSlice({
  name: ReducerKeys.INCENTIVIZATION,
  initialState,
  reducers: {
    resetState: () => initialState,
    setMilestones: (state, action) => {
      const { milestones } = action.payload;
      state.milestones = milestones;
    },
    setUserMilestoneAndRewardDetails: (state, action) => {
      const { userMilestoneAndRewardDetails } = action.payload;
      state.userMilestoneAndRewardDetails = {
        ...state.userMilestoneAndRewardDetails,
        ...userMilestoneAndRewardDetails,
      };
    },
    setIsIncentivizationDetailsLoading: (state, action) => {
      const { isLoading } = action.payload;
      state.isIncentivizationDetailsLoading = isLoading;
    },
    setLocalIncentivizationEventsState: (state, action) => {
      const { type } = action.payload;

      if (
        !state.localIncentivizationEventsState.includes(type) &&
        !state.userMilestoneAndRewardDetails?.claimedMilestoneLogs?.includes(type)
      ) {
        const milestones = state.milestones;
        const localEventsState = [...state.localIncentivizationEventsState, type];

        const credits = (milestones?.[(type as unknown) as IncentivizeEvent]?.reward?.value as number) ?? 0;

        const creditsRedeemedCount = state.userMilestoneAndRewardDetails?.creditsRedeemedCount ?? 0;
        const creditsToBeRedeemed = (state.userMilestoneAndRewardDetails?.creditsToBeRedeemed ?? 0) + credits;
        const totalCreditsClaimed = (state.userMilestoneAndRewardDetails?.totalCreditsClaimed ?? 0) + credits;
        const claimedMilestoneLogs: IncentivizeEvent[] = [...localEventsState];

        const updatedUserMilestoneAndRewardDetails: UserMilestoneAndRewardDetails = {
          creditsRedeemedCount,
          creditsToBeRedeemed,
          totalCreditsClaimed,
          claimedMilestoneLogs,
        };

        console.log("updatedUserMilestoneAndRewardDetails", updatedUserMilestoneAndRewardDetails);

        state.localIncentivizationEventsState = localEventsState;

        state.userMilestoneAndRewardDetails = {
          ...state.userMilestoneAndRewardDetails,
          ...updatedUserMilestoneAndRewardDetails,
        };
      }
    },
    toggleActiveModal: (state, action) => {
      const modalName = action.payload.modalName as IncentivizationModal;

      state.activeModals[modalName].isActive = action.payload.newValue ?? !state.activeModals[modalName].isActive;

      state.activeModals[modalName].props = action.payload.newProps ?? state.activeModals[modalName].props;
    },
  },
});

const { actions, reducer } = slice;

export const incentivizationReducer = getReducerWithLocalStorageSync(ReducerKeys.INCENTIVIZATION, reducer, [
  "milestones",
  "userMilestoneAndRewardDetails",
  "localIncentivizationEventsState",
]);

export const incentivizationActions = actions;
