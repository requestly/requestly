import { RecordStatus, RecordType } from "./base";
import { Group } from "./group";
import { Rule, RuleType } from "./rule";

type StorageRecord = Group | Rule;

export { StorageRecord, Rule, Group, RecordType, RuleType, RecordStatus };
