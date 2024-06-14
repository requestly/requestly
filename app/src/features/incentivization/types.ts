export enum IncentivizeEvent {
  RULE_CREATED = "RULE_CREATED",
  RULE_TESTED = "RULE_TESTED",
  REDIRECT_RULE_CREATED = "REDIRECT_RULE_CREATED",
  RESPONSE_RULE_CREATED = "RESPONSE_RULE_CREATED",
  TEAM_WORKSPACE_CREATED = "TEAM_WORKSPACE_CREATED",
  MOCK_CREATED = "MOCK_CREATED",
  SESSION_RECORDED = "SESSION_RECORDED",
  RATE_ON_CHROME_STORE = "RATE_ON_CHROME_STORE",
}

export interface UserIncentiveEvent {
  type: IncentivizeEvent;
  metadata?: Record<string, unknown>;
}

export enum RewardType {
  CREDIT = "CREDIT",
  OTHER = "OTHER",
}

export type Reward =
  | {
      type: RewardType.CREDIT;
      value: number;
    }
  | {
      type: RewardType.OTHER;
      value: unknown;
    };

export interface Milestone {
  id?: string;
  type: IncentivizeEvent;
  reward: Reward;
  metadata?: Record<string, unknown>;
}

export type Milestones = Record<IncentivizeEvent, Milestone>;

export interface UserMilestoneAndRewardDetails {
  uid: string;
  creditsToBeRedeemed: number;
  totalCreditsClaimed: number;
  creditsRedeemedCount: number;
  claimedMilestoneLogs: Milestone["type"][];
  updatedTs?: number;
}
