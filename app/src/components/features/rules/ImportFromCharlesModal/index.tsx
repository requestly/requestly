import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Row, Typography } from "antd";
import { actions } from "store";
import { getAppMode, getIsRefreshRulesPending } from "store/selectors";
import { RQButton, RQModal } from "lib/design-system/components";
import { FilePicker } from "components/common/FilePicker";
import { parseRulesFromCharlesXML } from "modules/charles-rule-adapters/parseRulesFromCharlesXML";
import { createNewGroupAndSave } from "modules/charles-rule-adapters/utils";
import { CharlesRuleImportErrorMessage, ParsedRulesFromChalres } from "modules/charles-rule-adapters/types";
import "./ImportFromCharlesModal.css";

interface ModalProps {
  isOpen: boolean;
  toggle: () => void;
}

const validExportSteps = [
  `Click on "Tools" in the top Menu bar in Charles Proxy`,
  `Click on "Import/Export Settings" from the dropdown`,
  `Click on "Export" tab`,
  `Select settings that you need to export and click "Export"`,
  `Import these settings to Requestly`,
];

export const ImportFromCharlesModal: React.FC<ModalProps> = ({ isOpen, toggle }) => {
  const dispatch = useDispatch();
  const [isDataProcessing, setIsDataProcessing] = useState<boolean>(false);
  const [isParseComplete, setIsParseComplete] = useState<boolean>(false);
  const [rulesToImport, setRulesToImport] = useState<ParsedRulesFromChalres>({});
  const [validationError, setValidationError] = useState<CharlesRuleImportErrorMessage | string | null>(null);

  const appMode = useSelector(getAppMode);
  const isRulesListRefreshPending = useSelector(getIsRefreshRulesPending);

  const onFilesDrop = async (files: File[]) => {
    const file = files[0];
    const reader = new FileReader();

    reader.onerror = () => setValidationError("Could not process the selected file! Try again.");
    reader.onload = () => {
      const fileContent = reader.result;
      setIsDataProcessing(true);

      if (!file.type.includes("xml")) {
        // stop parsing for wrong file format
        setIsDataProcessing(false);
        setValidationError("Imported file dosen't match the required format");
        return;
      }
      parseRulesFromCharlesXML(fileContent as string)
        .then((importedRules: any) => {
          setIsDataProcessing(false);
          setRulesToImport(importedRules);
          setIsParseComplete(true);
        })
        .catch((error) => {
          setValidationError(error.message);
          setIsDataProcessing(false);
        });
    };
    reader.readAsText(file);
  };

  const handleCharlesRulesImport = () => {
    const rulesImportPromises = rulesToImport?.groups?.map((group) => {
      return createNewGroupAndSave({
        appMode,
        rules: group.rules,
        status: group.status,
        groupName: group.name,
        onSuccess: () => {},
        onError: () => setValidationError("Something went wrong while importing your settings! Try again."), // TODO: validations
      });
    });

    Promise.all(rulesImportPromises).then(() => {
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
            <div className="parsed-rules-info">
              <div className="title mt-16">
                Successfully parsed {rulesToImport.parsedRuleTypes?.length ?? 0} Charles settings:
              </div>
              <ul>
                {rulesToImport.parsedRuleTypes?.length > 0 &&
                  rulesToImport.parsedRuleTypes.map((ruleType) => <li key={ruleType}>{ruleType}</li>)}
              </ul>
              {rulesToImport.isOtherRuleTypesPresent && (
                <>
                  <Typography.Text type="secondary">
                    Other settings cannot be imported due to technical constraints. <br />
                    {/* eslint-disable-next-line */}
                    Learn more <a href="#">about it</a>.
                  </Typography.Text>
                </>
              )}
            </div>
          ) : validationError ? (
            <>
              {validationError === CharlesRuleImportErrorMessage.INVALID_EXPORT ? (
                <div className="parsed-rules-error-info">
                  <div className="subtitle mt-16">
                    This setting format is not supported. Follow these steps to export settings from Charles:
                  </div>
                  <ol>
                    {validExportSteps.map((step) => (
                      <li>{step}</li>
                    ))}
                  </ol>
                </div>
              ) : (
                <div className="text-center title mt-16">
                  <Typography.Text type="danger">{validationError}</Typography.Text>
                </div>
              )}
            </>
          ) : (
            <FilePicker
              maxFiles={1}
              onFilesDrop={onFilesDrop}
              isProcessing={isDataProcessing}
              title="Drop your Charles export file, or click to select"
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
