const EventActions = {};

EventActions.sendExtensionEvents = async () => {
  if (!BG.isAppOnline) {
    return;
  }

  let ackReceived = false;

  while (BG.isAppOnline && !ackReceived) {
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

    await BG.Methods.sendMessageToApp(extensionEventsMessage, appTabId).then(
      (res) => {
        console.log("!!!debug", "resp msg to app", res);
        if (res.received) {
          ackReceived = true;
          console.log("!!!debug", "ack rcvd in bg!! clear the events!!");
        }
      }
    );
  }
};
