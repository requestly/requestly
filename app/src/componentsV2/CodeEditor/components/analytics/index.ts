import { trackEvent } from "modules/analytics";
import { CODE_EDITOR } from "./constants";

export const trackCodeEditorCodeCopied = () => {
  trackEvent(CODE_EDITOR.CODE_COPIED);
};

export const trackCodeEditorCodePrettified = () => {
  trackEvent(CODE_EDITOR.CODE_PRETTIFIED);
};

export const trackCodeEditorCodeMinified = () => {
  trackEvent(CODE_EDITOR.CODE_MINIFIED);
};
