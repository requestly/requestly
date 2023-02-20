import { trackEvent } from "modules/analytics";
import { MOCKSV2 } from "../constants";

export const trackCreateMockEvent = (
  id: string,
  type: string,
  file_type: string,
  source?: string
) => {
  const params = {
    version: 2,
    id,
    type,
    file_type,
    source,
  };
  trackEvent(MOCKSV2.CREATED, params);
};

export const trackUpdateMockEvent = (
  id: string,
  type: string,
  file_type: string
) => {
  const params = {
    version: 2,
    id,
    type,
    file_type,
  };
  trackEvent(MOCKSV2.UPDATED, params);
};

export const trackDeleteMockEvent = (
  id: string,
  type: string,
  file_type: string
) => {
  const params = {
    version: 2,
    id,
    type,
    file_type,
  };
  trackEvent(MOCKSV2.DELETED, params);
};
