//UTILS
import { redirectToRules } from "../../../../../../../../utils/RedirectionUtils";
//EXTERNALS
import { StorageService } from "../../../../../../../../init";
import { generateObjectCreationDate } from "utils/DateTimeUtils";
import { trackErrorInRuleCreation, trackRuleEditorClosed } from "modules/analytics/events/common/rules";
import { cloneDeep, snakeCase } from "lodash";
import Logger from "lib/logger";
import * as Sentry from "@sentry/react";
import { detectUnsettledPromise } from "utils/FunctionUtils";
import { migrateRuleToMV3 } from "modules/extension/utils";

export const saveRule = async (appMode, ruleObject, callback) => {
  let ruleToSave = cloneDeep(ruleObject);

  delete ruleToSave["schema_version"];
  ruleToSave = migrateRuleToMV3(ruleToSave).rule;
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
    .then(() => {
      // Execute callback
      callback && callback();
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

export const closeBtnOnClickHandler = (dispatch, navigate, ruleType, mode) => {
  trackRuleEditorClosed("cancel_button", ruleType, snakeCase(mode));
  redirectToRules(navigate);
};
