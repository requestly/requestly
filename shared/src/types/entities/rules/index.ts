import { RecordStatus, RecordType } from "./base";
import { Group } from "./group";
import {
  RedirectRule,
  ScriptRule,
  ResponseRule,
  Rule,
  RuleType,
  RuleSourceOperator,
  RuleSourceKey,
  RuleSourceFilter,
  RulePairSource,
  HeaderRule,
  QueryParamRule,
} from "./rule";

type StorageRecord = Group | Rule;

export {
  StorageRecord,
  Rule,
  Group,
  RecordType,
  RuleType,
  RecordStatus,
  RedirectRule,
  ScriptRule,
  HeaderRule,
  ResponseRule,
  RulePairSource,
  RuleSourceFilter,
  RuleSourceKey,
  RuleSourceOperator,
  QueryParamRule,
};
