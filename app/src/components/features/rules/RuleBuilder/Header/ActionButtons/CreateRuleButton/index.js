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
import { getModeData, setIsCurrentlySelectedRuleHasUnsavedChanges } from "../../../actions";
import { validateRule } from "./actions";
import { CONSTANTS as GLOBAL_CONSTANTS } from "@requestly/requestly-core";
import APP_CONSTANTS from "../../../../../../../config/constants";
import { redirectToRuleEditor } from "utils/RedirectionUtils";
import { getAllRedirectDestinationTypes, getAllResponseBodyTypes } from "utils/rules/misc";
import { ruleModifiedAnalytics } from "./actions";
import {
  trackErrorInRuleCreation,
  trackRuleCreatedEvent,
  trackRuleEditedEvent,
  trackRuleResourceTypeSelected,
} from "modules/analytics/events/common/rules";
import { snakeCase } from "lodash";
import ruleInfoDialog from "./RuleInfoDialog";
import { ResponseRuleResourceType } from "types/rules";
import { fixRuleRegexSourceFormat } from "utils/rules/misc";
import "../RuleEditorActionButtons.css";

// This is also the save rule button
const CreateRuleButton = ({
  location,
  isDisabled = false,
  isRuleEditorModal = false, // indicates if rendered from rule editor modal
  analyticEventRuleCreatedSource = "rule_editor_screen_header",
  ruleCreatedFromEditorModalCallback = (ruleId) => {},
  ruleEditorModalMode = APP_CONSTANTS.RULE_EDITOR_CONFIG.MODES.CREATE,
}) => {
  //Constants
  const navigate = useNavigate();
  const MODE = isRuleEditorModal ? ruleEditorModalMode : getModeData(location).MODE;

  //Global State
  const dispatch = useDispatch();
  const currentlySelectedRuleData = useSelector(getCurrentlySelectedRuleData);
  const isCurrentlySelectedRuleHasUnsavedChanges = useSelector(getIsCurrentlySelectedRuleHasUnsavedChanges);
  // const rules = getAllRules(state);
  const user = useSelector(getUserAuthDetails);
  const appMode = useSelector(getAppMode);

  const tooltipText = isDisabled
    ? "Only available in desktop app."
    : navigator.platform.match("Mac")
    ? "⌘+S"
    : "Ctrl+S";

  const currentActionText = MODE === APP_CONSTANTS.RULE_EDITOR_CONFIG.MODES.EDIT ? "Save" : "Create";

  const handleBtnOnClick = async () => {
    const createdBy = currentlySelectedRuleData?.createdBy || user?.details?.profile?.uid || null;
    const currentOwner = user?.details?.profile?.uid || null;
    const lastModifiedBy = user?.details?.profile?.uid || null;

    //Pre-validation regex fix
    const fixedRuleData = fixRuleRegexSourceFormat(dispatch, currentlySelectedRuleData);
    //Validation
    const ruleValidation = validateRule(fixedRuleData, dispatch, appMode);
    if (ruleValidation.result) {
      saveRule(appMode, {
        ...fixedRuleData,
        createdBy,
        currentOwner,
        lastModifiedBy,
      }).then(async () => {
        if (isRuleEditorModal) {
          ruleCreatedFromEditorModalCallback(currentlySelectedRuleData.id);
        } else {
          toast.success(`Successfully ${currentActionText.toLowerCase()}d the rule`);
        }

        setIsCurrentlySelectedRuleHasUnsavedChanges(dispatch, false);

        /* @sahil865gupta: Testing GA4 events and blending BQ data. Move this to separate module*/

        let rule_type = null;

        if (currentlySelectedRuleData && currentlySelectedRuleData.ruleType) {
          rule_type = currentlySelectedRuleData.ruleType;
        }
        if (MODE === APP_CONSTANTS.RULE_EDITOR_CONFIG.MODES.CREATE || isRuleEditorModal) {
          ruleInfoDialog(currentlySelectedRuleData.ruleType, appMode);

          trackRuleCreatedEvent({
            rule_type,
            description: currentlySelectedRuleData.description,
            destinationTypes:
              currentlySelectedRuleData.ruleType === GLOBAL_CONSTANTS.RULE_TYPES.REDIRECT
                ? getAllRedirectDestinationTypes(currentlySelectedRuleData)
                : null,
            source: analyticEventRuleCreatedSource,
            body_types:
              currentlySelectedRuleData.ruleType === GLOBAL_CONSTANTS.RULE_TYPES.RESPONSE
                ? getAllResponseBodyTypes(currentlySelectedRuleData)
                : null,
          });
        } else if (MODE === APP_CONSTANTS.RULE_EDITOR_CONFIG.MODES.EDIT) {
          trackRuleEditedEvent(
            rule_type,
            currentlySelectedRuleData.description,
            currentlySelectedRuleData.ruleType === GLOBAL_CONSTANTS.RULE_TYPES.REDIRECT
              ? getAllRedirectDestinationTypes(currentlySelectedRuleData)
              : null,
            analyticEventRuleCreatedSource
          );
        }
        ruleModifiedAnalytics(user);
        trackRQLastActivity("rule_saved");

        if (currentlySelectedRuleData?.ruleType === GLOBAL_CONSTANTS.RULE_TYPES.RESPONSE) {
          const resourceType = currentlySelectedRuleData?.pairs?.[0]?.response?.resourceType;

          if (resourceType && resourceType !== ResponseRuleResourceType.UNKNOWN) {
            trackRuleResourceTypeSelected(GLOBAL_CONSTANTS.RULE_TYPES.RESPONSE, snakeCase(resourceType));
          }
        }

        const ruleId = currentlySelectedRuleData.id;

        if (!isRuleEditorModal) {
          redirectToRuleEditor(navigate, ruleId, "create");
        }
      });
    } else {
      toast.warn(ruleValidation.message, {
        hideProgressBar: true,
      });
      trackErrorInRuleCreation(snakeCase(ruleValidation.error), currentlySelectedRuleData.ruleType);
    }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const saveFn = (event) => {
    if ((navigator.platform.match("Mac") ? event.metaKey : event.ctrlKey) && event.key.toLowerCase() === "s") {
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
          data-tour-id="rule-editor-create-btn"
          type="primary"
          className="text-bold"
          disabled={isDisabled}
          onClick={handleBtnOnClick}
        >
          {isCurrentlySelectedRuleHasUnsavedChanges ? "*" : null}
          {currentActionText === "Create" ? `${currentActionText} rule` : currentActionText}
        </Button>
      </Tooltip>
    </>
  );
};

export default CreateRuleButton;
