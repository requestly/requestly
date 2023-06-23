export enum OnboardingSteps {
  AUTH = "auth",
  PERSONA_SURVEY = "persona_survey",
  CREATE_JOIN_WORKSPACE = "create_join_workspace",
  RECOMMENDATIONS = "recommendations",
}
export interface NewTeamData {
  inviteId: string;
  teamId: string;
  name: string;
}
