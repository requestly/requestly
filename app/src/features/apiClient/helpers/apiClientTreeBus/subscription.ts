import { ApiClientFeatureContext } from "features/apiClient/store/apiClientFeatureContext/apiClientFeatureContext.store";
import { ApiClientEventTopic } from "./types";
import { ApiClientEvents } from "./apiClientTreeBus";

export class Subscription<K extends ApiClientEventTopic, T> {
  constructor(
    private readonly emitter: (arg: T) => void,
    private readonly filterMap: (event: ApiClientEvents<K>, ctx: ApiClientFeatureContext) => T | undefined
  ) {}

  next(event: ApiClientEvents<K>, ctx: ApiClientFeatureContext) {
    const data = this.filterMap(event, ctx);
    if (data !== undefined) {
      this.emitter(data);
    }
  }
}
