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
};

initAjaxRequestInterceptor();
