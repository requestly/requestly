import React from "react";
// ICONS
import { FaChrome, FaDesktop, FaWordpress } from "react-icons/fa";
import { SiCloudflare } from "react-icons/si";
// UTILS
import { getShortAppModeName, getPrettyAppModeName } from "../../../../../../../utils/FormattingHelper";
// CONSTANTS
import { CONSTANTS as GLOBAL_CONSTANTS } from "@requestly/requestly-core";
import APP_CONSTANTS from "../../../../../../../config/constants";

export const AppModesConfig = {
  [GLOBAL_CONSTANTS.APP_MODES.EXTENSION]: {
    appMode: GLOBAL_CONSTANTS.APP_MODES.EXTENSION,
    fullName: getPrettyAppModeName(GLOBAL_CONSTANTS.APP_MODES.EXTENSION),
    shortName: getShortAppModeName(GLOBAL_CONSTANTS.APP_MODES.EXTENSION),
    Icon: () => <FaChrome size="1.5em" />,
    iconBackgroundColor: "red",
    description: "Requestly browser extension available for Chrome & Firefox",
    actionLabel: "Add to Chrome",
    actionLink: APP_CONSTANTS.LINKS.CHROME_EXTENSION,
  },
  [GLOBAL_CONSTANTS.APP_MODES.DESKTOP]: {
    appMode: GLOBAL_CONSTANTS.APP_MODES.DESKTOP,
    fullName: getPrettyAppModeName(GLOBAL_CONSTANTS.APP_MODES.DESKTOP),
    shortName: getShortAppModeName(GLOBAL_CONSTANTS.APP_MODES.DESKTOP),
    Icon: () => <FaDesktop size="1.5em" />,
    iconBackgroundColor: "green",
    description: "Run Requestly on top of your favourite apps – Spotify, Slack, Postman, VSCode",
    actionLabel: "Download for MacOS, Windows & Linux",
    actionLink: APP_CONSTANTS.LINKS.REQUESTLY_DESKTOP_APP,
  },
  [GLOBAL_CONSTANTS.APP_MODES.WORDPRESS]: {
    appMode: GLOBAL_CONSTANTS.APP_MODES.WORDPRESS,
    fullName: getPrettyAppModeName(GLOBAL_CONSTANTS.APP_MODES.WORDPRESS),
    shortName: getShortAppModeName(GLOBAL_CONSTANTS.APP_MODES.WORDPRESS),
    Icon: () => <FaWordpress size="1.7em" />,
    iconBackgroundColor: "teal",
    description: "Use Requestly in Wordpress to create redirects and mocks",
    actionLabel: "COMING SOON",
  },
  [GLOBAL_CONSTANTS.APP_MODES.CLOUDFLARE]: {
    appMode: GLOBAL_CONSTANTS.APP_MODES.CLOUDFLARE,
    fullName: getPrettyAppModeName(GLOBAL_CONSTANTS.APP_MODES.CLOUDFLARE),
    shortName: getShortAppModeName(GLOBAL_CONSTANTS.APP_MODES.CLOUDFLARE),
    Icon: () => <SiCloudflare size="1.7em" />,
    iconBackgroundColor: "orange",
    description: "Use Requestly in Cloudflare to modify requests even before it reaches your web server",
    actionLabel: "COMING SOON",
  },
};
