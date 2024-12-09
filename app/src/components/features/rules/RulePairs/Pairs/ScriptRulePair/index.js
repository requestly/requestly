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
import { globalActions } from "store/slices/global/slice";
import "./styles.css";

const ScriptRulePair = ({ pair, pairIndex, ruleDetails, isInputDisabled }) => {
  const location = useLocation();
  const dispatch = useDispatch();
  const currentlySelectedRuleData = useSelector(getCurrentlySelectedRuleData);

  const isInEditMode = location.pathname.split("/rules/editor")[1]?.startsWith("/edit");

  const toShowLibraries = isInEditMode && pair?.libraries?.length; // this, and the corresponding logic can be removed

  const [hasUserClickedDeleteIconInThisSession, setHasUserClickedDeleteIconInThisSession] = useState(false);

  const addEmptyScript = useCallback(
    (event) => {
      event?.preventDefault?.();

      dispatch(
        globalActions.addValueInRulePairArray({
          pairIndex,
          arrayPath: "scripts",
          value: {
            ...ruleDetails.EMPTY_SCRIPT_FORMAT,
            id: generateObjectId(),
          },
        })
      );
    },
    [dispatch, pairIndex, ruleDetails.EMPTY_SCRIPT_FORMAT]
  );

  const deleteScript = (event, pairIndex, scriptIndex) => {
    event && event.preventDefault();

    setHasUserClickedDeleteIconInThisSession(true);

    dispatch(
      globalActions.removeValueInRulePairByIndex({
        pairIndex,
        arrayPath: "scripts",
        index: scriptIndex,
      })
    );
  };

  // Auto Populate Empty Code Script
  useEffect(() => {
    if (Array.isArray(pair.scripts) && pair.scripts.length === 0) {
      if (hasUserClickedDeleteIconInThisSession) return;
      addEmptyScript();
    }
  }, [addEmptyScript, pair.scripts, hasUserClickedDeleteIconInThisSession]);

  return (
    <React.Fragment>
      <RequestSourceRow
        rowIndex={1}
        pair={pair}
        pairIndex={pairIndex}
        ruleDetails={ruleDetails}
        isInputDisabled={isInputDisabled}
      />
      {!!toShowLibraries && (
        <AvailableScriptsRow rowIndex={3} pair={pair} pairIndex={pairIndex} isInputDisabled={isInputDisabled} />
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

      {isInputDisabled ? null : <AddCustomScriptRow addEmptyScript={addEmptyScript} />}

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
