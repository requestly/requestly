// @ts-nocheck
import Logger from "lib/logger";
// @ts-ignore
import posthog from "posthog-js";
import featureFlag from "utils/feature-flag";
import { getEmailType, getDomainFromEmail } from "utils/FormattingHelper";
import { buildBasicUserProperties } from "../utils";
import { IAnalyticsIntegration } from "./common";
import { maxRetryDuration, retryDuration } from "../config";
import { PAGE_VIEW } from "../events/misc/constants";
import { getCookie } from "utils/CookieUtils";

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
      initPosthogUser(user);
      featureFlag.init();
    }

    // @ts-ignore
    if (!window.POSTHOG_INTEGRATION_DONE) {
      posthog.init("phc_MhqVyU0ZOCTwShM1pg9WaiE29hBD1EjxERGe5vX3E0k", {
        api_host: "https://app.posthog.com",
        disable_session_recording: true,
        opt_in_site_apps: true,
        autocapture: false,
        loaded: function (posthog: any) {
          initPosthogUser(user);
          featureFlag.init();
          fetchPosthogId();
        },
        session_recording: {
          maskAllInputs: false,
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

    // Disabling events Tracking for posthog
    return;

    if (this.isIntegrationDone) {
      posthog.capture(eventName, eventParams);
    } else {
      if (Date.now() - this.startTime > maxRetryDuration) return;

      Logger.log(
        `Oops! Posthog init is still pending, will retry after 2s. Retry=${retry}`
      );
      setTimeout(() => {
        this.trackEvent(eventName, eventParams, retry + 1);
      }, retryDuration);
    }
  };

  trackAttr = (name: string, value: string, retry: number = 0) => {
    if (this.isIntegrationDone) {
      try {
        // @ts-ignore
        window.rq_posthog = window.rq_posthog || {};
        // @ts-ignore
        window.rq_posthog.attributesToSync =
          window.rq_posthog.attributesToSync || {};
        // @ts-ignore
        window.rq_posthog.attributesToSync[name] = value;
      } catch (_e) {
        // Logger.log("Posthog hasn't loaded yet!");
      }
    } else {
      if (Date.now() - this.startTime > maxRetryDuration) return;

      Logger.log(
        `Oops! Posthog init is still pending, will retry after 2s. Retry=${retry}`
      );
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
          Logger.log(
            `[Analytics] Batch Syncing Posthog Attributes`,
            window.rq_posthog.attributesToSync
          );
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

export const fetchPosthogId = () => {
  const posthogCookieString = getCookie(
    "ph_phc_MhqVyU0ZOCTwShM1pg9WaiE29hBD1EjxERGe5vX3E0k_posthog"
  );

  let distinctId = null;

  try {
    distinctId = JSON.parse(posthogCookieString).distinct_id;
  } catch (e) {
    Logger.error(e);
  }

  window.posthogDistinctId = distinctId;
  return distinctId;
};

const initPosthogUser = (user: any) => {
  if (!user) {
    return;
  }

  const userData = buildBasicUserProperties(user);
  const emailType = getEmailType(userData.email);
  const emailDomain = getDomainFromEmail(userData.email);

  posthog.identify(userData.uid);
  posthog.people.set({ email: userData.email });
  if (emailType === "BUSINESS") {
    posthog.group("BUSINESS", emailDomain, {
      company_domain: emailDomain,
    });
  }

  // Start Session Recording for only logged in users
  // Disabling session recording for limit breach
  // posthog.startSessionRecording();
};

const posthogIntegration = new PosthogIntegration();
export default posthogIntegration;
