import APP_CONSTANTS from "config/constants";
import { StorageService } from "init";
import Logger from "lib/logger";
import { generateObjectCreationDate } from "utils/DateTimeUtils";

const UNGROUPED_GROUP_ID = APP_CONSTANTS.RULES_LIST_TABLE_CONSTANTS.UNGROUPED_GROUP_ID;

/**
 * Handle Rules whose Groups are missing!
 *
 * @param {{
 *  rules: import("@requestly/shared/types/entities/rules").Rule[],
 *  groups: import("@requestly/shared/types/entities/rules").Group[],
 *  appMode: string
 * }}
 * @returns {Promise<{
 *  success: boolean,
 *  updatedRules: import("@requestly/shared/types/entities/rules").Rule[]
 * }>}
 */
export const isGroupsSanitizationPassed = async ({ rules = [], groups = [], appMode }) => {
  return new Promise((resolve) => {
    let result = true; // This is tell the invoker to fetch rules again!
    const updatedRules = rules.map((rule) => {
      const groupId = rule.groupId;
      if (groupId !== UNGROUPED_GROUP_ID) {
        // This group id should exist in Groups array. If not, something is wrong - Ungroup that Rule!
        if (groups.some((group) => group.id === groupId)) {
          // All Good!
          return rule;
        } else {
          // Flag
          result = false;

          const ruleToSave = {
            ...rule,
            modificationDate: generateObjectCreationDate(), // Set the new modification date of rule
            groupId: UNGROUPED_GROUP_ID, // Ungroup that Rule!
          };

          // Save the rule
          Logger.log("Writing to storage in RulesIndexPage actions");
          StorageService(appMode).saveRuleOrGroup(ruleToSave);
          return ruleToSave;
        }
      } else {
        return rule;
      }
    });
    return resolve({
      success: result,
      updatedRules,
    });
  });
};
