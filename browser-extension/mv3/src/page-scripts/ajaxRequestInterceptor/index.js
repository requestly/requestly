import { PUBLIC_NAMESPACE } from "common/constants";
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

  window.top.addEventListener("beforeunload", () => {
    sendCacheSharedStateMessage();
  });
};

initAjaxRequestInterceptor();
