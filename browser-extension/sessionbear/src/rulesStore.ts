import { Group, Rule, RuleType, ObjectType, Status } from "./types";
import { ChangeType, getAllRecords, getRecord, onRecordChange } from "./storage";

const isRule = (record: unknown): boolean => {
  return record && (!!(record as Rule).ruleType || (record as Rule).objectType === ObjectType.RULE);
};

const isGroup = (record: unknown): boolean => {
  return record && (record as Group).objectType === ObjectType.GROUP;
};

export const getRules = async (): Promise<Rule[]> => {
  const records = await getAllRecords();
  return records.filter(isRule) as Rule[];
};

export const getGroups = async (): Promise<Group[]> => {
  const records = (await getAllRecords()) as Group[];
  return records.filter(isGroup) as Group[];
};

export const getRule = async (id: string): Promise<Rule> => {
  return getRecord<Rule>(id);
};

export const getEnabledRules = async (ruleType?: RuleType): Promise<Rule[]> => {
  const rules = await getRules();
  const groups = await getGroups();

  return rules.filter((rule) => {
    if (!rule.status || rule.status === Status.INACTIVE) {
      return false;
    }

    if (ruleType && rule.ruleType !== ruleType) {
      return false;
    }

    if (!rule.groupId) {
      return true;
    }

    const group = groups.find((group) => group.id === rule.groupId);

    if (group.status === Status.ACTIVE) {
      return true;
    }

    return false;
  });
};

export const onRuleOrGroupChange = (listener: () => void): void => {
  onRecordChange<Rule>(
    {
      valueFilter: isRule,
    },
    (ruleChanges) => {
      const shouldTriggerRuleChange = ruleChanges.some(({ changeType, oldValue, newValue }) => {
        if (changeType === ChangeType.CREATED && newValue.status === Status.ACTIVE) {
          return true;
        }

        if (changeType === ChangeType.DELETED && oldValue.status === Status.ACTIVE) {
          return true;
        }

        if (changeType === ChangeType.MODIFIED) {
          return true;
        }

        return false;
      });

      if (shouldTriggerRuleChange) {
        listener();
      }
    }
  );

  onRecordChange<Group>(
    {
      valueFilter: isGroup,
      changeTypes: [ChangeType.MODIFIED], // for newly created or deleted group, there will already be a groupId change in rule
    },
    (groupChanges) => {
      const shouldTriggerGroupChange = groupChanges.some(({ oldValue, newValue }) => {
        return oldValue.status !== newValue.status;
      });

      if (shouldTriggerGroupChange) {
        listener();
      }
    }
  );
};

export const checkIfNoRulesPresent = async (): Promise<boolean> => {
  const rules = await getRules();

  return rules.length === 0;
};

export const getRulesAndGroups = async (): Promise<{
  rules: Rule[];
  groups: Group[];
}> => {
  const [rules, groups] = await Promise.all([getRules(), getGroups()]);

  return { rules, groups };
};
