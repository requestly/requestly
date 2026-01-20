export type ChangeLog =
  | string
  | {
      title: string;
      link?: string;
    };

export interface VersionedChangeLogs {
  version: string;
  logs: ChangeLog[];
}
