//UTILS
import { redirectToRules } from "../../../../../../../utils/RedirectionUtils";
//EXTERNALS
import { StorageService } from "../../../../../../../init";
import { generateObjectCreationDate } from "utils/DateTimeUtils";
import { parseExtensionRules } from "modules/extension/ruleParser";
import { isExtensionManifestVersion3 } from "actions/ExtensionActions";
import { trackRuleEditorClosed } from "modules/analytics/events/common/rules";
import { snakeCase } from "lodash";
import Logger from "lib/logger";
import { toast } from "utils/Toast";

export const saveRule = async (appMode, ruleObject, callback) => {
  //Set the modification date of rule
  const ruleToSave = {
    ...ruleObject,
    modificationDate: generateObjectCreationDate(),
  };

  if (isExtensionManifestVersion3()) {
    ruleToSave.extensionRules = parseExtensionRules(ruleObject);
  }

  //Save the rule
  Logger.log("Writing to storage in saveRule");
  await StorageService(appMode).saveRuleOrGroup(ruleToSave);
  //Fetch the group related to that rule
  Logger.log("Reading storage in saveRule");
  return StorageService(appMode)
    .getRecord(ruleToSave.groupId)
    .then((result_1) => {
      //Set the modification date of group
      if (result_1 && result_1.objectType === "group") {
        const groupToSave = {
          ...result_1,
          modificationDate: generateObjectCreationDate(),
        };
        //Save the group
        Logger.log("Writing to storage in saveRule");
        StorageService(appMode)
          .saveRuleOrGroup(groupToSave)
          .catch(() => {
            throw new Error("Error in saving rule");
          });
      }
    })
    .then(() => {
      const exit = () => {};
      // Execute callback
      callback && callback();
      //Continue exit
      exit();
    })
    .catch(() => {
      toast.error("Error in saving rule. Please contact support.");
    });
};

export const closeBtnOnClickHandler = (dispatch, navigate, ruleType, mode) => {
  trackRuleEditorClosed("cancel_button", ruleType, snakeCase(mode));
  redirectToRules(navigate);
};
