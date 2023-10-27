import { RuleTableDataType } from "../types";

const useRuleTableActions = () => {
  const handlePin = (rules: RuleTableDataType[]) => {
    console.log("Pinning Rules", { rules });
  };

  const handleStatusToggle = (rules: RuleTableDataType[], checked: boolean) => {
    console.log("handleStatusToggle", { rules, checked });
    // TODO: Add logic to propogate the changes to storageservice;

    // FIXME: 1. Update RuleCache in React statevariable which is used to render table
    // 2. Update in StorageService. If success all good, else revert rulecache changes
  };

  return { handlePin, handleStatusToggle };
};

export default useRuleTableActions;
