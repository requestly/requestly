import { trackEvent } from "modules/analytics";
import { CODE_EDITOR } from "./constants";
import { AnalyticEventProperties } from "componentsV2/CodeEditor/types";

export const trackCodeEditorCodeCopied = () => {
  trackEvent(CODE_EDITOR.CODE_COPIED);
};

export const trackCodeEditorCodePrettified = () => {
  trackEvent(CODE_EDITOR.CODE_PRETTIFIED);
};

export const trackCodeEditorCodeMinified = () => {
  trackEvent(CODE_EDITOR.CODE_MINIFIED);
};

export const trackCodeEditorExpandedClick = (props: AnalyticEventProperties) => {
  const params = { ...props };
  trackEvent(CODE_EDITOR.EXPANDED, params);
};

export const trackCodeEditorCollapsedClick = (props: AnalyticEventProperties) => {
  const params = { ...props };
  trackEvent(CODE_EDITOR.COLLAPSED, params);
};
