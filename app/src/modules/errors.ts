import {
  WorkErrorType,
  WorkResult,
  WorkResultType,
} from "features/apiClient/helpers/modules/scriptsV2/workloadManager/workLoadTypes";

export class TaskAbortedError extends Error {
  constructor() {
    super("Task has been aborted");
    this.name = "TaskAbortedError";
  }

  getWorkError() {
    return buildAbortErrorObject(this);
  }
}

export const buildAbortErrorObject = (error: Error): WorkResult => {
  return {
    type: WorkResultType.ERROR,
    error: {
      type: WorkErrorType.EXECUTION_ABORTED,
      name: error.name,
      message: error.message,
    },
  };
};
