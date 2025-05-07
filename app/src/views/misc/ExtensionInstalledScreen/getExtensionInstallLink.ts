import { supportedBrowserExtensions } from "components/misc/InstallExtensionCTA/supportedBrowserExtensions";
import UAParser from "ua-parser-js";

export default function getExtensionInstallLink() {
  const parser = new UAParser();
  parser.setUA(window.navigator.userAgent);
  const result = parser.getResult();
  const browserDetected = result.browser.name;
  let currentBrowserData = supportedBrowserExtensions[0]; // default chrome

  for (let extensionData of supportedBrowserExtensions) {
    if (extensionData.name === browserDetected) {
      currentBrowserData = extensionData;
    }
  }

  return currentBrowserData.downloadURL;
}
