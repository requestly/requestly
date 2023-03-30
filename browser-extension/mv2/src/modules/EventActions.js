const EventActions = {};

let eventsToWrite = [];
let eventWriterInterval = null;

const LOCAL_ANALYTICS_KEY = "analytics_event";

EventActions.queueEventToWrite = (event) => {
  // todo: generate uuid for each event
  eventsToWrite.push(event);
};

EventActions.getEvents = async () => {
  const events = RQ.StorageService.getRecord(LOCAL_ANALYTICS_KEY)
    .then((storedEvents) => {
      // these are considered the events that are ready to be sent
      // not considering events in `eventsBatch` here
      return storedEvents;
    })
    .catch((err) => {
      console.log("BG: error getting analytics events from local storage", err);
      return null;
    });

  return events; // promise that resolves to events
};

function getEventsToWrite() {
  // remove from the local batched array
  const _eventsToWrite = [...eventsToWrite];
  eventsToWrite = [];
  return _eventsToWrite;
}

async function writeEventsToLocalStorage() {
  const localEventsToWrite = [...getEventsToWrite()];

  if (localEventsToWrite.length) {
    // write batched events to local storage
    return EventActions.getEvents().then(async (storageEvents) => {
      if (storageEvents) localEventsToWrite.push(...storageEvents);

      const newAnalyticsEntry = {};
      newAnalyticsEntry[LOCAL_ANALYTICS_KEY] = localEventsToWrite;
      return RQ.StorageService.saveRecord(newAnalyticsEntry).then((_) =>
        console.log("BG to LOCAL: Events Write complete")
      );
    });
    // now these events are considered ready to be sent to UI
    // todo: call sendEvents() // being implemented separately by @nafees
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
