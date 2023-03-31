const EventActions = {};

let eventsToWrite = [];
let eventWriterInterval = null;

const LOCAL_ANALYTICS_KEY = "eventBatches";

const generateUUID = () => parseInt(Math.random() * 10000).toString(); // todo: create and use uuid uitility from common

EventActions.queueEventToWrite = (event) => {
  // todo: generate uuid for each event
  eventsToWrite.push(event);
};

EventActions.getEventBatches = async () => {
  const events = RQ.StorageService.getRecord(LOCAL_ANALYTICS_KEY)
    .then((storedEvents) => {
      // these are considered the events that are ready to be sent
      // not considering events in `eventsToWrite` here
      try {
        return JSON.parse(storedEvents);
      } catch (error) {
        return {};
      }
    })
    .catch((err) => {
      console.log("BG: error getting analytics events from local storage", err);
      return {};
    });

  return events; // promise that resolves to events
};

function getEventsToWrite() {
  // remove from the local array buffer
  const _eventsToWrite = [...eventsToWrite];
  eventsToWrite = [];
  return _eventsToWrite;
}

async function writeEventsToLocalStorage() {
  const createBatch = (eventsArray) => {
    const batchId = generateUUID();
    return {
      id: batchId,
      events: eventsArray,
      createdTS: Date.now(),
    };
  };

  const _eventsToWrite = [...getEventsToWrite()];

  if (_eventsToWrite.length) {
    // // write batched events to local storage
    // return EventActions.getEventBatches().then(async (storageEvents) => {
    //   if (storageEvents) _eventsToWrite.push(...storageEvents);

    //   const newAnalyticsEntry = {};
    //   newAnalyticsEntry[LOCAL_ANALYTICS_KEY] = _eventsToWrite;
    //   return RQ.StorageService.saveRecord(newAnalyticsEntry).then((_) =>
    //     console.log("BG to LOCAL: Events Write complete")
    //   );
    // });
    // now these events are considered ready to be sent to UI
    // todo: call sendEvents() // being implemented separately by @nafees

    /*
      1. create an event batch
      2. save an event batch
      3. call sendEvents()
    */
    const eventsBatch = createBatch(_eventsToWrite);

    return EventActions.getEventBatches().then(async (storageBatches) => {
      storageBatches[eventsBatch.id] = eventsBatch;

      const newStoredBatches = {};
      newStoredBatches[LOCAL_ANALYTICS_KEY] = JSON.stringify(storageBatches);

      return RQ.StorageService.saveRecord(newStoredBatches)
        .then((_) =>
          console.log(
            "BG to LOCAL: Events Write complete for batch",
            eventsBatch.id
          )
        )
        .catch((err) =>
          console.error("BG to LOCAL: Error writing batch", eventsBatch.id, err)
        );
    });
    // EventActions.sendExtensionEvents()
  }
}

EventActions.startPeriodicEventWriter = async (intervalTime = 2000) => {
  if (!eventWriterInterval) {
    eventWriterInterval = setInterval(async () => {
      await writeEventsToLocalStorage();
    }, intervalTime);
  }

  return eventWriterInterval;
};

EventActions.sendExtensionEvents = async () => {
  if (!BG.isAppOnline) {
    return;
  }

  while (BG.isAppOnline) {
    const lastTriedTabIds = [];

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

    if (!appTabId) {
      break;
    }

    // read events from local storage
    // create new batch of events to send
    // do the above in a separate function

    // create message object using the batch
    const extensionEventsMessage = {
      action: RQ.EXTENSION_MESSAGES.SEND_EXTENSION_EVENTS,
      events: {}, // it should fetched from a separate function only after all the checks
    };

    try {
      const response = await BG.Methods.sendMessageToApp(
        extensionEventsMessage,
        appTabId
      );
      console.log("!!!debug", "response received from app:", response);
      if (response) {
        break;
      }
    } catch {
      console.log("!!!debug", "sendMessageToApp timed out");
    }
  }
};
