import { StoreApi } from "zustand";
import { getApiClientRecordsStore } from "../../commands/store.utils";
import { ApiClientFeatureContext } from "../../store/apiClientFeatureContext/apiClientFeatureContext.store";
import { RQAPI } from "../../types";
import { ApiRecordsState } from "../../store/apiRecords/apiRecords.store";
import { ApiClientEventTopic, Subscription } from "./subscription";

interface ApiClientEvent {
  topic: ApiClientEventTopic;
  emitterId: RQAPI.ApiClientRecord["id"];
}

abstract class ApiClientEventForChildren implements ApiClientEvent {
  readonly topic: ApiClientEventTopic;
  constructor(public emitterId: RQAPI.ApiClientRecord["id"]) {}
}
abstract class ApiClientEventForParents implements ApiClientEvent {
  readonly topic: ApiClientEventTopic;
  constructor(public emitterId: RQAPI.ApiClientRecord["id"]) {}
}

export class AuthChanged extends ApiClientEventForChildren {
  readonly topic = ApiClientEventTopic.AUTH_CHANGED;
  constructor(public emitterId: RQAPI.ApiClientRecord["id"]) {
    super(emitterId);
  }
}
export class ChildAdded extends ApiClientEventForParents {
  readonly topic = ApiClientEventTopic.CHILD_ADDED;
  constructor(public emitterId: RQAPI.ApiClientRecord["id"], public one: any, public two: any) {
    super(emitterId);
  }
}

type ApiClientEventMap = {
  [ApiClientEventTopic.AUTH_CHANGED]: AuthChanged;
  [ApiClientEventTopic.CHILD_ADDED]: ChildAdded;
};

export type ApiClientEvents<T extends ApiClientEventTopic> = ApiClientEventMap[T];

export class ApiClientTreeBus {
  private subscriptionMap: Map<
    ApiClientEventTopic,
    Map<RQAPI.ApiClientRecord["id"], Set<Subscription<any, any>>>
  > = new Map();
  private store: StoreApi<ApiRecordsState>;
  private ctx: ApiClientFeatureContext;
  public static instance: ApiClientTreeBus;

  private constructor() {
    for (const event of Object.values(ApiClientEventTopic)) {
      this.subscriptionMap.set(event, new Map());
    }
  }

  private updateContext(ctx: ApiClientFeatureContext) {
    this.ctx = ctx;
    this.store = getApiClientRecordsStore(ctx);
  }

  static getInstance(ctx: ApiClientFeatureContext): ApiClientTreeBus {
    if (!this.instance) {
      this.instance = new ApiClientTreeBus();
    }
    this.instance.updateContext(ctx);
    return this.instance;
  }

  subscribe<T extends ApiClientEventTopic>(params: { id: string; topic: T; subscription: Subscription<T, any> }) {
    const topicMap = this.subscriptionMap.get(params.topic);
    if (topicMap) {
      let subscriptions = topicMap.get(params.id);
      if (!subscriptions) {
        subscriptions = new Set();
        topicMap.set(params.id, subscriptions);
      }
      subscriptions.add(params.subscription);
    }
  }

  unsubscribe(params: { id: string; topic: ApiClientEventTopic; subscription: Subscription<any, any> }) {
    const topicMap = this.subscriptionMap.get(params.topic);
    if (topicMap) {
      const subscriptions = topicMap.get(params.id);
      if (subscriptions) {
        subscriptions.delete(params.subscription);
      }
    }
  }

  emit(event: ApiClientEvent) {
    if (event instanceof ApiClientEventForChildren) {
      this.emitToChildren(event.emitterId, event);
    } else if (event instanceof ApiClientEventForParents) {
      this.emitToParentChain(event.emitterId, event);
    }
  }

  private emitToChildren(recordId: string, event: ApiClientEventForChildren) {
    const allChildren = this.store.getState().getAllChildren(recordId);
    return this.sendToSubscribers(event, allChildren);
  }

  private emitToParentChain(recordId: string, event: ApiClientEventForParents) {
    const parentChain = this.store.getState().getParentChain(recordId);
    return this.sendToSubscribers(event, parentChain);
  }

  private sendToSubscribers(event: ApiClientEvent, recipientIds: RQAPI.ApiClientRecord["id"][]) {
    const topicMap = this.subscriptionMap.get(event.topic);

    if (!topicMap) {
      return;
    }

    recipientIds.forEach((id) => {
      const subscriptions = topicMap.get(id);
      if (subscriptions) {
        subscriptions.forEach((subscription) => {
          subscription.next(event, this.ctx);
        });
      }
    });
  }
}
