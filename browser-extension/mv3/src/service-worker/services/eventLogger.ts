import { getRefreshToken } from "../../utils";
import offscreenHandler from "./offscreen/offscreenHandler";

interface EventLog {
  eventName: string;
  eventParams: Record<string, any>;
  eventTs: number;
}

class EventLogger {
  private eventsQueue: EventLog[] = [];
  private eventLoggerInterval: NodeJS.Timeout = null;
  private eventsLimit = 10000;
  private eventLoggerPeriod = 20000;

  private queueEvent(event: EventLog) {
    const isRefreshTokenExists = !!getRefreshToken();
    if (!isRefreshTokenExists) {
      return;
    }

    if (this.eventsQueue.length > this.eventsLimit) {
      this.clearEventsQueue();
    }

    this.eventsQueue.push(event);

    if (!this.eventLoggerInterval) {
      this.startPeriodicEventLogger();
    }
  }

  private logEventsToOffscreen() {
    if (!this.eventsQueue.length) {
      return;
    }

    if (!offscreenHandler.isOffscreenWebappOpen()) {
      return;
    }

    offscreenHandler.sendMessage({
      action: "log_events",
      events: this.eventsQueue,
    });

    this.clearEventsQueue();
  }

  private startPeriodicEventLogger() {
    if (!offscreenHandler.isOffscreenWebappOpen()) {
      offscreenHandler.initWebAppOffscreen();
    }

    if (!this.eventLoggerInterval) {
      console.log("!!!debug", "started eventLogger");
      this.eventLoggerInterval = setInterval(() => {
        this.logEventsToOffscreen();
      }, this.eventLoggerPeriod);
    }

    return this.eventLoggerInterval;
  }

  private clearEventsQueue() {
    this.eventsQueue = [];
  }

  logEvent(eventName: string, eventParams: Record<string, any>) {
    const eventTs = Date.now();
    eventParams["log_source"] = "extension";
    this.queueEvent({ eventName, eventParams, eventTs });
  }
}

export const eventLogger = new EventLogger();

// self.eventLogger = eventLogger;
