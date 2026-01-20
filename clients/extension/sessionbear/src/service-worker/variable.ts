import { ChangeType, getRecord, onRecordChange, saveRecord } from "../storage";

export enum Variable {
  IS_EXTENSION_ENABLED = "isExtensionEnabled",
  EXTENSION_RULES_COUNT = "extensionRulesCount",
  TEST_SCRIPT = "testScript",
}

const getStorageKey = (variableName: Variable): string => `rq_var_${variableName}`;

export const setVariable = async <T = unknown>(name: Variable, value: T): Promise<void> => {
  await saveRecord<T>(getStorageKey(name), value);
};

export const getVariable = async <T = unknown>(name: Variable, defaultValue?: T): Promise<T> => {
  return ((await getRecord<T>(getStorageKey(name))) as T) ?? defaultValue;
};

export const onVariableChange = <T = unknown>(name: Variable, callback: (newValue: T, oldValue: T) => void) => {
  onRecordChange<T>(
    {
      keyFilter: getStorageKey(name),
      changeTypes: [ChangeType.MODIFIED],
    },
    (changes) => {
      callback(changes[changes.length - 1].newValue, changes[0].oldValue);
    }
  );
};
