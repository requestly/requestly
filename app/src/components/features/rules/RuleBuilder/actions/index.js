import { generateObjectId } from "../../../../../utils/FormattingHelper";
//UTILS
import { redirectToRoot } from "../../../../../utils/RedirectionUtils";
//REDUCER ACTIONS
import { actions } from "../../../../../store";
//CONSTANTS
import APP_CONSTANTS from "../../../../../config/constants";
import { CONSTANTS as GLOBAL_CONSTANTS } from "@requestly/requestly-core";
import { generateObjectCreationDate } from "utils/DateTimeUtils";
import { getRuleLevelInitialConfigs } from "./utils";
import { isExtensionManifestVersion3 } from "actions/ExtensionActions";

const { RULE_EDITOR_CONFIG, RULE_TYPES_CONFIG } = APP_CONSTANTS;

export const setIsCurrentlySelectedRuleHasUnsavedChanges = (dispatch, hasUnsavedChanges) => {
  dispatch(actions.updateCurrentlySelectedRuleHasUnsavedChanges(hasUnsavedChanges));
};

export const setCurrentlySelectedRule = (dispatch, newRule, warnForUnsavedChanges = false) => {
  if (warnForUnsavedChanges) {
    setIsCurrentlySelectedRuleHasUnsavedChanges(dispatch, true);
  }

  dispatch(actions.updateCurrentlySelectedRuleData(newRule));
};

export const getEmptyPair = (currentlySelectedRuleConfig) => {
  return {
    ...currentlySelectedRuleConfig.EMPTY_PAIR_FORMAT,
    id: generateObjectId(),
  };
};

const getEmptyPairUsingRuleType = (ruleType) => {
  return {
    ...RULE_TYPES_CONFIG[ruleType].EMPTY_PAIR_FORMAT,
    id: generateObjectId(),
  };
};

export const initiateBlankCurrentlySelectedRule = (
  dispatch,
  currentlySelectedRuleConfig,
  RULE_TYPE_TO_CREATE,
  setCurrentlySelectedRule
) => {
  if (currentlySelectedRuleConfig) {
    const extraRuleConfig = getRuleLevelInitialConfigs(RULE_TYPE_TO_CREATE);
    let blankRuleFormat = {
      creationDate: generateObjectCreationDate(),
      description: "",
      groupId: "",
      id: `${RULE_TYPE_TO_CREATE}_${generateObjectId()}`,
      isSample: false,
      name: "",
      objectType: GLOBAL_CONSTANTS.OBJECT_TYPES.RULE,
      pairs: [],
      ruleType: RULE_TYPE_TO_CREATE,
      status: GLOBAL_CONSTANTS.RULE_STATUS.INACTIVE,
      ...extraRuleConfig,
    };

    if (currentlySelectedRuleConfig.VERSION) {
      blankRuleFormat.version = currentlySelectedRuleConfig.VERSION;
    }

    if (isExtensionManifestVersion3() && "REMOVE_CSP_HEADER" in currentlySelectedRuleConfig) {
      blankRuleFormat.removeCSPHeader = currentlySelectedRuleConfig.REMOVE_CSP_HEADER;
    }

    blankRuleFormat.pairs.push(getEmptyPairUsingRuleType(RULE_TYPE_TO_CREATE));
    setCurrentlySelectedRule(dispatch, blankRuleFormat);

    return blankRuleFormat;
  }
};

export const getNewRule = (ruleType, isExportedFromCharles = false) => {
  const ruleConfig = RULE_TYPES_CONFIG[ruleType];

  if (!ruleConfig) return;

  const extraRuleConfig = getRuleLevelInitialConfigs(ruleType);
  const newRule = {
    creationDate: generateObjectCreationDate(),
    description: "",
    groupId: "",
    id: `${ruleType}_${generateObjectId()}`,
    isSample: false,
    name: "",
    objectType: GLOBAL_CONSTANTS.OBJECT_TYPES.RULE,
    pairs: [],
    ruleType: ruleType,
    status: GLOBAL_CONSTANTS.RULE_STATUS.INACTIVE,
    ...extraRuleConfig,
  };

  if (ruleConfig.VERSION) {
    newRule.version = ruleConfig.VERSION;
  }

  if (isExportedFromCharles) {
    newRule._isCharlesExport = true;
  }

  if (isExtensionManifestVersion3() && "REMOVE_CSP_HEADER" in ruleConfig) {
    newRule.removeCSPHeader = ruleConfig.REMOVE_CSP_HEADER;
  }

  newRule.pairs.push(getEmptyPairUsingRuleType(ruleType));
  return newRule;
};

export const setCurrentlySelectedRuleConfig = (dispatch, config, navigate) => {
  if (config === undefined) {
    redirectToRoot(navigate);
  } else {
    dispatch(actions.updateCurrentlySelectedRuleConfig(config));
  }
};

export const cleanup = (dispatch) => {
  dispatch(actions.clearCurrentlySelectedRuleAndConfig());
};

export const getModeData = (location, isSharedListViewRule) => {
  if (isSharedListViewRule) {
    return {
      MODE: RULE_EDITOR_CONFIG.MODES.SHARED_LIST_RULE_VIEW,
    };
  }
  if (!location) {
    return {};
  }
  const URL_PARTS = location.pathname.split("/");
  return {
    MODE: URL_PARTS[URL_PARTS.length - 2],
    RULE_TYPE_TO_CREATE: URL_PARTS[URL_PARTS.length - 1], //Eg: RULE_TYPE_TO_CREATE="Cancel" (while creating new rule), RULE_TYPE_TO_CREATE="Cancel_SOME-ID" (while editing a rule, we dont need it)
    RULE_TO_EDIT_ID: URL_PARTS[URL_PARTS.length - 1],
  };
};

export const getSelectedRules = (rulesSelection) => {
  return Object.keys(rulesSelection).filter((ruleId) => rulesSelection[ruleId]);
};
