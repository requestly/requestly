import config from "../../config";
import { Rule } from "../../types";
import { RuleEditorUrlFragment, ColorScheme } from "./types";

interface PostMessageData {
  author: string;
  action: string;
  payload: {
    ruleData: Rule;
  };
}

const REQUESTLY_POST_MESSAGE_AUTHOR = "requestly";

export const createRule = <T extends Rule>(
  ruleTypeUrlFragment: RuleEditorUrlFragment,
  initRuleData: (rule: T) => void,
  inputSelectorToFocus?: string
) => {
  const editorUrl = `${config.WEB_URL}/rules/editor/create/${ruleTypeUrlFragment}`;
  let editorWindow: Window;
  const onMessageReceived = (event: MessageEvent<PostMessageData>) => {
    const { author, action, payload } = event.data;
    const { ruleData } = payload;
    if (
      author === REQUESTLY_POST_MESSAGE_AUTHOR &&
      action === "ruleEditor:ready"
    ) {
      initRuleData(ruleData as T); // in-place update on ruleData
      editorWindow?.postMessage(
        {
          author: REQUESTLY_POST_MESSAGE_AUTHOR,
          action: "ruleEditor:loadData",
          payload: {
            ruleData,
            inputSelectorToFocus,
          },
        },
        "*"
      );
      window.removeEventListener("message", onMessageReceived);
    }
  };
  window.addEventListener("message", onMessageReceived);
  editorWindow = window.open(editorUrl, "_blank");
};

export const getCurrentColorScheme = (): ColorScheme => {
  return window.matchMedia("(prefers-color-scheme: dark)")?.matches
    ? ColorScheme.DARK
    : ColorScheme.LIGHT;
};

export const onColorSchemeChange = (
  callback: (theme: ColorScheme) => void
): void => {
  window
    .matchMedia("(prefers-color-scheme: dark)")
    .addEventListener("change", function (e) {
      callback(e.matches ? ColorScheme.DARK : ColorScheme.LIGHT);
    });
};
