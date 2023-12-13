export type SubscriptionType = "individual" | "team" | "appsumo";

export type AppSumoHttpRulesPlan = "basic_appsumo" | "professional_appsumo";

export type AppSumoHttpRulesDeal = {
  accessTo: AppSumoHttpRulesPlan;
};

type AppSumoDealVersion = number;

type NumberOfAppSumoCode = number;

export type AppSumoDeals = Record<AppSumoDealVersion, Record<NumberOfAppSumoCode, AppSumoHttpRulesDeal>>;
