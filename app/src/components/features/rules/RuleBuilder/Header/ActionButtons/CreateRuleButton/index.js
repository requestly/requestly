import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Button, Tooltip } from "antd";
import { useNavigate } from "react-router-dom";
import { toast } from "utils/Toast.js";
//UTILS
import {
  getAppMode,
  getCurrentlySelectedRuleData,
  getIsCurrentlySelectedRuleHasUnsavedChanges,
  getUserAuthDetails,
} from "../../../../../../../store/selectors";
import { trackRQLastActivity } from "../../../../../../../utils/AnalyticsUtils";
//Actions
import { saveRule } from "../actions";
import {
  getModeData,
  setIsCurrentlySelectedRuleHasUnsavedChanges,
} from "../../../actions";
import { fixSourceRegexFormat, validateRule } from "./actions";
//Constants
import APP_CONSTANTS from "../../../../../../../config/constants";
import { redirectToRuleEditor } from "utils/RedirectionUtils";
import { ruleModifiedAnalytics } from "./actions";
import {
  trackErrorInRuleCreation,
  trackRuleCreatedEvent,
  trackRuleEditedEvent,
} from "modules/analytics/events/common/rules";
import { snakeCase } from "lodash";
import ruleInfoDialog from "./RuleInfoDialog";

const CreateRuleButton = ({ isDisabled, location }) => {
  //Constants
  const navigate = useNavigate();
  const { MODE } = getModeData(location);

  //Global State
  const dispatch = useDispatch();
  const currentlySelectedRuleData = useSelector(getCurrentlySelectedRuleData);
  const isCurrentlySelectedRuleHasUnsavedChanges = useSelector(
    getIsCurrentlySelectedRuleHasUnsavedChanges
  );
  // const rules = getAllRules(state);
  const user = useSelector(getUserAuthDetails);
  const appMode = useSelector(getAppMode);

  const tooltipText = isDisabled
    ? "Only available in desktop app."
    : navigator.platform.match("Mac")
    ? "⌘+S"
    : "Ctrl+S";

  const currentActionText =
    MODE === APP_CONSTANTS.RULE_EDITOR_CONFIG.MODES.EDIT ? "Save" : "Create";

  const handleBtnOnClick = async () => {
    const createdBy = user?.details?.profile?.uid || null;
    const currentOwner = user?.details?.profile?.uid || null;
    const lastModifiedBy = user?.details?.profile?.uid || null;

    //Prevalidation regex fix
    fixSourceRegexFormat(dispatch, currentlySelectedRuleData);
    //Validation
    const ruleValidation = validateRule(currentlySelectedRuleData);
    if (ruleValidation.result) {
      saveRule(
        appMode,
        dispatch,
        {
          ...currentlySelectedRuleData,
          createdBy,
          currentOwner,
          lastModifiedBy,
        },
        navigate
      ).then(() => {
        toast.success(
          `Successfully ${currentActionText.toLowerCase()}d the rule`
        );

        setIsCurrentlySelectedRuleHasUnsavedChanges(dispatch, false);

        /* @sahil865gupta: Testing GA4 events and blending BQ data. Move this to separate module*/

        let rule_type = null;

        if (currentlySelectedRuleData && currentlySelectedRuleData.ruleType) {
          rule_type = currentlySelectedRuleData.ruleType;
        }
        if (MODE === APP_CONSTANTS.RULE_EDITOR_CONFIG.MODES.CREATE) {
          ruleInfoDialog(currentlySelectedRuleData.ruleType, appMode);

          trackRuleCreatedEvent(
            rule_type,
            currentlySelectedRuleData.description
          );
        } else if (MODE === APP_CONSTANTS.RULE_EDITOR_CONFIG.MODES.EDIT) {
          trackRuleEditedEvent(
            rule_type,
            currentlySelectedRuleData.description
          );
        }
        ruleModifiedAnalytics(user);
        trackRQLastActivity("rule_saved");

        const ruleId = currentlySelectedRuleData.id;
        redirectToRuleEditor(navigate, ruleId);
      });
    } else {
      toast.warn(ruleValidation.message, {
        hideProgressBar: true,
      });
      trackErrorInRuleCreation(
        snakeCase(ruleValidation.error),
        currentlySelectedRuleData.ruleType
      );
    }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const saveFn = (event) => {
    if (
      (navigator.platform.match("Mac") ? event.metaKey : event.ctrlKey) &&
      event.key.toLowerCase() === "s"
    ) {
      event.preventDefault();
      handleBtnOnClick();
    }
  };

  useEffect(() => {
    document.addEventListener("keydown", saveFn);
    return () => {
      document.removeEventListener("keydown", saveFn);
    };
  }, [saveFn]);

  return (
    <>
      <Tooltip title={tooltipText} placement="top">
        <Button
          type="primary"
          className="text-bold"
          disabled={isDisabled}
          onClick={handleBtnOnClick}
        >
          {isCurrentlySelectedRuleHasUnsavedChanges ? "*" : null}
          {currentActionText === "Create"
            ? `${currentActionText} rule`
            : currentActionText}
        </Button>
      </Tooltip>
    </>
  );
};

export default CreateRuleButton;
