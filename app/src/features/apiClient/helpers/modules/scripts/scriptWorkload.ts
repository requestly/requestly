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
