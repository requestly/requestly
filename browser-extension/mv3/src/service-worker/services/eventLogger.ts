import offscreenHandler from "./offscreen/offscreenHandler";

/* STATE */
const eventsToSend = [],
  eventWriterInterval: NodeJS.Timeout = null,
  batchesWaitingForAck = [],
  eventsCount = 0,
  EVENTS_LIMIT = 50000,
  STORE_EVENTS_KEY = "eventBatches",
  STORE_EXECUTION_EVENTS_KEY = "executionEventBatches";
/* UTILITIES */

// MV2 - periodically writing to localStorage, now periodic sending to the app
// If no refresh token present, discard the event then and there, do not cache

const queueEventToWrite = (event) => {
  eventsToSend.push(event);
};

/* CORE */

// MAIN SENDING ENGINE
const sendExtensionEvents = async () => {
  const useEngine = await RQ.StorageService.getRecord(RQ.STORAGE_KEYS.USE_EVENTS_ENGINE);

  if (useEngine !== false && BG.isAppOnline) {
    const eventBatchesPayload = await EventActions.getBatchesToSend();
    if (eventBatchesPayload?.length === 0) return;

    const extensionEventsMessage = {
      action: RQ.EXTENSION_MESSAGES.SEND_EXTENSION_EVENTS,
      eventBatches: eventBatchesPayload,
    };

    const response = await BG.Methods.sendMessageToApp(extensionEventsMessage);

    if (response?.wasMessageSent) {
      await EventActions.handleAcknowledgements(response.payload.ackIds);
    } else {
      eventBatchesPayload.forEach((batch) => {
        EventActions.stopWaitingForAcknowledgement(batch.id);
      });
    }
  }
};

const logEvents = () => {
  offscreenHandler.sendMessage({
    action: "log_events",
    events: eventsToSend,
  });
};

const initEventLogger = async (intervalTime = 10000) => {
  if (!offscreenHandler.isOffscreenWebappOpen()) {
    await offscreenHandler.initWebAppOffscreen();
  }

  if (!EventActions.eventWriterInterval) {
    EventActions.eventWriterInterval = setInterval(async () => {
      await EventActions.writeEventsToLocalStorage();
    }, intervalTime);
  }

  return EventActions.eventWriterInterval;
};

const stopPeriodicEventWriter = () => {
  if (EventActions.eventWriterInterval) {
    clearInterval(EventActions.eventWriterInterval);
    EventActions.eventWriterInterval = null;
  }
};

const clearExecutionEvents = async () => {
  await RQ.StorageService.removeRecord(EventActions.STORE_EXECUTION_EVENTS_KEY);
};

const clearAllEventBatches = async () => {
  await RQ.StorageService.removeRecord(EventActions.STORE_EVENTS_KEY);
  EventActions.clearExecutionEvents();
};
