export interface UserWorkspaceConfig {
  ruleMetadataSyncType?: RuleMetadataSyncType;
}

export enum RuleMetadataSyncType {
  GLOBAL = "GLOBAL",
  USER = "USER",
}
