export class PreRequestScriptWorkload {
  constructor(
    readonly script: string,
    readonly initialState: any,
    readonly onStateUpdate: (key: string, value: any) => void
  ) {}
}

export class PostResponseScriptWorkload {
  constructor(
    readonly script: string,
    readonly initialState: any,
    readonly onStateUpdate: (key: string, value: any) => void
  ) {}
}

export enum WorkResultType {
  SUCCESS = "SUCCESS",
  ERROR = "ERROR",
}

export type WorkResult = {
  type: WorkResultType;
} & (
  | {
      type: WorkResultType.SUCCESS;
    }
  | {
      type: WorkResultType.ERROR;
      error: WorkError;
    }
);

export enum WorkErrorType {
  UNEXPECTED = "UNEXPECTED",
}

export type WorkError = {
  type: WorkErrorType;
} & {
  type: WorkErrorType.UNEXPECTED;
  message: string;
  name: string;
};