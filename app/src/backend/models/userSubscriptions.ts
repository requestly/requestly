export interface UserSubscription {
  plan: string;
  subscriptionStatus: string;
  subscriptionCurrentPeriodStart: number;
  subscriptionCurrentPeriodEnd: number;
  stripeActiveSubscriptionID: string;
  type: "individual" | "team";
  rqSubscriptionType: string;
}
