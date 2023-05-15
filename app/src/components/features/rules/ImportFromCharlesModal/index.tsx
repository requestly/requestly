import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Row, Typography } from "antd";
import { actions } from "store";
import { getAppMode, getIsRefreshRulesPending } from "store/selectors";
import { CheckCircleOutlined } from "@ant-design/icons";
import { RQButton, RQModal } from "lib/design-system/components";
import { FilePicker } from "components/common/FilePicker";
import { parseRulesFromCharlesXML } from "modules/charles-rule-adapters/parseRulesFromCharlesXML";
import { createNewGroupAndSave } from "modules/charles-rule-adapters/utils";
import { CharlesRuleImportErrorMessage, ParsedRulesFromChalres } from "modules/charles-rule-adapters/types";
import { AUTH } from "modules/analytics/events/common/constants";
import PATHS from "config/constants/sub/paths";
import {
  trackCharlesSettingsParsed,
  trackCharlesSettingsImportFailed,
  trackCharlesSettingsImportComplete,
  trackCharlesSettingsImportDocsClicked,
} from "modules/analytics/events/features/rules";
import "./ImportFromCharlesModal.css";

interface ModalProps {
  isOpen: boolean;
  toggle: () => void;
}

const validExportSteps = [
  {
    step: `Click on "Tools" in the top Menu bar in Charles Proxy`,
  },
  {
    step: `Click on "Import/Export Settings" from the dropdown`,
  },
  {
    step: `Click on "Export" tab`,
  },
  {
    step: `Select settings that you need to export and click "Export"`,
  },
  {
    step: `Steps to be followed in Requestly:`,
    additionalSteps: [
      {
        step: `Click "Import settings from Charles Proxy" to continue.`,
      },
    ],
  },
];

export const ImportFromCharlesModal: React.FC<ModalProps> = ({ isOpen, toggle }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isDataProcessing, setIsDataProcessing] = useState<boolean>(false);
  const [isParseComplete, setIsParseComplete] = useState<boolean>(false);
  const [rulesToImport, setRulesToImport] = useState<ParsedRulesFromChalres>({});
  const [validationError, setValidationError] = useState<CharlesRuleImportErrorMessage | string | null>(null);

  const appMode = useSelector(getAppMode);
  const isRulesListRefreshPending = useSelector(getIsRefreshRulesPending);

  const onFilesDrop = async (files: File[]) => {
    const file = files[0];
    const reader = new FileReader();

    reader.onerror = () => {
      setValidationError("Could not process the selected file! Try again.");
      trackCharlesSettingsImportFailed("error reading the imported file");
    };

    reader.onload = () => {
      const fileContent = reader.result;
      setIsDataProcessing(true);

      if (!file.type.includes("xml")) {
        // stop parsing for wrong file format
        setIsDataProcessing(false);
        setValidationError("Failed to parse Charles proxy settings file.");
        trackCharlesSettingsImportFailed("wrong file format");

        return;
      }
      parseRulesFromCharlesXML(fileContent as string)
        .then((importedRules: any) => {
          setIsDataProcessing(false);
          setRulesToImport(importedRules);
          setIsParseComplete(true);
          trackCharlesSettingsParsed(importedRules?.parsedRuleTypes?.length, importedRules?.parsedRuleTypes);
        })
        .catch((error) => {
          setValidationError(error.message);
          trackCharlesSettingsImportFailed(error.message);
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
        onError: () => {
          setValidationError("Something went wrong while importing your settings! Try again.");
          trackCharlesSettingsImportFailed("error on saving the parsed rules in storage");
        }, // TODO: validations
      });
    });

    Promise.all(rulesImportPromises).then(() => {
      dispatch(
        actions.updateRefreshPendingStatus({
          type: "rules",
          newValue: !isRulesListRefreshPending,
        })
      );

      trackCharlesSettingsImportComplete(rulesToImport?.parsedRuleTypes?.length, rulesToImport?.parsedRuleTypes);
      navigate(PATHS.RULES.MY_RULES.ABSOLUTE);
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
        <div className="header text-center">Import Charles Proxy settings</div>
        <div className="mt-16">
          {isParseComplete ? (
            <div className="parsed-rules-info">
              <div className="title mt-16">Successfully parsed below settings:</div>
              <ul>
                {rulesToImport?.parsedRuleTypes?.length > 0 &&
                  rulesToImport.parsedRuleTypes.map((ruleType) => (
                    <li key={ruleType}>
                      <CheckCircleOutlined className="check-outlined-icon" /> {ruleType}
                    </li>
                  ))}
              </ul>
              {rulesToImport?.isOtherRuleTypesPresent && (
                <>
                  <Typography.Text type="secondary">
                    {/* eslint-disable-next-line */}
                    Other settings are not supported in Requestly. <a href="#">Learn more</a>
                    Learn more {/* TODO: fix source when adding import dropdown in rules table screen */}
                    <a href="#" onClick={() => trackCharlesSettingsImportDocsClicked(AUTH.SOURCE.GETTING_STARTED)}>
                      about it
                    </a>
                    .
                  </Typography.Text>
                </>
              )}
            </div>
          ) : validationError ? (
            <>
              {validationError === CharlesRuleImportErrorMessage.INVALID_EXPORT ? (
                <div className="parsed-rules-error-info">
                  <div className="subtitle mt-16">
                    Invalid settings file. Follow below steps to export settings from Charles:
                  </div>
                  <ol>
                    {validExportSteps.map(({ step, additionalSteps = [] }) => (
                      <>
                        <li>{step}</li>
                        {additionalSteps.length > 0 && (
                          <ul className="additional-import-steps-list">
                            {additionalSteps.map(({ step }) => (
                              <li>{step}</li>
                            ))}
                          </ul>
                        )}
                      </>
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
