import React, { useCallback, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "utils/Toast.js";
import {
  getAppMode,
  getCurrentlySelectedRuleData,
  getIsCurrentlySelectedRuleHasUnsavedChanges,
  getUserAttributes,
} from "../../../../../../../../store/selectors";
import { getUserAuthDetails } from "store/slices/global/user/selectors";
import { submitAttrUtil, trackRQLastActivity } from "../../../../../../../../utils/AnalyticsUtils";
import { saveRule, validateSyntaxInRule } from "../actions";
import {
  getModeData,
  setIsCurrentlySelectedRuleHasUnsavedChanges,
} from "../../../../../../../../components/features/rules/RuleBuilder/actions";
import { validateRule } from "./actions";
import { CONSTANTS as GLOBAL_CONSTANTS } from "@requestly/constants";
import APP_CONSTANTS from "../../../../../../../../config/constants";
import { redirectToRuleEditor } from "utils/RedirectionUtils";
import { getAllRedirectDestinationTypes, getAllResponseBodyTypes } from "utils/rules/misc";
import { ruleModifiedAnalytics } from "./actions";
import {
  trackErrorInRuleCreation,
  trackRuleCreatedEvent,
  trackRuleEditedEvent,
} from "modules/analytics/events/common/rules";
import { snakeCase } from "lodash";
import { PremiumFeature } from "features/pricing";
import { FeatureLimitType } from "hooks/featureLimiter/types";
import { isExtensionInstalled } from "actions/ExtensionActions";
import { globalActions } from "store/slices/global/slice";
import { SOURCE } from "modules/analytics/events/common/constants";
import { AuthConfirmationPopover } from "components/hoc/auth/AuthConfirmationPopover";
import { useFeatureValue } from "@growthbook/growthbook-react";
import { KEYBOARD_SHORTCUTS } from "../../../../../../../../constants/keyboardShortcuts";
import { RBACButton } from "features/rbac";
import "../RuleEditorActionButtons.css";
import * as Sentry from "@sentry/react";

const getEventParams = (rule) => {
  const eventParams = {};
  switch (rule.ruleType) {
    case GLOBAL_CONSTANTS.RULE_TYPES.SCRIPT:
      eventParams.num_characters = rule.pairs[0].scripts.reduce((max, currentScript) => {
        const currentScriptLen = currentScript.value.length;
        return currentScriptLen > max ? currentScriptLen : max;
      }, rule.pairs[0].scripts[0]?.value?.length);
      break;
    case GLOBAL_CONSTANTS.RULE_TYPES.RESPONSE:
      eventParams.resource_type = rule.pairs[0].response?.resourceType;
      eventParams.num_characters = rule.pairs[0].response?.value?.length;
      eventParams.body_types = getAllResponseBodyTypes(rule);
      break;
    case GLOBAL_CONSTANTS.RULE_TYPES.REQUEST:
      eventParams.num_characters = rule.pairs[0].request?.value?.length;
      eventParams.resource_type = rule.pairs[0].request?.resourceType;
      eventParams.body_types = rule.pairs[0].request?.type;
      break;
    case GLOBAL_CONSTANTS.RULE_TYPES.HEADERS: {
      const headerTypes = new Set();
      const headerActions = new Set();
      rule.pairs.some((pair) => {
        if (pair.modifications?.Response?.length > 0) {
          headerTypes.add("Response");
        }
        if (pair.modifications?.Request?.length > 0) {
          headerTypes.add("Request");
        }
        pair.modifications?.Response?.forEach((responseHeader) => {
          headerActions.add(responseHeader.type);
        });
        pair.modifications?.Request?.forEach((requestHeader) => {
          headerActions.add(requestHeader.type);
        });
        if (headerTypes.size === 2 && headerActions.size === 3) {
          return true;
        }
        return false;
      });
      eventParams.header_types = Array.from(headerTypes);
      eventParams.header_actions = Array.from(headerActions);
      break;
    }
    default:
      return eventParams;
  }
  return eventParams;
};

// This is also the save rule button
const CreateRuleButton = ({
  isDisabled = false,
  isRuleEditorModal = false, // indicates if rendered from rule editor modal
  analyticEventRuleCreatedSource = "rule_editor_screen_header",
  ruleCreatedFromEditorModalCallback = (ruleId) => {},
  ruleEditorModalMode = APP_CONSTANTS.RULE_EDITOR_CONFIG.MODES.CREATE,
}) => {
  //Constants
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const ruleCreatedEventSource =
    searchParams.get("source") ?? location?.state?.source ?? analyticEventRuleCreatedSource;
  const MODE = isRuleEditorModal ? ruleEditorModalMode : getModeData(location).MODE;

  //Global State
  const dispatch = useDispatch();
  const currentlySelectedRuleData = useSelector(getCurrentlySelectedRuleData);
  const isCurrentlySelectedRuleHasUnsavedChanges = useSelector(getIsCurrentlySelectedRuleHasUnsavedChanges);
  const user = useSelector(getUserAuthDetails);
  const appMode = useSelector(getAppMode);
  const userAttributes = useSelector(getUserAttributes);

  const onboardingVariation = useFeatureValue("onboarding_activation_v2", "variant1");

  const premiumRuleLimitType = useMemo(() => {
    switch (currentlySelectedRuleData.ruleType) {
      case GLOBAL_CONSTANTS.RULE_TYPES.SCRIPT:
        return FeatureLimitType.script_rule;
      case GLOBAL_CONSTANTS.RULE_TYPES.RESPONSE:
        return FeatureLimitType.response_rule;
      case GLOBAL_CONSTANTS.RULE_TYPES.REQUEST:
        return FeatureLimitType.request_rule;
      default:
        return null;
    }
  }, [currentlySelectedRuleData.ruleType]);

  const currentActionText = MODE === APP_CONSTANTS.RULE_EDITOR_CONFIG.MODES.EDIT ? "Save" : "Create";

  const checkIsUpgradePopoverDisabled = useCallback(() => {
    if (isDisabled) return true;
    if (MODE === APP_CONSTANTS.RULE_EDITOR_CONFIG.MODES.EDIT) {
      // If rule limit type exists and user is not premium, then enable popover else disable
      if (premiumRuleLimitType) {
        if (user.details?.isPremium) return true;
        else return false;
      } else {
        // disable popover for non-premium rule types
        return true;
      }
    }
  }, [isDisabled, MODE, premiumRuleLimitType, user.details?.isPremium]);

  const handleBtnOnClick = async (saveType = "button_click") => {
    if (appMode !== GLOBAL_CONSTANTS.APP_MODES.DESKTOP && !isExtensionInstalled()) {
      dispatch(globalActions.toggleActiveModal({ modalName: "extensionModal", newValue: true }));
      return;
    }

    const createdBy = currentlySelectedRuleData?.createdBy || user?.details?.profile?.uid || null;
    const currentOwner = user?.details?.profile?.uid || null;
    const lastModifiedBy = user?.details?.profile?.uid || null;

    //Validation
    const ruleValidation = validateRule(currentlySelectedRuleData, dispatch, appMode);

    //Syntactic Validation
    const finalRuleData = await validateSyntaxInRule(dispatch, { ...currentlySelectedRuleData });

    if (!finalRuleData) {
      return;
    }

    if (ruleValidation.result) {
      saveRule(appMode, dispatch, {
        ...finalRuleData,
        createdBy,
        currentOwner,
        lastModifiedBy,
      })
        .then(() => setIsCurrentlySelectedRuleHasUnsavedChanges(dispatch, false))
        .then(() => {
          if (isRuleEditorModal) {
            ruleCreatedFromEditorModalCallback(finalRuleData.id);
          } else {
            toast.success(`Successfully ${currentActionText.toLowerCase()}d the rule`);
          }

          /* @sahil865gupta: Testing GA4 events and blending BQ data. Move this to separate module*/

          let rule_type = null;

          if (finalRuleData && finalRuleData.ruleType) {
            rule_type = finalRuleData.ruleType;
          }
          if (MODE === APP_CONSTANTS.RULE_EDITOR_CONFIG.MODES.CREATE || isRuleEditorModal) {
            submitAttrUtil(APP_CONSTANTS.GA_EVENTS.ATTR.NUM_RULES, (userAttributes?.num_rules ?? 0) + 1);
            trackRuleCreatedEvent({
              rule_type,
              description: finalRuleData.description,
              destination_types:
                finalRuleData.ruleType === GLOBAL_CONSTANTS.RULE_TYPES.REDIRECT
                  ? getAllRedirectDestinationTypes(finalRuleData)
                  : null,
              source: ruleCreatedEventSource,
              save_type: saveType,
              ...getEventParams(finalRuleData),
            });
          } else if (MODE === APP_CONSTANTS.RULE_EDITOR_CONFIG.MODES.EDIT) {
            trackRuleEditedEvent({
              rule_type,
              description: finalRuleData.description,
              destination_types:
                finalRuleData.ruleType === GLOBAL_CONSTANTS.RULE_TYPES.REDIRECT
                  ? getAllRedirectDestinationTypes(finalRuleData)
                  : null,
              source: ruleCreatedEventSource,
              save_type: saveType,
              ...getEventParams(finalRuleData),
            });
          }
          ruleModifiedAnalytics(user);
          trackRQLastActivity("rule_saved");
        })
        .then(() => {
          if (!isRuleEditorModal && MODE === APP_CONSTANTS.RULE_EDITOR_CONFIG.MODES.CREATE) {
            dispatch(globalActions.updateSecondarySidebarCollapse(true));
            redirectToRuleEditor(navigate, finalRuleData.id, MODE, false, true);
          }
        })
        .catch((e) => {
          Sentry.captureException(e.message);
          toast.error("Error in saving rule. Please contact support.");
        });
    } else {
      toast.warn(ruleValidation.message);
      trackErrorInRuleCreation(snakeCase(ruleValidation.error), currentlySelectedRuleData.ruleType);
    }
  };

  return onboardingVariation === "variant4" && !user?.details?.isLoggedIn ? (
    <AuthConfirmationPopover
      title={<div>You need to sign up to save the rule.</div>}
      disabled={user?.details?.isLoggedIn}
      onConfirm={handleBtnOnClick}
      source={SOURCE.CREATE_NEW_RULE}
      placement="bottomLeft"
    >
      <RBACButton
        permission="update"
        resource="http_rule"
        showHotKeyText
        hotKey={KEYBOARD_SHORTCUTS.RULES.SAVE_RULE.hotKey}
        data-tour-id="rule-editor-create-btn"
        id="rule-editor-save-btn"
        type="primary"
        className="text-bold"
        disabled={isDisabled}
        tooltipTitle="Saving is not allowed in view-only mode. You can test rules but cannot save them."
      >
        {isCurrentlySelectedRuleHasUnsavedChanges ? "*" : null}
        {`Save rule`}
      </RBACButton>
    </AuthConfirmationPopover>
  ) : (
    <>
      <PremiumFeature
        popoverPlacement="bottomLeft"
        features={[FeatureLimitType.num_rules, premiumRuleLimitType]}
        onContinue={handleBtnOnClick}
        featureName={`${APP_CONSTANTS.RULE_TYPES_CONFIG[currentlySelectedRuleData.ruleType]?.NAME} rule`}
        disabled={checkIsUpgradePopoverDisabled()}
        source={currentlySelectedRuleData.ruleType}
      >
        <RBACButton
          permission="update"
          resource="http_rule"
          showHotKeyText
          hotKey={KEYBOARD_SHORTCUTS.RULES.SAVE_RULE.hotKey}
          data-tour-id="rule-editor-create-btn"
          id="rule-editor-save-btn"
          type="primary"
          className="text-bold"
          disabled={isDisabled}
          tooltipTitle="Saving is not allowed in view-only mode. You can test rules but cannot save them."
        >
          {isCurrentlySelectedRuleHasUnsavedChanges ? "*" : null}
          {`Save rule`}
        </RBACButton>
      </PremiumFeature>
    </>
  );
};

export default CreateRuleButton;
