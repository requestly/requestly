export const supportedBrowserExtensions = [
  {
    name: "Chrome",
    iconURL: "https://img.icons8.com/fluent/128/000000/chrome.png",
    downloadURL:
      window.location.hostname === "beta.requestly.io"
        ? "https://chromewebstore.google.com/detail/requestly-http-intercepti/fmpmigcoagdbodbmhnhdbkejjpdfipef"
        : "https://chrome.google.com/webstore/detail/requestly-redirect-url-mo/mdnleldcmiljblolnjhpnblkcekpdkpa",
    title: "Chrome Extension",
    alt: `Requestly for chrome |  proxyman alternatives | mocky.io alternative | Fiddler Alternative | charles proxy alternative`,
  },
  {
    name: "Firefox",
    iconURL: "https://img.icons8.com/color/128/000000/firefox.png",
    downloadURL: "https://app.requestly.in/firefox/builds/requestly-latest.xpi",
    title: "Firefox Extension",
    alt: `Requestly for firefox |  proxyman alternatives | mocky.io alternative | Fiddler Alternative | charles proxy alternative`,
  },
  {
    name: "Edge",
    iconURL: "https://img.icons8.com/color/128/000000/ms-edge-new.png",
    downloadURL:
      "https://microsoftedge.microsoft.com/addons/detail/requestly-redirect-url-/ehghoapnlpepjmfbgaomdiilchcjemak",
    title: "Edge Extension",
    alt: `Requestly for edge |  proxyman alternatives | mocky.io alternative | Fiddler Alternative | charles proxy alternative`,
  },
  {
    name: "Safari",
    iconURL: "https://img.icons8.com/color/128/000000/safari.png",
    downloadURL: "https://apps.apple.com/in/app/requestly-api-dev-toolkit/id6741503024",
    title: "Safari Extension",
    alt: `Requestly for safari |  proxyman alternatives | mocky.io alternative | Fiddler Alternative | charles proxy alternative`,
  },
];
