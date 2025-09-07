import { generateObjectCreationDate } from "utils/DateTimeUtils";
import { cloneDeep } from "lodash";
import Logger from "lib/logger";
import { migrateRuleToMV3 } from "modules/extension/utils";
import { runMinorFixesOnRule } from "utils/rules/misc";
import { transformAndValidateRuleFields } from "../CreateRuleButton/actions";
import { HTML_ERRORS } from "../CreateRuleButton/actions/insertScriptValidators";
import { globalActions } from "store/slices/global/slice";
import { ToastType } from "componentsV2/CodeEditor/components/EditorToast/types";
import { toast } from "utils/Toast";
import { minifyCode } from "utils/CodeEditorUtils";
import { CONSTANTS as GLOBAL_CONSTANTS } from "@requestly/requestly-core";
import syncingHelper from "lib/syncing/helpers/syncingHelper";

export const saveRule = async (appMode, dispatch, ruleObject) => {
  let ruleToSave = cloneDeep(ruleObject);
  delete ruleToSave["schemaVersion"];

  if (ruleToSave.ruleType === GLOBAL_CONSTANTS.RULE_TYPES.REQUEST) {
    if (ruleToSave.pairs[0].request.type === GLOBAL_CONSTANTS.REQUEST_BODY_TYPES.STATIC) {
      const minifiedValue = minifyCode(ruleToSave.pairs[0].request.value);
      ruleToSave.pairs[0].request.value = minifiedValue;
    }
  }

  if (ruleToSave.ruleType === GLOBAL_CONSTANTS.RULE_TYPES.RESPONSE) {
    if (ruleToSave.pairs[0].response.type === GLOBAL_CONSTANTS.RESPONSE_BODY_TYPES.STATIC) {
      const minifiedValue = minifyCode(ruleToSave.pairs[0].response.value);
      ruleToSave.pairs[0].response.value = minifiedValue;
    }
  }

  //Pre-validation: regex fix + trim whitespaces
  const fixedRuleData = runMinorFixesOnRule(dispatch, ruleToSave);

  ruleToSave = migrateRuleToMV3(fixedRuleData).rule;
  // TODO: Remove above and uncomment below after all users migrated to MV3. This is just to maintain backward compatibility for path URL filter
  // ruleToSave.extensionRules = parseDNRRules(ruleToSave);

  //Set the modification date of rule
  ruleToSave.modificationDate = generateObjectCreationDate();

  //Save the rule
  Logger.log("Writing to storage in saveRule");
  await syncingHelper.saveRuleOrGroup(ruleToSave);
};

export const validateSyntaxInRule = async (dispatch, ruleToSave) => {
  const syntaxValidatedObject = await transformAndValidateRuleFields(ruleToSave);

  if (!syntaxValidatedObject.success) {
    const validationError = syntaxValidatedObject.validationError;
    switch (validationError.error) {
      case HTML_ERRORS.COULD_NOT_PARSE:
      case HTML_ERRORS.UNCLOSED_TAGS:
      case HTML_ERRORS.UNCLOSED_ATTRIBUTES:
      case HTML_ERRORS.UNSUPPORTED_TAGS:
      case HTML_ERRORS.MULTIPLE_TAGS:
      case HTML_ERRORS.NO_TAGS:
        dispatch(
          globalActions.triggerToastForEditor({
            id: validationError.id,
            message: validationError.message,
            type: ToastType.ERROR,
            autoClose: 4500,
          })
        );
        break;
      default:
        toast.error(validationError.message || "Could Not Parse rule");
        break;
    }
    return null;
  }

  return syntaxValidatedObject.ruleData;
};
