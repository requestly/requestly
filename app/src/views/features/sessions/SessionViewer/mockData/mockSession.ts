import { RQSession } from "@requestly/web-sdk";
import mockEnvironment from "./mockEnvironment";
import mockNetworkEvents from "./mockNetworkEvents";
import mockRrwebEvents from "./mockRrwebEvents";

const mockSession: RQSession = {
  attributes: {
    // @ts-ignore
    url: mockRrwebEvents[0].data.href,
    startTime: mockRrwebEvents[0].timestamp,
    duration: mockRrwebEvents[mockRrwebEvents.length - 1].timestamp - mockRrwebEvents[0].timestamp,
    environment: mockEnvironment,
  },
  events: {
    rrweb: mockRrwebEvents,
    network: mockNetworkEvents,
  },
};

export default mockSession;
