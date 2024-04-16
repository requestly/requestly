//Actions
import { setCurrentlySelectedRule } from "../../actions";

export const onChangeHandler = (currentlySelectedRuleData, dispatch, event, warnForUnsavedChanges = true) => {
  const input = event.target;

  setCurrentlySelectedRule(
    dispatch,
    {
      ...currentlySelectedRuleData,
      [input.name]: input.type === "checkbox" ? input.checked : input.value,
    },
    warnForUnsavedChanges
  );
};
