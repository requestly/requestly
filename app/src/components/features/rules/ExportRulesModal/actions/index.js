//ACTIONS
import { trackRulesExportedEvent } from "modules/analytics/events/common/rules";
import { trackRQLastActivity } from "utils/AnalyticsUtils";
import { getRulesAndGroupsFromRuleIds } from "../../../../../utils/rules/misc";
//DOWNLOAD.JS
const fileDownload = require("js-file-download");

export const prepareContentToExport = (appMode, selectedRuleIds, groupwiseRules) => {
  return new Promise((resolve, reject) => {
    getRulesAndGroupsFromRuleIds(appMode, selectedRuleIds, groupwiseRules).then(({ rules, groups }) => {
      const updatedGroups = groups.map((group) => ({
        ...group,
        children: [],
      }));
      resolve({
        fileContent: JSON.stringify(rules.concat(updatedGroups), null, 2),
        rulesCount: rules.length,
        groupsCount: updatedGroups.length,
      });
    });
  });
};

export const initiateDownload = (data, rulesCount) => {
  trackRQLastActivity("rules_exported");
  trackRulesExportedEvent(rulesCount);
  fileDownload(data, "requestly_rules.json", "application/json");
};
