export enum ReplicationType {
  CLOUD = "CLOUD",
  // LOCAL = "LOCAL",
  // GIT = "GIT",
}

export interface ReplicationConfig {
  enabled: boolean;
  type?: ReplicationType;
  baseUrl?: string;
}
