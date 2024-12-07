export interface GlobalModalState {
  isActive: boolean;
  props: any;
}

export interface GlobalModals {
  loadingModal: GlobalModalState;
  authModal: GlobalModalState;
  renameGroupModal: GlobalModalState;
  extensionModal: GlobalModalState;
  syncConsentModal: GlobalModalState;
  personaSurveyModal: GlobalModalState;
  ruleEditorModal: GlobalModalState;
  connectedAppsModal: GlobalModalState;
  workspaceOnboardingModal: GlobalModalState;
  appOnboardingModal: GlobalModalState;
  createWorkspaceModal: GlobalModalState;
  inviteMembersModal: GlobalModalState;
  switchWorkspaceModal: GlobalModalState;
  joinWorkspaceModal: GlobalModalState;
  sharingModal: GlobalModalState;
  emailLoginLinkPopup: GlobalModalState;
  pricingModal: GlobalModalState;
}
