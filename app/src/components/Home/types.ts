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
  link: string;
};

export enum ImporterType {
  CHARLES = "CHARLES",
  RESOURCE_OVERRIDE = "RESOURCE_OVERRIDE",
  MOD_HEADER = "MOD_HEADER",
  REQUESTLY = "REQUESTLY",
  HEADER_EDITOR = "HEADER_EDITOR",
  FILES = "FILES",
}
