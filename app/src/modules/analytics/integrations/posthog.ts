// @ts-nocheck
import Logger from "lib/logger";
// @ts-ignore
import posthog from "posthog-js";
import { IAnalyticsIntegration } from "./common";
import { maxRetryDuration, retryDuration } from "../config";
import { PAGE_VIEW } from "../events/misc/constants";

const blacklisted_events = [PAGE_VIEW];

class PosthogIntegration implements IAnalyticsIntegration {
  isIntegrationDone = false;
  enabled = true;
  startTime = Date.now();

  init = (user: any) => {
    Logger.log("Posthog Integration Start");
    this.initAttrBatchSyncing();

    // @ts-ignore
    if (window.POSTHOG_INTEGRATION_DONE) {
      posthog.reset();
    }

    // @ts-ignore
    if (!window.POSTHOG_INTEGRATION_DONE) {
      posthog.init("phc_uNIYhy7rJ7GZF0H7aYtHvCOHIaCjB6wKICG9dkNUEDy", {
        api_host: "https://app.posthog.com",
        persistence: "memory",
        disable_session_recording: true,
        opt_in_site_apps: true,
        autocapture: false,
        session_recording: {
          maskAllInputs: true,
          maskInputOptions: {
            password: true,
          },
        },
      });
      // @ts-ignore
      window.POSTHOG_INTEGRATION_DONE = true;
      this.isIntegrationDone = true;
      Logger.log("Posthog Integration Done");
    }
  };

  trackEvent = (eventName: string, eventParams: any, retry = 0) => {
    if (blacklisted_events.includes(eventName)) {
      Logger.log(`[Analytics] Posthog ${eventName} blacklisted`);
      return;
    }

    // Disabling events Tracking for posthog.
    // TODO: Move to new account
    /*
    if (true) return;

    if (this.isIntegrationDone) {
      posthog.capture(eventName, eventParams);
    } else {
      if (Date.now() - this.startTime > maxRetryDuration) return;

      Logger.log(`Oops! Posthog init is still pending, will retry after 2s. Retry=${retry}`);
      setTimeout(() => {
        this.trackEvent(eventName, eventParams, retry + 1);
      }, retryDuration);
    }
    */
  };

  trackAttr = (name: string, value: string, retry: number = 0) => {
    if (this.isIntegrationDone) {
      try {
        // @ts-ignore
        window.rq_posthog = window.rq_posthog || {};
        // @ts-ignore
        window.rq_posthog.attributesToSync = window.rq_posthog.attributesToSync || {};
        // @ts-ignore
        window.rq_posthog.attributesToSync[name] = value;
      } catch (_e) {
        // Logger.log("Posthog hasn't loaded yet!");
      }
    } else {
      if (Date.now() - this.startTime > maxRetryDuration) return;

      Logger.log(`Oops! Posthog init is still pending, will retry after 2s. Retry=${retry}`);
      setTimeout(() => {
        this.trackAttr(name, value, retry + 1);
      }, retryDuration);
    }
  };

  initAttrBatchSyncing = () => {
    setInterval(() => {
      // @ts-ignore
      if (window.rq_posthog && window.rq_posthog.attributesToSync) {
        try {
          // @ts-ignore
          Logger.log(`[Analytics] Batch Syncing Posthog Attributes`, window.rq_posthog.attributesToSync);
          // @ts-ignore
          posthog.people.set(window.rq_posthog.attributesToSync);
          // @ts-ignore
          window.rq_posthog.attributesToSync = null;
        } catch (e) {
          Logger.error("Error syncing Posthog attributes");
        }
      }
    }, 20000);
  };
}

const posthogIntegration = new PosthogIntegration();
export default posthogIntegration;
