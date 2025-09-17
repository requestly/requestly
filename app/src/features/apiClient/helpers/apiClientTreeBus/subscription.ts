import { ApiClientFeatureContext } from "features/apiClient/store/apiClientFeatureContext/apiClientFeatureContext.store";
import { ApiClientEventTopic } from "./types";

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
