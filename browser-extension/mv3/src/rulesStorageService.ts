import { getGroups, getRules, onRuleOrGroupChange } from "common/rulesStore";
import { Group, Rule, RuleType, Status } from "common/types";

class RulesStorageService {
  private rules: Rule[] = [];
  private groups: Group[] = [];
  private isInitialized = false;

  private updateCachedRules = async (): Promise<void> => {
    this.rules = await getRules();
    this.groups = await getGroups();
    this.isInitialized = true;
  };

  constructor() {
    this.updateCachedRules();
    onRuleOrGroupChange(this.updateCachedRules.bind(this));
  }

  getAllRules = async (): Promise<Rule[]> => {
    if (!this.isInitialized) {
      return getRules();
    }
    return this.rules;
  };

  getAllGroups = async (): Promise<Group[]> => {
    if (!this.isInitialized) {
      return getGroups();
    }
    return this.groups;
  };

  getEnabledRules = async (ruleType?: RuleType): Promise<Rule[]> => {
    const rules = await this.getAllRules();
    const groups = await this.getAllGroups();

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
}

const rulesStorageService = new RulesStorageService();
export default rulesStorageService;
