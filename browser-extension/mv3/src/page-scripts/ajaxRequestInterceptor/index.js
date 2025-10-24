import { initFetchInterceptor } from "./fetch";
import { initXhrInterceptor } from "./xhr";
import { sendCacheSharedStateMessage } from "./utils";

const initAjaxRequestInterceptor = () => {
  let isDebugMode;
  try {
    isDebugMode = window && window.localStorage && localStorage.isDebugMode;
  } catch (e) {}

  initXhrInterceptor(isDebugMode);
  initFetchInterceptor(isDebugMode);

  if (window.top === window.self) {
    window.addEventListener("beforeunload", () => {
      sendCacheSharedStateMessage();
    });
  }
};

initAjaxRequestInterceptor();
