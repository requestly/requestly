export interface OrganizationsDetails {
  workspaces: Array<{
    adminName: string;
    adminEmail: string;
    workspaceName?: string;
  }>;
}
