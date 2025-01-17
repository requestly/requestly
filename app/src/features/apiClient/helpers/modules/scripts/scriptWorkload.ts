import { RQAPI } from "features/apiClient/types";

export class PreRequestScriptWorkload {
  constructor(
    readonly script: string,
    readonly request: RQAPI.Entry["request"],
    readonly initialState: any
  ) {}
}

export class PostResponseScriptWorkload {
  constructor(
    readonly script: string,
    readonly request: RQAPI.Entry["request"],
    readonly response: RQAPI.Entry["response"],
    readonly initialState: any
  ) {}
}
