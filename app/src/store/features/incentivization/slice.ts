import { createSlice } from "@reduxjs/toolkit";
import {
  IncentivizeEvent,
  Milestones,
  UserIncentiveEvent,
  UserMilestoneAndRewardDetails,
} from "features/incentivization/types";
import { ReducerKeys } from "store/constants";
import getReducerWithLocalStorageSync from "store/getReducerWithLocalStorageSync";
import { IncentivizationModal, IncentivizationModals } from "./types";
import { RuleType } from "types";

const initialState = {
  milestones: {} as Milestones,
  userMilestoneAndRewardDetails: {} as UserMilestoneAndRewardDetails,
  isIncentivizationDetailsLoading: false,
  localIncentivizationEventsState: [] as UserIncentiveEvent[],
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
    resetLocalIncentivizationEventsState: (state) => {
      state.localIncentivizationEventsState = [];
    },
    setLocalIncentivizationEventsState: (state, action) => {
      const { event } = action.payload as { event: UserIncentiveEvent };

      if (!state.userMilestoneAndRewardDetails?.claimedMilestoneLogs?.includes(event.type)) {
        const milestones = state.milestones;
        const newLocalEvents = [...state.localIncentivizationEventsState, event];
        const achievedMilestoneTypes = [event.type];

        if (event.type === IncentivizeEvent.RULE_CREATED) {
          if (event.metadata?.rule_type === RuleType.REDIRECT) {
            achievedMilestoneTypes.push(IncentivizeEvent.REDIRECT_RULE_CREATED);
          } else if (event.metadata?.rule_type === RuleType.RESPONSE) {
            achievedMilestoneTypes.push(IncentivizeEvent.RESPONSE_RULE_CREATED);
          }
        }

        if (event.type === IncentivizeEvent.RULE_CREATED_AND_TESTED) {
          if (event.metadata?.rule_type === RuleType.REDIRECT) {
            achievedMilestoneTypes.push(IncentivizeEvent.REDIRECT_RULE_CREATED);
          } else if (event.metadata?.rule_type === RuleType.RESPONSE) {
            achievedMilestoneTypes.push(IncentivizeEvent.RESPONSE_RULE_CREATED);
          }
        }

        const dedupAchievedMilestones = achievedMilestoneTypes.filter(
          (milestoneType) => !state.userMilestoneAndRewardDetails?.claimedMilestoneLogs?.includes(milestoneType)
        );

        const achievedMilestones = dedupAchievedMilestones.map((milestoneType) => milestones?.[milestoneType]);

        const credits = achievedMilestones.reduce(
          (result, milestone) => result + ((milestone?.reward?.value as number) ?? 0),
          0
        );

        const creditsRedeemedCount = state.userMilestoneAndRewardDetails?.creditsRedeemedCount ?? 0;
        const creditsToBeRedeemed = (state.userMilestoneAndRewardDetails?.creditsToBeRedeemed ?? 0) + credits;
        const totalCreditsClaimed = (state.userMilestoneAndRewardDetails?.totalCreditsClaimed ?? 0) + credits;
        const claimedMilestoneLogs: IncentivizeEvent[] = [
          ...(state.userMilestoneAndRewardDetails?.claimedMilestoneLogs ?? []),
          ...(achievedMilestones.map((milestone) => milestone.type) ?? []),
        ];

        const updatedUserMilestoneAndRewardDetails: UserMilestoneAndRewardDetails = {
          creditsRedeemedCount,
          creditsToBeRedeemed,
          totalCreditsClaimed,
          claimedMilestoneLogs,
          recentAchievedMilestones: achievedMilestones,
        };

        state.localIncentivizationEventsState = newLocalEvents;

        state.userMilestoneAndRewardDetails = {
          ...state.userMilestoneAndRewardDetails,
          ...updatedUserMilestoneAndRewardDetails,
        };

        state.activeModals[IncentivizationModal.TASK_COMPLETED_MODAL] = {
          isActive: true,
          props: { event: event.type },
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
