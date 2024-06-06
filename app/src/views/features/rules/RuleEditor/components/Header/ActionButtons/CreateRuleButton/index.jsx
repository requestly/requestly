import React, { useCallback, useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Button, Tooltip } from "antd";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "utils/Toast.js";
//UTILS
import {
  getAppMode,
  getCurrentlySelectedRuleData,
  getIsCurrentlySelectedRuleHasUnsavedChanges,
  getUserAttributes,
  getUserAuthDetails,
} from "../../../../../../../../store/selectors";
import { trackRQLastActivity } from "../../../../../../../../utils/AnalyticsUtils";
//Actions
import { saveRule } from "../actions";
import {
  getModeData,
  setIsCurrentlySelectedRuleHasUnsavedChanges,
} from "../../../../../../../../components/features/rules/RuleBuilder/actions";
import { transformAndValidateRuleFields, validateRule } from "./actions";

import { CONSTANTS as GLOBAL_CONSTANTS } from "@requestly/requestly-core";
import APP_CONSTANTS from "../../../../../../../../config/constants";
import { redirectToRuleEditor } from "utils/RedirectionUtils";
import { getAllRedirectDestinationTypes, getAllResponseBodyTypes } from "utils/rules/misc";
import { ruleModifiedAnalytics } from "./actions";
import {
  trackErrorInRuleCreation,
  trackRuleCreatedEvent,
  trackRuleEditedEvent,
  trackRuleResourceTypeSelected,
  trackRuleSaveClicked,
} from "modules/analytics/events/common/rules";
import { snakeCase } from "lodash";
import { ResponseRuleResourceType } from "types/rules";
import { runMinorFixesOnRule } from "utils/rules/misc";
import { PremiumFeature } from "features/pricing";
import { FeatureLimitType } from "hooks/featureLimiter/types";
import { isExtensionInstalled } from "actions/ExtensionActions";
import { actions } from "store";
import { HTML_ERRORS } from "./actions/insertScriptValidators";
import { toastType } from "components/misc/CodeEditor/EditorToast/types";
import { IncentivizeEvent } from "features/incentivization/types";
import { getFunctions, httpsCallable } from "firebase/functions";
import { RuleType } from "features/rules";
import { incentivizationActions } from "store/features/incentivization/slice";
import "../RuleEditorActionButtons.css";

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
      eventParams.num_characters = rule.pairs[0].response?.value?.length;
      break;
    case GLOBAL_CONSTANTS.RULE_TYPES.REQUEST:
      eventParams.num_characters = rule.pairs[0].request?.value?.length;
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
  location,
  isDisabled = false,
  isRuleEditorModal = false, // indicates if rendered from rule editor modal
  analyticEventRuleCreatedSource = "rule_editor_screen_header",
  ruleCreatedFromEditorModalCallback = (ruleId) => {},
  ruleEditorModalMode = APP_CONSTANTS.RULE_EDITOR_CONFIG.MODES.CREATE,
}) => {
  //Constants
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

  const tooltipText = isDisabled
    ? "Only available in desktop app."
    : navigator.platform.match("Mac")
    ? "⌘+S"
    : "Ctrl+S";

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

  const claimRuleCreationRewards = () => {
    const claimIncentiveRewards = httpsCallable(getFunctions(), "incentivization-claimIncentiveRewards");

    if (userAttributes?.num_rules === 0 || !user?.loggedIn) {
      claimIncentiveRewards({
        event: IncentivizeEvent.FIRST_RULE_CREATED,
        options: { ruleType: currentlySelectedRuleData.ruleType },
      }).then((response) => {
        if (response.data?.success) {
          dispatch(incentivizationActions.setUserMilestoneDetails({ userMilestoneDetails: response.data?.data }));

          dispatch(
            actions.toggleActiveModal({
              modalName: "incentiveTaskCompletedModal",
              newValue: true,
              newProps: {
                event: IncentivizeEvent.FIRST_RULE_CREATED,
              },
            })
          );
        }
      });
    } else {
      const premiumRules = [RuleType.REQUEST, RuleType.RESPONSE, RuleType.SCRIPT];
      if (premiumRules.includes(currentlySelectedRuleData.ruleType)) {
        claimIncentiveRewards({
          event: IncentivizeEvent.PREMIUM_RULE_CREATED,
          options: { ruleType: currentlySelectedRuleData.ruleType },
        }).then((response) => {
          if (response.data?.success) {
            dispatch(incentivizationActions.setUserMilestoneDetails({ userMilestoneDetails: response.data?.data }));

            dispatch(
              actions.toggleActiveModal({
                modalName: "incentiveTaskCompletedModal",
                newValue: true,
                newProps: {
                  event: IncentivizeEvent.PREMIUM_RULE_CREATED,
                },
              })
            );
          }
        });
      }
    }
  };

  const handleBtnOnClick = async (saveType = "button_click") => {
    trackRuleSaveClicked(MODE);
    if (appMode !== GLOBAL_CONSTANTS.APP_MODES.DESKTOP && !isExtensionInstalled()) {
      dispatch(actions.toggleActiveModal({ modalName: "extensionModal", newValue: true }));
      return;
    }

    const createdBy = currentlySelectedRuleData?.createdBy || user?.details?.profile?.uid || null;
    const currentOwner = user?.details?.profile?.uid || null;
    const lastModifiedBy = user?.details?.profile?.uid || null;

    //Pre-validation: regex fix + trim whitespaces
    const fixedRuleData = runMinorFixesOnRule(dispatch, currentlySelectedRuleData);
    //Syntactic Validation
    const syntaxValidation = await transformAndValidateRuleFields(fixedRuleData);

    if (!syntaxValidation.success) {
      const validationError = syntaxValidation.validationError;
      switch (validationError.error) {
        case HTML_ERRORS.COULD_NOT_PARSE:
        case HTML_ERRORS.UNCLOSED_TAGS:
        case HTML_ERRORS.UNCLOSED_ATTRIBUTES:
        case HTML_ERRORS.UNSUPPORTED_TAGS:
        case HTML_ERRORS.MULTIPLE_TAGS:
        case HTML_ERRORS.NO_TAGS:
          dispatch(
            actions.triggerToastForEditor({
              id: validationError.id,
              message: validationError.message,
              type: toastType.ERROR,
              autoClose: 4500,
            })
          );
          break;
        default:
          toast.error(validationError.message || "Could Not Parse rule");
          break;
      }
    } else {
      const parsedRuleData = syntaxValidation.ruleData || fixedRuleData;
      //Validation
      const ruleValidation = validateRule(parsedRuleData, dispatch, appMode);
      if (ruleValidation.result) {
        saveRule(
          appMode,
          {
            ...parsedRuleData,
            createdBy,
            currentOwner,
            lastModifiedBy,
          },
          // updating `isCurrentlySelectedRuleHasUnsavedChanges` in the callback of saveRule
          // because the navigation blocker prompt is dependent on this value so we need to
          // update it before navigating away from the page
          () => setIsCurrentlySelectedRuleHasUnsavedChanges(dispatch, false)
        )
          .then(async () => {
            if (MODE === APP_CONSTANTS.RULE_EDITOR_CONFIG.MODES.CREATE) {
              if (user?.loggedIn) {
                claimRuleCreationRewards();
              } else {
                dispatch(
                  actions.toggleActiveModal({
                    modalName: "authModal",
                    newValue: true,
                    newProps: {
                      authMode: APP_CONSTANTS.AUTH.ACTION_LABELS.LOG_IN,
                      warningMessage: "You must sign in to earn credits.",
                      callback: () => claimRuleCreationRewards(),
                    },
                  })
                );
              }
            }

            if (isRuleEditorModal) {
              ruleCreatedFromEditorModalCallback(currentlySelectedRuleData.id);
            } else {
              toast.success(`Successfully ${currentActionText.toLowerCase()}d the rule`);
            }

            /* @sahil865gupta: Testing GA4 events and blending BQ data. Move this to separate module*/

            let rule_type = null;

            if (currentlySelectedRuleData && currentlySelectedRuleData.ruleType) {
              rule_type = currentlySelectedRuleData.ruleType;
            }
            if (MODE === APP_CONSTANTS.RULE_EDITOR_CONFIG.MODES.CREATE || isRuleEditorModal) {
              trackRuleCreatedEvent({
                rule_type,
                description: currentlySelectedRuleData.description,
                destination_types:
                  currentlySelectedRuleData.ruleType === GLOBAL_CONSTANTS.RULE_TYPES.REDIRECT
                    ? getAllRedirectDestinationTypes(currentlySelectedRuleData)
                    : null,
                source: ruleCreatedEventSource,
                body_types:
                  currentlySelectedRuleData.ruleType === GLOBAL_CONSTANTS.RULE_TYPES.RESPONSE
                    ? getAllResponseBodyTypes(currentlySelectedRuleData)
                    : null,
                ...getEventParams(currentlySelectedRuleData),
                save_type: saveType,
              });
            } else if (MODE === APP_CONSTANTS.RULE_EDITOR_CONFIG.MODES.EDIT) {
              trackRuleEditedEvent({
                rule_type,
                description: currentlySelectedRuleData.description,
                destination_types:
                  currentlySelectedRuleData.ruleType === GLOBAL_CONSTANTS.RULE_TYPES.REDIRECT
                    ? getAllRedirectDestinationTypes(currentlySelectedRuleData)
                    : null,
                source: ruleCreatedEventSource,
                ...getEventParams(currentlySelectedRuleData),
                save_type: saveType,
              });
            }
            ruleModifiedAnalytics(user);
            trackRQLastActivity("rule_saved");

            if (currentlySelectedRuleData?.ruleType === GLOBAL_CONSTANTS.RULE_TYPES.RESPONSE) {
              const resourceType = currentlySelectedRuleData?.pairs?.[0]?.response?.resourceType;

              if (resourceType && resourceType !== ResponseRuleResourceType.UNKNOWN) {
                trackRuleResourceTypeSelected(GLOBAL_CONSTANTS.RULE_TYPES.RESPONSE, snakeCase(resourceType));
              }
            }
          })
          .then(() => {
            if (!isRuleEditorModal) {
              redirectToRuleEditor(navigate, currentlySelectedRuleData.id, MODE);
            }
          })
          .catch(() => {
            toast.error("Error in saving rule. Please contact support.");
          });
      } else {
        toast.warn(ruleValidation.message);
        trackErrorInRuleCreation(snakeCase(ruleValidation.error), currentlySelectedRuleData.ruleType);
      }
    }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const saveFn = (event) => {
    if ((navigator.platform.match("Mac") ? event.metaKey : event.ctrlKey) && event.key.toLowerCase() === "s") {
      event.preventDefault();
      // simulating click on save button when user presses cmd+s or ctrl+s to invoke upgrade popover
      document.getElementById("rule-editor-save-btn").click();
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
      <PremiumFeature
        popoverPlacement="bottomLeft"
        features={[FeatureLimitType.num_rules, premiumRuleLimitType]}
        onContinue={handleBtnOnClick}
        featureName={`${APP_CONSTANTS.RULE_TYPES_CONFIG[currentlySelectedRuleData.ruleType]?.NAME} rule`}
        disabled={checkIsUpgradePopoverDisabled()}
        source={currentlySelectedRuleData.ruleType}
      >
        <Tooltip title={tooltipText} placement="top">
          <Button
            data-tour-id="rule-editor-create-btn"
            id="rule-editor-save-btn"
            type="primary"
            className="text-bold"
            disabled={isDisabled}
          >
            {isCurrentlySelectedRuleHasUnsavedChanges ? "*" : null}
            {`Save rule`}
          </Button>
        </Tooltip>
      </PremiumFeature>
    </>
  );
};

export default CreateRuleButton;
