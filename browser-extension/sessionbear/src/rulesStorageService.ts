import { getGroups, getRules, onRuleOrGroupChange } from "./rulesStore";
import { Group, Rule, RuleType, Status } from "./types";

class RulesStorageService {
  private rules: Rule[] = [];
  private groups: Group[] = [];
  private isInitialized = false;
  private listeners: any = {};

  private updateCachedRules = async (): Promise<void> => {
    this.rules = await getRules();
    this.groups = await getGroups();
    this.isInitialized = true;
  };

  constructor() {
    this.updateCachedRules();
    onRuleOrGroupChange(() => {
      this.updateCachedRules().then(() => {
        if (this.listeners) {
          Object.values(this.listeners).forEach((listener: () => void) => listener?.());
        }
      });
    });
  }

  onRuleOrGroupChange = (listener: () => void) => {
    const listenerId = Date.now();
    this.listeners[listenerId] = listener;

    return () => {
      this.listeners[listenerId] && delete this.listeners[listenerId];
    };
  };

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

  getRule = async (id: string): Promise<Rule> => {
    return this.getAllRules().then((rules) => rules.find((rule) => rule.id === id));
  };

  getRules = async (ids: string[]): Promise<Rule[]> => {
    return this.getAllRules().then((rules) => rules.filter((rule) => ids.includes(rule.id)));
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
