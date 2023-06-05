/* SCOPE */
const EventActions = {};
/* STATE */
EventActions.eventsToWrite = [];
EventActions.executionEventsToWrite = [];
EventActions.eventWriterInterval = null;
EventActions.batchesWaitingForAck = [];
EventActions.eventsCount = 0;
EventActions.EVENTS_LIMIT = 50000;
EventActions.STORE_EVENTS_KEY = "eventBatches";
EventActions.STORE_EXECUTION_EVENTS_KEY = "executionEventBatches";

/* UTILITIES */

EventActions.queueEventToWrite = (event) => {
  EventActions.eventsToWrite.push(event);
};

EventActions.queueExecutionEventToWrite = (event) => {
  EventActions.executionEventsToWrite.push(event);
};

EventActions.getAllEventBatches = async () => {
  const eventBatches = (await RQ.StorageService.getRecord(EventActions.STORE_EVENTS_KEY)) || {};
  const executionEventBatches = (await RQ.StorageService.getRecord(EventActions.STORE_EXECUTION_EVENTS_KEY)) || {};

  return [eventBatches, executionEventBatches];
};

EventActions.deleteBatches = async (batchIds) => {
  const [batches, executionBatches] = await EventActions.getAllEventBatches();

  if (batches) {
    batchIds.forEach((id) => {
      if (batches[id]) {
        EventActions.eventsCount -= batches[id].events.length;
        delete batches[id];
      }
    });
  }

  if (executionBatches) {
    batchIds.forEach((id) => {
      if (executionBatches[id]) {
        EventActions.eventsCount -= executionBatches[id].events.length;
        delete executionBatches[id];
      }
    });
  }

  const newStoredBatches = {};
  newStoredBatches[EventActions.STORE_EVENTS_KEY] = batches;
  newStoredBatches[EventActions.STORE_EXECUTION_EVENTS_KEY] = executionBatches;

  await RQ.StorageService.saveRecord(newStoredBatches);
};

EventActions.getAllEventsToWrite = () => {
  /* also removes from the local events buffer */
  const _eventsToWrite = [...EventActions.eventsToWrite];
  EventActions.eventsToWrite = [];

  const _executionEventsToWrite = [...EventActions.executionEventsToWrite];
  EventActions.executionEventsToWrite = [];

  return [_eventsToWrite, _executionEventsToWrite];
};

/* batches recognised for sending here are added to batchesWaitingForAck */
EventActions.getBatchesToSend = async () => {
  let batchesToSend = [];

  const [eventBatches, executionEventBatches] = await EventActions.getAllEventBatches();
  const allEventBatches = { ...eventBatches, ...executionEventBatches };

  batchesToSend = Object.keys(allEventBatches)
    .filter((batchId) => !EventActions.batchesWaitingForAck.includes(batchId))
    .map((batchIdToSend) => {
      EventActions.batchesWaitingForAck.push(batchIdToSend);
      return allEventBatches[batchIdToSend];
    });

  return batchesToSend;
};

/* ACKNOWLEDGEMENT HANDLERS */

EventActions.stopWaitingForAcknowledgement = (batchId) => {
  const batchIndex = EventActions.batchesWaitingForAck.findIndex((batch) => batch === batchId);
  if (batchIndex !== -1) {
    EventActions.batchesWaitingForAck.splice(batchIndex, 1);
  }
};

EventActions.handleAcknowledgements = async (acknowledgedBatchIds) => {
  const batchesToDelete = acknowledgedBatchIds.filter((acknowledgedBatch) =>
    EventActions.batchesWaitingForAck.includes(acknowledgedBatch)
  );

  if (batchesToDelete.length > 0) {
    await EventActions.deleteBatches(batchesToDelete);

    batchesToDelete.forEach((batchId) => {
      EventActions.stopWaitingForAcknowledgement(batchId);
    });
  }
};

/* CORE */

// MAIN SENDING ENGINE
EventActions.sendExtensionEvents = async () => {
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

EventActions.writeEventsToLocalStorage = async () => {
  if (EventActions.eventsCount > EventActions.EVENTS_LIMIT) {
    EventActions.clearAllEventBatches();
    EventActions.eventsCount = 0;
    return;
  }

  const _sendExecutionEvents = await RQ.StorageService.getRecord(RQ.STORAGE_KEYS.SEND_EXECUTION_EVENTS);

  const createBatch = (eventsArray, isExecutionEventBatch = false) => {
    let batchId = RQ.commonUtils.generateUUID();

    if (isExecutionEventBatch) {
      batchId = "execution_" + batchId;
    }

    return {
      id: batchId,
      events: eventsArray,
      createdTs: Date.now(),
    };
  };

  const [_eventsToWrite, _executionEventsToWrite] = EventActions.getAllEventsToWrite();

  let newEventsBatch = null,
    newExecutionEventsBatch = null;

  if (_eventsToWrite.length) {
    EventActions.eventsCount += _eventsToWrite.length;
    newEventsBatch = createBatch(_eventsToWrite);
  }

  if (_sendExecutionEvents !== false && _executionEventsToWrite.length) {
    EventActions.eventsCount += _executionEventsToWrite.length;
    newExecutionEventsBatch = createBatch(_executionEventsToWrite, true);
  }

  return EventActions.getAllEventBatches().then(([batchesInStorage, executionBatchesInStorage]) => {
    if (newEventsBatch) {
      batchesInStorage[newEventsBatch.id] = newEventsBatch;
    }
    if (newExecutionEventsBatch) {
      executionBatchesInStorage[newExecutionEventsBatch.id] = newExecutionEventsBatch;
    }

    const newStoredBatches = {};
    newStoredBatches[EventActions.STORE_EVENTS_KEY] = batchesInStorage;
    newStoredBatches[EventActions.STORE_EXECUTION_EVENTS_KEY] = executionBatchesInStorage;

    return RQ.StorageService.saveRecord(newStoredBatches).then(() => {
      EventActions.sendExtensionEvents();
    });
  });
};

EventActions.setEventsCount = async () => {
  const [batchesInStorage, executionBatchesInStorage] = await EventActions.getAllEventBatches();

  EventActions.eventsCount = Object.values({ ...batchesInStorage, ...executionBatchesInStorage })?.reduce(
    (total, { events }) => total + events.length,
    0
  );
};

EventActions.startPeriodicEventWriter = async (intervalTime = 10000) => {
  if (!EventActions.eventWriterInterval) {
    EventActions.eventWriterInterval = setInterval(async () => {
      await EventActions.writeEventsToLocalStorage();
    }, intervalTime);
  }

  return EventActions.eventWriterInterval;
};

EventActions.stopPeriodicEventWriter = () => {
  if (EventActions.eventWriterInterval) {
    clearInterval(EventActions.eventWriterInterval);
    EventActions.eventWriterInterval = null;
  }
};

EventActions.clearExecutionEvents = async () => {
  await RQ.StorageService.removeRecord(EventActions.STORE_EXECUTION_EVENTS_KEY);
};

EventActions.clearAllEventBatches = async () => {
  await RQ.StorageService.removeRecord(EventActions.STORE_EVENTS_KEY);
  EventActions.clearExecutionEvents();
};
