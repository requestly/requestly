//EXTERNALS
import { StorageService } from "../../../../../../../../init";
import { generateObjectCreationDate } from "utils/DateTimeUtils";
import { trackErrorInRuleCreation } from "modules/analytics/events/common/rules";
import { cloneDeep } from "lodash";
import Logger from "lib/logger";
import * as Sentry from "@sentry/react";
import { detectUnsettledPromise } from "utils/FunctionUtils";
import { migrateRuleToMV3 } from "modules/extension/utils";
import { runMinorFixesOnRule } from "utils/rules/misc";
import { transformAndValidateRuleFields } from "../CreateRuleButton/actions";
import { HTML_ERRORS } from "../CreateRuleButton/actions/insertScriptValidators";
import { actions } from "store";
import { ToastType } from "componentsV2/CodeEditor/components/EditorToast/types";
import { toast } from "utils/Toast";

export const saveRule = async (appMode, dispatch, ruleObject) => {
  let ruleToSave = cloneDeep(ruleObject);
  delete ruleToSave["schemaVersion"];

  //Pre-validation: regex fix + trim whitespaces
  const fixedRuleData = runMinorFixesOnRule(dispatch, ruleToSave);

  ruleToSave = migrateRuleToMV3(fixedRuleData).rule;
  // TODO: Remove above and uncomment below after all users migrated to MV3. This is just to maintain backward compatibility for path URL filter
  // ruleToSave.extensionRules = parseDNRRules(ruleToSave);

  //Set the modification date of rule
  ruleToSave.modificationDate = generateObjectCreationDate();

  //Save the rule
  Logger.log("Writing to storage in saveRule");
  const ruleSavePromises = [
    detectUnsettledPromise(StorageService(appMode).saveRuleOrGroup(ruleToSave), 10000),
    detectUnsettledPromise(StorageService(appMode).getRecord(ruleToSave.groupId), 10000),
  ];

  return Promise.all(ruleSavePromises)
    .then(([_, result_1]) => {
      //Set the modification date of group
      if (result_1 && result_1.objectType === "group") {
        const groupToSave = {
          ...result_1,
          modificationDate: generateObjectCreationDate(),
        };
        //Save the group
        Logger.log("Writing to storage in saveRule");
        return StorageService(appMode)
          .saveRuleOrGroup(groupToSave)
          .catch(() => {
            throw new Error("Error in saving rule");
          });
      }
    })
    .catch((error) => {
      Logger.log("Error in saving rule:", error);
      trackErrorInRuleCreation("save_rule_error", ruleToSave.ruleType);
      Sentry.captureException(error, {
        tags: {
          error_source: "save_rule",
        },
      });
      throw new Error("Error in saving rule");
    });
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
          actions.triggerToastForEditor({
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
