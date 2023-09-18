import { RQSessionAttributes, RQSessionEvents } from "@requestly/web-sdk";
import { compressEvents } from "./sessionEventsUtils";
import { generateDraftSessionTitle } from "./sessionEventsUtils";
import { StorageService } from "init";
import { trackDraftSessionAutoSaved } from "modules/analytics/events/features/sessionRecording";
import APP_CONSTANTS from "config/constants";
import { MAX_CACHED_DRAFT_SESSIONS } from "./constants";

export const cacheDraftSession = async (attributes: RQSessionAttributes, events: RQSessionEvents, tabId: string) => {
  if (!attributes && !events) return;

  const sessionToCache = {
    metadata: { name: generateDraftSessionTitle(attributes.url), ...attributes },
    events: compressEvents(events),
  };
  const cacheSessionId = `${tabId}-${Date.now()}`;

  const draftSessions = await StorageService().getRecord(APP_CONSTANTS.DRAFT_SESSIONS);
  if (!draftSessions) {
    StorageService()
      .saveRecord({ [APP_CONSTANTS.DRAFT_SESSIONS]: { [cacheSessionId]: sessionToCache } })
      .then(() => {
        trackDraftSessionAutoSaved();
      })
      .catch((e) => console.log(e));
  } else {
    if (cacheSessionId in draftSessions) {
      delete draftSessions[cacheSessionId];
    }

    if (Object.keys(draftSessions).length === MAX_CACHED_DRAFT_SESSIONS) {
      const oldestDraftKey = Object.keys(draftSessions).sort(
        (a, b) => draftSessions[a].startTime - draftSessions[b].startTime
      )[0];
      delete draftSessions[oldestDraftKey];
    }
    StorageService()
      .saveRecord({
        [APP_CONSTANTS.DRAFT_SESSIONS]: { ...draftSessions, [cacheSessionId]: sessionToCache },
      })
      .then(() => {
        trackDraftSessionAutoSaved();
      })
      .catch((e) => console.log(e));
  }
};

export const clearDraftSessionCache = async (tabId: string) => {
  const draftSessions = await StorageService().getRecord(APP_CONSTANTS.DRAFT_SESSIONS);
  if (draftSessions && tabId in draftSessions) {
    delete draftSessions[tabId];
    StorageService().saveRecord({ [APP_CONSTANTS.DRAFT_SESSIONS]: { ...draftSessions } });
  }
};
