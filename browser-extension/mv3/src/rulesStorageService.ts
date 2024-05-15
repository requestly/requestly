import { getGroups, getRules, onRuleOrGroupChange } from "common/rulesStore";
import { Group, Rule, RuleType, Status } from "common/types";

class RulesStorageService {
  private rules: Rule[] = [];
  private groups: Group[] = [];

  private updateCachedRules = async (): Promise<void> => {
    this.rules = await getRules();
    this.groups = await getGroups();
  };

  constructor() {
    this.updateCachedRules();
    onRuleOrGroupChange(this.updateCachedRules.bind(this));
  }

  getAllRules = (): Rule[] => {
    return this.rules;
  };

  getAllGroups = (): Group[] => {
    return this.groups;
  };

  getEnabledRules = (ruleType?: RuleType): Rule[] => {
    return this.rules.filter((rule) => {
      if (!rule.status || rule.status === Status.INACTIVE) {
        return false;
      }

      if (ruleType && rule.ruleType !== ruleType) {
        return false;
      }

      if (!rule.groupId) {
        return true;
      }

      const group = this.groups.find((group) => group.id === rule.groupId);

      if (group.status === Status.ACTIVE) {
        return true;
      }

      return false;
    });
  };
}

const rulesStorageService = new RulesStorageService();
export default rulesStorageService;
