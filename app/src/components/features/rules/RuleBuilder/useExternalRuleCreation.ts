import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setCurrentlySelectedRule } from "./actions";
import APP_CONSTANTS from "../../../../config/constants";
import { getCurrentlySelectedRuleData } from "store/selectors";
import { Rule } from "@requestly/shared/types/entities/rules";

const { RULE_EDITOR_CONFIG } = APP_CONSTANTS;
const REQUESTLY_POST_MESSAGE_AUTHOR = "requestly";

interface PostMessageData {
  author: string;
  action: string;
  payload: {
    ruleData: Rule;
    inputSelectorToFocus?: string;
  };
}

const useExternalRuleCreation = (mode: string): void => {
  const dispatch = useDispatch();
  const currentlySelectedRuleData = useSelector(getCurrentlySelectedRuleData);
  const hasSentReadyEventRef = useRef(false); // solves react18 issue of double mounting
  const inputSelectorRefToFocus = useRef<string>("");
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const onMessageReceived = (event: MessageEvent<PostMessageData>) => {
      const { author, action, payload } = event.data;
      if (author === REQUESTLY_POST_MESSAGE_AUTHOR && action === "ruleEditor:loadData") {
        const { ruleData, inputSelectorToFocus } = payload;
        setCurrentlySelectedRule(dispatch, ruleData);
        if (inputSelectorToFocus) {
          inputSelectorRefToFocus.current = inputSelectorToFocus;
        }
        setLoaded(true);
        window.removeEventListener("message", onMessageReceived);
      }
    };

    window.addEventListener("message", onMessageReceived);

    // cleanup
    return () => {
      window.removeEventListener("message", onMessageReceived);
    };
  }, [dispatch]);

  useEffect(() => {
    if (mode === RULE_EDITOR_CONFIG.MODES.CREATE && currentlySelectedRuleData) {
      if (!hasSentReadyEventRef.current) {
        window.opener?.postMessage(
          {
            author: REQUESTLY_POST_MESSAGE_AUTHOR,
            action: "ruleEditor:ready",
            payload: {
              ruleData: currentlySelectedRuleData,
            },
          },
          "*"
        );
        hasSentReadyEventRef.current = true;
      }
    }
  }, [mode, currentlySelectedRuleData]);

  useEffect(() => {
    if (loaded && inputSelectorRefToFocus.current) {
      setTimeout(() => {
        const input = document.querySelector(inputSelectorRefToFocus.current) as HTMLInputElement;

        if (input) {
          input.focus();
          input.selectionStart = input.value?.length;
        }
      }, 500); // sometimes app takes time to render the selected input
    }
  }, [loaded]);
};

export default useExternalRuleCreation;
