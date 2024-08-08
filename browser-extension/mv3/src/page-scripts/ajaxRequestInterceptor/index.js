import { PUBLIC_NAMESPACE } from "common/constants";
import { initFetchInterceptor } from "./fetch";
import { initXhrInterceptor } from "./xhr";

const initAjaxRequestInterceptor = () => {
  let isDebugMode;
  try {
    isDebugMode = window && window.localStorage && localStorage.isDebugMode;
  } catch (e) {}

  initXhrInterceptor(isDebugMode);
  initFetchInterceptor(isDebugMode);

  window.addEventListener("beforeunload", (event) => {
    window.postMessage(
      {
        action: "cacheSharedState",
        source: "requestly:client",
        sharedState: window.top[PUBLIC_NAMESPACE]?.sharedState,
      },
      window.location.href
    );
  });
};

initAjaxRequestInterceptor();
