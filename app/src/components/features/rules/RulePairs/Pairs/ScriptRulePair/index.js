import React, { useCallback, useEffect, useState } from "react";
import AvailableScriptsRow from "../Rows/RowsMarkup/AvailableScriptsRow";
import RequestSourceRow from "../Rows/RowsMarkup/RequestSourceRow";
import AddCustomScriptRow from "../Rows/RowsMarkup/AddCustomScriptRow";
import CustomScriptRow from "../Rows/RowsMarkup/CustomScriptRow";
import { generateObjectId } from "../../../../../../utils/FormattingHelper";
import { useLocation } from "react-router-dom";
import { Checkbox, Typography } from "antd";
import { useDispatch, useSelector } from "react-redux";
import { getCurrentlySelectedRuleData } from "store/selectors";
import { onChangeHandler } from "components/features/rules/RuleBuilder/Body/actions";
import { isExtensionManifestVersion3 } from "actions/ExtensionActions";
import "./styles.css";

const ScriptRulePair = ({ pair, pairIndex, helperFunctions, ruleDetails, isInputDisabled }) => {
  const location = useLocation();
  const dispatch = useDispatch();
  const currentlySelectedRuleData = useSelector(getCurrentlySelectedRuleData);

  const isInEditMode = location.pathname.split("/rules/editor")[1]?.startsWith("/edit");

  const toShowLibraries = isInEditMode && pair?.libraries?.length;

  const [hasUserClickedDeleteIconInThisSession, setHasUserClickedDeleteIconInThisSession] = useState(false);

  const { pushValueToArrayInPair, deleteArrayValueByIndexInPair } = helperFunctions;

  const addEmptyScript = (event) => {
    event && event.preventDefault();
    pushValueToArrayInPair(event, pairIndex, "scripts", {
      ...ruleDetails.EMPTY_SCRIPT_FORMAT,
      id: generateObjectId(),
    });
  };

  const stableAddEmptyScript = useCallback(addEmptyScript, [
    pairIndex,
    pushValueToArrayInPair,
    ruleDetails.EMPTY_SCRIPT_FORMAT,
  ]);

  const deleteScript = (event, pairIndex, scriptIndex) => {
    event && event.preventDefault();

    setHasUserClickedDeleteIconInThisSession(true);

    deleteArrayValueByIndexInPair(event, pairIndex, "scripts", scriptIndex);
  };

  // Auto Populate Empty Code Script
  useEffect(() => {
    if (Array.isArray(pair.scripts) && pair.scripts.length === 0) {
      if (hasUserClickedDeleteIconInThisSession) return;
      stableAddEmptyScript();
    }
  }, [stableAddEmptyScript, pair.scripts, hasUserClickedDeleteIconInThisSession]);

  return (
    <React.Fragment>
      <RequestSourceRow
        rowIndex={1}
        pair={pair}
        pairIndex={pairIndex}
        helperFunctions={helperFunctions}
        ruleDetails={ruleDetails}
        isInputDisabled={isInputDisabled}
      />
      {!!toShowLibraries && (
        <AvailableScriptsRow
          rowIndex={3}
          pair={pair}
          pairIndex={pairIndex}
          helperFunctions={{ ...helperFunctions }}
          isInputDisabled={isInputDisabled}
        />
      )}

      {pair.scripts.map((script, scriptIndex) => (
        <CustomScriptRow
          key={script.id}
          rowIndex={2}
          pair={pair}
          pairIndex={pairIndex}
          deleteScript={deleteScript}
          ruleDetails={ruleDetails}
          script={script}
          scriptIndex={scriptIndex}
          isLastIndex={scriptIndex === pair.scripts.length - 1}
          isInputDisabled={isInputDisabled}
        />
      ))}
      <AddCustomScriptRow helperFunctions={{ ...helperFunctions, addEmptyScript }} />
      {isExtensionManifestVersion3() ? (
        <div className="csp-header-removal-notice">
          <Checkbox
            checked={currentlySelectedRuleData.removeCSPHeader ?? true}
            name="removeCSPHeader"
            onChange={(event) => onChangeHandler(currentlySelectedRuleData, dispatch, event)}
            className="csp-header-checkbox"
          >
            <Typography.Text type="secondary">
              Ensure that the above scripts always execute on the website by ignoring the CSP restriction
            </Typography.Text>
          </Checkbox>
        </div>
      ) : null}
    </React.Fragment>
  );
};

export default ScriptRulePair;
