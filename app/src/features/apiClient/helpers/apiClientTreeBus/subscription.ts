import { ApiClientFeatureContext } from "features/apiClient/store/apiClientFeatureContext/apiClientFeatureContext.store";

export enum ApiClientEventTopic {
  AUTH_CHANGED = "authChanged",
  CHILD_ADDED = "childAdded",
}

export class Subscription<K extends ApiClientEventTopic, T> {
  constructor(
    private readonly emitter: (arg: T) => void,
    private readonly filterMap: (event: K, ctx: ApiClientFeatureContext) => T | undefined
  ) {}

  next(event: K, ctx: ApiClientFeatureContext) {
    const data = this.filterMap(event, ctx);
    if (data !== undefined) {
      this.emitter(data);
    }
  }
}
