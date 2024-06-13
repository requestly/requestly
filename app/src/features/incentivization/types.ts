export enum IncentivizeEvent {
  FIRST_RULE_CREATED = "FIRST_RULE_CREATED",
  RULE_TESTED = "RULE_TESTED",
  REDIRECT_RULE_CREATED = "REDIRECT_RULE_CREATED",
  RESPONSE_RULE_CREATED = "RESPONSE_RULE_CREATED",
  FIRST_TEAM_WORKSPACE_CREATED = "FIRST_TEAM_WORKSPACE_CREATED",
  FIRST_MOCK_CREATED = "FIRST_MOCK_CREATED",
  FIRST_SESSION_RECORDED = "FIRST_SESSION_RECORDED",
  RATE_ON_CHROME_STORE = "RATE_ON_CHROME_STORE",
}

export type Credit = number;

export type Reward = Credit | unknown;

export type Milestone = { id: IncentivizeEvent; type: IncentivizeEvent; value: Reward };

export type Milestones = Record<IncentivizeEvent, Milestone>;

export interface UserMilestoneDetails {
  uid: string;
  recentCreditsClaimed: number;
  creditsToBeRedeemed: number;
  totalCreditsClaimed: number;
  creditsRedeemedCount: number;
  claimedMilestoneLogs: Milestone["type"][];
  updatedTs: number;
  metadata: {
    milestonesVersion: number;
  };
}
