import { DesktopAppManager } from "./desktopAppManager";

const desktopApp = new DesktopAppManager();

export const connectToDesktopAppAndApplyProxy = () => desktopApp.connectAndSetupProxy();

export const disconnectFromDesktopAppAndRemoveProxy = () => desktopApp.disconnect();

export const checkIfDesktopAppOpen = () => desktopApp.checkDesktopAppStatus();
