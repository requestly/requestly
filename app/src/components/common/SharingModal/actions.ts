import { getRulesAndGroupsFromRuleIds } from "utils/rules/misc";
import { getFunctions, httpsCallable } from "firebase/functions";
import { SharedLinkVisibility, SharedListData } from "./types";
import { Rule as NewRule, Group as NewGroup, Group } from "@requestly/shared/types/entities/rules";
import { StorageService } from "init";
import { generateObjectCreationDate } from "utils/DateTimeUtils";
import { generateObjectId } from "utils/FormattingHelper";
import { StorageRecord } from "@requestly/shared/types/entities/rules";

export const createSharedList = async (
  appMode: string,
  rulesIdsToShare: string[],
  sharedListName: string,
  sharedListVisibility: SharedLinkVisibility,
  sharedListRecipients: unknown
) => {
  const { rules, groups } = await getRulesAndGroupsFromRuleIds(appMode, rulesIdsToShare);
  const currentWorkspaceId = window.currentlyActiveWorkspaceTeamId;

  const updatedGroups: NewGroup[] = groups.map((group) => ({
    ...group,
    children: [] as Group[],
  }));

  const sharedListData: SharedListData = {
    rules,
    updatedGroups,
    sharedListName,
    sharedListVisibility,
    sharedListRecipients,
    teamId: currentWorkspaceId,
  };

  const sharedList = (await generateSharedList(sharedListData)) as any;

  return {
    sharedListId: sharedList.sharedListId,
    sharedListName: sharedList.sharedListName,
    sharedListData: sharedList.sharedListData,
    nonRQEmails: sharedList.nonRQEmails,
  };
};

const generateSharedList = async (sharedListData: SharedListData) => {
  const functions = getFunctions();
  const createSharedList = httpsCallable(functions, "sharedLists-create");
  const newSharedList = await createSharedList(sharedListData);
  return newSharedList.data;
};

export const prepareContentToExport = (appMode: string, selectedRuleIds: string[]) => {
  return new Promise((resolve, reject) => {
    getRulesAndGroupsFromRuleIds(appMode, selectedRuleIds).then(({ rules, groups }) => {
      const updatedGroups: NewGroup[] = groups.map((group) => ({
        ...group,
        children: [] as Group[],
      }));
      resolve({
        fileContent: JSON.stringify((rules as StorageRecord[]).concat(updatedGroups), null, 2),
        rulesCount: rules.length,
        groupsCount: updatedGroups.length,
      });
    });
  });
};

export const duplicateRulesToTargetWorkspace = async (
  appMode: string,
  workspaceId: string,
  ruleIdsToShare: string[]
) => {
  const { rules, groups } = await getRulesAndGroupsFromRuleIds(appMode, ruleIdsToShare);

  // mapping of old group IDs to new group IDs
  const groupIdMapping: Record<string, string> = {};

  const formatRule = (rule: NewRule, newGroupId: NewGroup["id"]) => ({
    ...rule,
    creationDate: generateObjectCreationDate(),
    modificationDate: generateObjectCreationDate(),
    name: `${rule.name} Copy`,
    id: `${rule.ruleType}_${generateObjectId()}`,
    groupId: newGroupId,
  });

  const formattedGroups = groups.reduce((acc: NewGroup[], group: NewGroup) => {
    const newGroupId = `Group_${generateObjectId()}`;
    groupIdMapping[group.id] = newGroupId;
    acc.push({
      ...group,
      id: newGroupId,
      name: `${group.name} Copy`,
    });
    return acc;
  }, []);

  const formattedRules: NewRule[] = rules.map((rule: NewRule) => {
    const newGroupId = groupIdMapping[rule.groupId] || "";
    return formatRule(rule, newGroupId);
  });

  return StorageService(appMode).saveMultipleRulesOrGroups([...formattedRules, ...formattedGroups], { workspaceId });
};
