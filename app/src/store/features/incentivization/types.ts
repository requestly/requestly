export enum IncentivizationModal {
  TASKS_LIST_MODAL = "TASKS_LIST_MODAL",
  TASK_COMPLETED_MODAL = "TASK_COMPLETED_MODAL",
}

export type IncentivizationModals = Record<
  IncentivizationModal,
  {
    isActive: boolean;
    props: Record<string, unknown>;
  }
>;
