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
    .catch((err) => {
      console.log("BG: error getting analytics events from local storage", err);
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

  await RQ.StorageService.saveRecord(newStoredBatches).then((_) =>
    console.log("ack batches cleared")
  );
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
  const batchIndex = EventActions.batchesWaitingForAck.findIndex(
    (batch) => batch === batchId
  );
  if (batchIndex !== -1) {
    EventActions.batchesWaitingForAck.splice(batchIndex, 1);
  } else {
    console.warn("Weird: receiving duplicate event acknowledgements");
  }
};

EventActions.handleAcknowledgements = async (acknowledgedBatchIds) => {
  const batchesToDelete = acknowledgedBatchIds.filter((acknowledgedBatch) =>
    EventActions.batchesWaitingForAck.includes(acknowledgedBatch)
  );

  if (batchesToDelete) {
    EventActions.deleteBatches(batchesToDelete);

    batchesToDelete.forEach((batchId) => {
      EventActions.stopWaitingForAcknowledgement(batchId);
    });
  }
};

/* CORE */

// MAIN SENDING ENGINE
EventActions.sendExtensionEvents = async () => {
  const lastTriedTabIds = [];

  const useEngine = await RQ.StorageService.getRecord(
    RQ.STORAGE_KEYS.USE_EVENTS_ENGINE
  );

  while (useEngine !== false && BG.isAppOnline) {
    /* Getting one UI tab (that we haven't tried sending) */
    const appTabId = await BG.Methods.getAppTabs().then((tabs) => {
      const filteredTab = tabs.find((tab) => !lastTriedTabIds.includes(tab.id));
      if (filteredTab) {
        lastTriedTabIds.push(filteredTab.id);
        return filteredTab.id;
      } else {
        BG.isAppOnline = false;
        return null;
      }
    });

    if (!appTabId) break;

    const eventBatchesPayload = await EventActions.getBatchesToSend();
    if (!eventBatchesPayload) break;

    const extensionEventsMessage = {
      action: RQ.EXTENSION_MESSAGES.SEND_EXTENSION_EVENTS,
      eventBatches: eventBatchesPayload,
    };
    const response = await BG.Methods.sendMessageToApp(
      extensionEventsMessage,
      appTabId
    )
      .then((payload) => {
        console.log("!!!debug", "response received from app:", payload);
        if (payload) {
          return { wasMessageSent: true, payload };
        }
      })
      .catch((err) => {
        // todo: can add check if timeout based on err
        console.log("!!!debug", "sendMessageToApp timed out");
        return { wasMessageSent: false };
      });

    if (response.wasMessageSent) {
      await EventActions.handleAcknowledgements(response.payload.ackIds);
      break;
    } else {
      eventBatchesPayload.forEach((batchId) => {
        EventActions.stopWaitingForAcknowledgement(batchId);
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

      return RQ.StorageService.saveRecord(newStoredBatches)
        .then((_) => {
          console.log(
            "BG to LOCAL: Events Write complete for batch",
            newEventsBatch.id
          );
          EventActions.sendExtensionEvents();
        })
        .catch((err) =>
          console.error("BG to LOCAL: Error writing batch", newEventsBatch, err)
        );
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
