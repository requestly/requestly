import FEATURES from "config/constants/sub/features";
import { HomeEcosystemTypes } from "./types";
import PATHS from "config/constants/sub/paths";

export const homeCardsData = {
  [HomeEcosystemTypes.DEVELOPMENT]: [
    {
      title: "Make an API request",
      description: "Make a request to an API by specifying endpoint and other request attributes or import from cURL",
      tag: FEATURES.API_CLIENT,
      navigateTo: PATHS.API_CLIENT.RELATIVE,
    },
    {
      title: "Create a mock API",
      description: "Generate custom API responses without actually having a pre-built API or backend server",
      tag: FEATURES.MOCK_V2,
      navigateTo: PATHS.MOCK_SERVER_V2.RELATIVE,
    },
  ],
  [HomeEcosystemTypes.TESTING]: [
    {
      title: "Modify network requests",
      description: "Create rules to modify HTTP requests & responses - URL redirects, Modify APIs or Headers",
      tag: FEATURES.RULES,
      navigateTo: PATHS.RULES.MY_RULES.ABSOLUTE,
    },
  ],
  [HomeEcosystemTypes.DEBUGGING]: [
    {
      title: "Debug faster with Session Recording",
      description: "Capture screen, mouse movement, network, console and more of any browser session.",
      tag: FEATURES.SESSION_RECORDING,
      navigateTo: PATHS.SESSIONS.RELATIVE,
    },
  ],
};
