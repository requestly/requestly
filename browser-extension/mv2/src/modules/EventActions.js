/* SCOPE */
const EventActions = {};
/* STATE */
EventActions.eventsToWrite = [];
EventActions.eventWriterInterval = null;
EventActions.batchesWaitingForAck = [];
EventActions.STORE_EVENTS_KEY = "eventBatches";

/* UTILITIES */

EventActions.queueEventToWrite = (event) => {
  EventActions.eventsToWrite.push(event);
};

EventActions.getEventBatches = async () => {
  return RQ.StorageService.getRecord(EventActions.STORE_EVENTS_KEY)
    .then((storedEventBatches) => {
      return storedEventBatches || {};
    })
    .catch(() => {
      return {};
    });
};

EventActions.deleteBatches = async (batchIds) => {
  const batchesInStorage = await EventActions.getEventBatches();
  if (batchesInStorage) {
    batchIds.forEach((id) => {
      delete batchesInStorage[id];
    });
  }

  const newStoredBatches = {};
  newStoredBatches[EventActions.STORE_EVENTS_KEY] = batchesInStorage;

  await RQ.StorageService.saveRecord(newStoredBatches);
};

EventActions.getEventsToWrite = () => {
  /* also removes from the local events buffer */
  const _eventsToWrite = [...EventActions.eventsToWrite];
  EventActions.eventsToWrite = [];
  return _eventsToWrite;
};

/* batches recognised for sending here are added to batchesWaitingForAck */
EventActions.getBatchesToSend = async () => {
  let batchesToSend = [];

  const allEventBatches = await EventActions.getEventBatches();
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

    if (response.wasMessageSent) {
      await EventActions.handleAcknowledgements(response.payload.ackIds);
    } else {
      eventBatchesPayload.forEach((batch) => {
        EventActions.stopWaitingForAcknowledgement(batch.id);
      });
    }
  }
};

EventActions.writeEventsToLocalStorage = async () => {
  const createBatch = (eventsArray) => {
    const batchId = RQ.commonUtils.generateUUID();
    return {
      id: batchId,
      events: eventsArray,
      createdTs: Date.now(),
    };
  };

  const _eventsToWrite = [...EventActions.getEventsToWrite()];

  if (_eventsToWrite.length) {
    const newEventsBatch = createBatch(_eventsToWrite);

    return EventActions.getEventBatches().then(async (batchesInStorage) => {
      batchesInStorage[newEventsBatch.id] = newEventsBatch;

      // todo: needs to be updated if local storage structure is changed
      const newStoredBatches = {};
      newStoredBatches[EventActions.STORE_EVENTS_KEY] = batchesInStorage;

      return RQ.StorageService.saveRecord(newStoredBatches).then((_) => {
        EventActions.sendExtensionEvents();
      });
    });
  }
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
