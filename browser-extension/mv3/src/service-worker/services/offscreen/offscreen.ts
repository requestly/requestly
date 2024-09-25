import config from "common/config";

let webAppIframe: HTMLIFrameElement;

const handleMessages = async (message: any) => {
  if (message.target !== "offscreen") {
    return false;
  }

  switch (message.action) {
    case "load_webapp":
      loadWebapp(message.urlParams);
      break;

    case "log_events":
      sendMessageToWebApp(message);
  }

  return false;
};

const loadWebapp = (urlParams: Record<string, string>) => {
  const iframe = document.createElement("iframe");
  const urlSearchParams = new URLSearchParams(urlParams);

  iframe.src = `${config.WEB_URL}?${urlSearchParams.toString()}`;
  iframe.className = "__rq_webApp";
  iframe.onload = () => {
    webAppIframe = iframe;
  };

  document.body.appendChild(iframe);
};

const sendMessageToWebApp = (message: Record<string, any>) => {
  webAppIframe.contentWindow?.postMessage({
    message,
    source: "offscreen_document",
  });
};

chrome.runtime.onMessage.addListener(handleMessages);
