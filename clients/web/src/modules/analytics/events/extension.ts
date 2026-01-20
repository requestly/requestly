import { trackEvent } from "..";
// @ts-ignore
import { CONSTANTS } from "@requestly/constants";
import { RULES } from "./common/constants";

interface Event {
  eventName: string;
  eventParams: Record<string, any>;
  eventTs: number;
}

interface EventBatch {
  id: string;
  events: Event[];
  createdTs: number;
}

const sendEventsBatch = (eventBatch: EventBatch): void => {
  eventBatch.events.forEach((event) => {
    const eventConfig = { time: event.eventTs };

    /* ADDING EXTRA INFO FOR RULE EXECUTION EVENTS */
    if (event.eventName === RULES.RULE_EXECUTED) {
      const currentUserId = window.uid;
      const ruleCreator = event.eventParams?.["rule_creator"];

      if (ruleCreator && currentUserId) {
        const isExecutorCreator = currentUserId === ruleCreator;
        event.eventParams["is_executor_creator"] = isExecutorCreator;
      }
      delete event.eventParams["rule_creator"];
    }

    trackEvent(event.eventName, event.eventParams, eventConfig);
  });
};

/**
 *
 * @param batches event batches
 * @returns processed batch IDs to acknowledge
 */
export const handleEventBatches = (batches: EventBatch[]): string[] => {
  batches.forEach(sendEventsBatch);
  return batches.map((batch) => batch.id);
};

/* EXTENSION EVENTS ENGINE FLAG */
export const getEventsEngineFlag = {
  [CONSTANTS.STORAGE_KEYS.USE_EVENTS_ENGINE]: true,
  [CONSTANTS.STORAGE_KEYS.SEND_EXECUTION_EVENTS]: true,
};

export const trackExtensionStatusUpdated = ({
  isExtensionEnabled,
  extensionIconState,
}: {
  isExtensionEnabled: boolean;
  extensionIconState: any;
}): void => {
  trackEvent("extension_status_updated", {
    is_extension_enabled: isExtensionEnabled,
    extension_icon_state: extensionIconState,
  });
};
