export enum ChangeLogType {
  FEATURE = "feature",
  CHORE = "chore",
  FIX = "fix",
}

export type Changelog = {
  tag: string;
  date: string;
  title: string;
  description: string;
  type: ChangeLogType;
};
