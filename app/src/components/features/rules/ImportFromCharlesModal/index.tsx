import React, { useEffect, useMemo, useState } from "react";
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
import PATHS from "config/constants/sub/paths";
import LINKS from "config/constants/sub/links";
import {
  trackCharlesSettingsParsed,
  trackCharlesSettingsImportFailed,
  trackCharlesSettingsImportComplete,
  trackCharlesSettingsImportDocsClicked,
  trackCharlesSettingsImportViewed,
} from "modules/analytics/events/features/rules";
import "./ImportFromCharlesModal.css";

interface ModalProps {
  isOpen: boolean;
  toggle: () => void;
  triggeredBy: string;
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

const CharlesDocsLink = ({
  title,
  linkClickSrc,
  importTriggerSrc,
}: {
  title: string;
  linkClickSrc: string;
  importTriggerSrc: string;
}) => (
  <a
    target="_blank"
    rel="noreferrer"
    href={LINKS.REQUESTLY_DOCS_IMPORT_SETTINGS_FROM_CHARLES}
    onClick={() => trackCharlesSettingsImportDocsClicked(linkClickSrc, importTriggerSrc)}
  >
    {title}
  </a>
);

export const ImportFromCharlesModal: React.FC<ModalProps> = ({ isOpen, toggle, triggeredBy }) => {
  useEffect(() => {
    trackCharlesSettingsImportViewed(triggeredBy);
  }, [triggeredBy]);
  return (
    <RQModal open={isOpen} centered onCancel={toggle} className="import-from-charles-modal">
      <div className="rq-modal-content">
        <ImportFromCharles modalSrc={triggeredBy} callBack={() => toggle()} />
      </div>
    </RQModal>
  );
};

interface ImportFromCharlesProps {
  modalSrc?: string | null; // null indicates this is not mounted inside modal
  callBack?: () => void;
}

export const ImportFromCharlesRoot: React.FC = () => {
  useEffect(() => {
    trackCharlesSettingsImportViewed("TOP_LEVEL_ROUTE");
  }, []);
  return (
    <div className="root-wrapper">
      <ImportFromCharles />
    </div>
  );
};
const ImportFromCharles: React.FC<ImportFromCharlesProps> = ({ modalSrc = null, callBack }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState<boolean>(false);
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
        .then((importedRules: ParsedRulesFromChalres) => {
          setIsDataProcessing(false);
          setRulesToImport(importedRules);
          setIsParseComplete(true);
          trackCharlesSettingsParsed(
            importedRules?.parsedRuleTypes?.length,
            importedRules?.parsedRuleTypes,
            importedRules?.otherRuleTypesCount
          );
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
    setIsLoading(true);

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

    Promise.all(rulesImportPromises)
      .then(() => {
        dispatch(
          actions.updateRefreshPendingStatus({
            type: "rules",
            newValue: !isRulesListRefreshPending,
          })
        );

        trackCharlesSettingsImportComplete(rulesToImport?.parsedRuleTypes?.length, rulesToImport?.parsedRuleTypes);
        navigate(PATHS.RULES.MY_RULES.ABSOLUTE);
        callBack?.();
      })
      .finally(() => setIsLoading(false));
  };

  const handleResetImport = () => {
    setValidationError(null);
    setIsParseComplete(false);
    setRulesToImport({});
  };

  const isParsedRulesExist = useMemo(() => !!rulesToImport?.parsedRuleTypes?.length, [
    rulesToImport?.parsedRuleTypes?.length,
  ]);

  return (
    <>
      <div>
        <div className="header text-center">Import Charles Proxy settings</div>
        <div className="mt-16">
          {isParseComplete ? (
            <div className="parsed-rules-info">
              {rulesToImport?.parsedRuleTypes?.length > 0 && (
                <>
                  <div className="title mt-16">Successfully parsed below settings:</div>
                  <ul>
                    {rulesToImport.parsedRuleTypes.map((ruleType) => (
                      <li key={ruleType}>
                        <CheckCircleOutlined className="check-outlined-icon" /> {ruleType}
                      </li>
                    ))}
                  </ul>
                </>
              )}
              {rulesToImport?.otherRuleTypesCount > 0 &&
                (isParsedRulesExist ? (
                  <div className="text-sm text-dark-gray">
                    Other settings are not supported.{" "}
                    <CharlesDocsLink
                      title="Learn more"
                      linkClickSrc="some_settings_unsupported_screen"
                      importTriggerSrc={modalSrc}
                    />
                  </div>
                ) : (
                  <div className="text-center title mt-16" style={{ fontWeight: "normal" }}>
                    Uploaded settings are not supported. <br />
                    Learn more about supported setting types{" "}
                    <CharlesDocsLink
                      title="here"
                      linkClickSrc="all_settings_unsupported_screen"
                      importTriggerSrc={modalSrc}
                    />
                    .
                  </div>
                ))}
            </div>
          ) : validationError ? (
            <>
              {validationError === CharlesRuleImportErrorMessage.INVALID_EXPORT ? (
                <div className="parsed-rules-error-info">
                  <div className="subtitle mt-16">
                    Invalid settings file. Follow below steps to export settings from Charles:
                  </div>
                  <ol>
                    {validExportSteps.map(({ step, additionalSteps = [] }, index) => (
                      <>
                        <li key={index}>{step}</li>
                        {additionalSteps.length > 0 && (
                          <ul className="additional-import-steps-list">
                            {additionalSteps.map(({ step }, index) => (
                              <li key={index}>{step}</li>
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
              title="Drag and drop your Charles export file"
            />
          )}
        </div>

        <div className="text-center title mt-16">
          {" "}
          To export your rules from Charles,{" "}
          <CharlesDocsLink title="Follow these steps" linkClickSrc="upload_screen" importTriggerSrc={modalSrc} />
        </div>
      </div>

      {isParseComplete || validationError ? (
        isParsedRulesExist ? (
          <div className="rq-modal-footer">
            <Row justify="end">
              <RQButton type="primary" loading={isLoading} onClick={handleCharlesRulesImport}>
                Import
              </RQButton>
            </Row>
          </div>
        ) : (
          <div className="rq-modal-footer">
            <Row justify="end">
              <RQButton type="primary" onClick={handleResetImport}>
                Try another file
              </RQButton>
            </Row>
          </div>
        )
      ) : null}
    </>
  );
};
