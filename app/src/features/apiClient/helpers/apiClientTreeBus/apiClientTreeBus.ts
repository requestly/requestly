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
  public static instance: ApiClientTreeBus;

  constructor(private ctx: ApiClientFeatureContext) {
    this.store = getApiClientRecordsStore(ctx);
    for (const event of Object.values(ApiClientEventTopic)) {
      this.subscriptionMap.set(event, new Map());
    }
  }

  subscribe<T extends ApiClientEventTopic>(params: { nodeId: string; topic: T; subscription: Subscription<T, any> }) {
    const topicMap = this.subscriptionMap.get(params.topic);

    if (!topicMap) {
      return;
    }

    let subscriptions = topicMap.get(params.nodeId);
    if (!subscriptions) {
      subscriptions = new Set();
      topicMap.set(params.nodeId, subscriptions);
    }
    subscriptions.add(params.subscription);
  }

  unsubscribe(params: { nodeId: string; topic: ApiClientEventTopic; subscription: Subscription<any, any> }) {
    const topicMap = this.subscriptionMap.get(params.topic);
    if (topicMap) {
      const subscriptions = topicMap.get(params.nodeId);
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

  private emitToChildren(nodeId: string, event: ApiClientEventForChildren) {
    const allChildren = this.store.getState().getAllChildren(nodeId);
    return this.sendToSubscribers(event, allChildren);
  }

  private emitToParentChain(nodeId: string, event: ApiClientEventForParents) {
    const parentChain = this.store.getState().getParentChain(nodeId);
    return this.sendToSubscribers(event, parentChain);
  }

  private sendToSubscribers(event: ApiClientEvent, recipientIds: RQAPI.ApiClientRecord["id"][]) {
    const topicMap = this.subscriptionMap.get(event.topic);

    if (!topicMap) {
      return;
    }

    for (const recipientId of recipientIds) {
      const subscriptions = topicMap.get(recipientId);

      if (!subscriptions) {
        continue;
      }

      subscriptions.forEach((subscription) => {
        subscription.next(event, this.ctx);
      });
    }
  }
}
