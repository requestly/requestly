const EventActions = {};

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
