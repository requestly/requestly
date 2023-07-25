export enum HomeEcosystemTypes {
  DEVELOPMENT = "development",
  TESTING = "testing",
  DEBUGGING = "debugging",
}

export type EcosystemFeature = {
  title: string;
  description: string;
  tag: string;
  navigateTo: string;
};
