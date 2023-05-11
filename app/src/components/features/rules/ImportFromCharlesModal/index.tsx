import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { getAppMode, getIsRefreshRulesPending } from "store/selectors";
import { RQButton, RQModal } from "lib/design-system/components";
import { FilePicker } from "components/common/FilePicker";
import { parseRulesFromCharlesXML } from "utils/charles-rule-adapters/parseRulesFromCharlesXML";
import { Row } from "antd";
import { createNewGroupAndSave } from "utils/charles-rule-adapters/utils";
import { actions } from "store";
import { ParsedRule } from "utils/charles-rule-adapters/types";

interface ModalProps {
  isOpen: boolean;
  toggle: () => void;
}

export const ImportFromCharlesModal: React.FC<ModalProps> = ({ isOpen, toggle }) => {
  const dispatch = useDispatch();
  const [validationError, setValidationError] = useState(null);
  const [isDataProcessing, setIsDataProcessing] = useState<boolean>(false);
  const [isParseComplete, setIsParseComplete] = useState<boolean>(false);
  const [rulesToImport, setRulesToImport] = useState<ParsedRule["groups"]>([]);

  const appMode = useSelector(getAppMode);
  const isRulesListRefreshPending = useSelector(getIsRefreshRulesPending);

  const onFilesDrop = async (files: File[]) => {
    const file = files[0];
    console.log({ file });
    const reader = new FileReader();

    reader.onerror = () => setValidationError("Could not process the selected file! Try again.");

    reader.onload = () => {
      const fileContent = reader.result;
      setIsDataProcessing(true);
      console.log({ fileContent });

      if (!file.type.includes("xml")) {
        // stop parsing for wrong file format
        setIsDataProcessing(false);
        setValidationError("Imported file dosen't match the required format");
        return;
      }
      parseRulesFromCharlesXML(fileContent as string, appMode)
        .then((importedRules: any) => {
          setIsDataProcessing(false);
          setRulesToImport(importedRules);
          setIsParseComplete(true);
          console.log({ importedRules });
        })
        .catch((error) => {
          setValidationError(error.message);
          setIsDataProcessing(false);
        });
    };
    reader.readAsText(file);
  };

  const handleCharlesRulesImport = () => {
    const importPromises = rulesToImport.map((group) => {
      return createNewGroupAndSave({
        appMode,
        rules: group.rules,
        status: group.status,
        groupName: group.name,
        onSuccess: () => {},
        onError: () => setValidationError("Something went wrong while importing your settings! Try again."), // TODO: validations
      });
    });
    console.log({ rulesToImport });

    Promise.all(importPromises).then(() => {
      dispatch(
        actions.updateRefreshPendingStatus({
          type: "rules",
          newValue: !isRulesListRefreshPending,
        })
      );
      toggle();
    });
  };

  const handleResetImport = () => {
    setValidationError(null);
    setIsParseComplete(false);
  };

  return (
    <RQModal open={isOpen} centered onCancel={toggle}>
      <div className="rq-modal-content">
        <div className="header text-center">Import Charles settings</div>
        <div className="mt-16">
          {isParseComplete ? (
            <div className="text-center subtitle mt-16">Charles Settings successfully parsed!</div>
          ) : validationError ? (
            <div className="text-center subtitle mt-16">{validationError}</div>
          ) : (
            <FilePicker
              title="Drop your Charles export file, or click to select"
              onFilesDrop={onFilesDrop}
              maxFiles={1}
              isProcessing={isDataProcessing}
            />
          )}
        </div>
      </div>
      {isParseComplete ? (
        <div className="rq-modal-footer">
          <Row justify="end">
            <RQButton type="primary" onClick={handleCharlesRulesImport}>
              Import
            </RQButton>
          </Row>
        </div>
      ) : null}
      {validationError ? (
        <div className="rq-modal-footer">
          <Row justify="end">
            <RQButton type="primary" onClick={handleResetImport}>
              Try another file
            </RQButton>
          </Row>
        </div>
      ) : null}
    </RQModal>
  );
};
