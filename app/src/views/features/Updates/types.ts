export interface ChangeLog {
  title: string;
  link?: string;
}

export interface VersionedChangeLogs {
  version: string;
  logs: ChangeLog[];
}
