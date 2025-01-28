import {
  WorkErrorType,
  WorkResultType,
} from "features/apiClient/helpers/modules/scriptsV2/workload-manager/workLoadTypes";

export class TaskAbortedError extends Error {
  constructor() {
    super("Task has been aborted");
    this.name = "TaskAbortedError";
  }

  getWorkError() {
    return buildAbortErrorObject(this);
  }
}

export const buildAbortErrorObject = (error: Error) => {
  return {
    type: WorkResultType.ERROR,
    error: {
      type: WorkErrorType.EXECUTION_ABORTED,
      name: error.name,
      message: error.message,
    },
  };
};
