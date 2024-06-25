import React, { useEffect, useMemo, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { Col, Modal, Row, Space, Typography } from "antd";
import { actions } from "store";
import { getAppMode, getIsRefreshRulesPending } from "store/selectors";
import { ArrowLeftOutlined, CheckCircleOutlined, LinkOutlined } from "@ant-design/icons";
import { RQButton } from "lib/design-system/components";
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
import "./charlesImporter.css";
import { HiOutlineExternalLink } from "@react-icons/all-files/hi/HiOutlineExternalLink";
import { copyToClipBoard } from "utils/Misc";

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
    <Modal open={isOpen} centered onCancel={toggle} footer={null} className="import-from-charles-modal custom-rq-modal">
      <ImportFromCharles modalSrc={triggeredBy} callBack={() => toggle()} />
    </Modal>
  );
};

export const ImportFromCharlesWrapperView: React.FC = () => {
  useEffect(() => {
    trackCharlesSettingsImportViewed("TOP_LEVEL_ROUTE");
  }, []);
  return (
    <div className="charles-import-wrapper">
      <ImportFromCharles />
    </div>
  );
};

interface ImportFromCharlesProps {
  modalSrc?: string | null; // null indicates this is not mounted inside modal
  callBack?: () => void;
  showBackBtn?: boolean;
  onClickBackButton?: () => void;
}

export const ImportFromCharles: React.FC<ImportFromCharlesProps> = ({
  modalSrc = null,
  callBack,
  showBackBtn,
  onClickBackButton,
}) => {
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
      <div className="charles-import-container">
        <Row justify={"space-between"} className="charles-import-header">
          <Col className="charles-import-heading">
            {showBackBtn && (
              <ArrowLeftOutlined size={16} className="charles-import-back-icon" onClick={onClickBackButton} />
            )}
            Import Charles Proxy settings
          </Col>
          <Col
            className="charles-import-share-container"
            onClick={() =>
              copyToClipBoard(window.origin + PATHS.IMPORT_FROM_CHARLES.ABSOLUTE, "URL copied to clipboard")
            }
          >
            <LinkOutlined className="icon__wrapper" />
            Share
          </Col>
        </Row>

        {!isParseComplete && !validationError && (
          <FilePicker
            maxFiles={1}
            onFilesDrop={onFilesDrop}
            isProcessing={isDataProcessing}
            title="Drag and drop your Charles export file to upload"
            subtitle="Accepted file formats: CSV, Trace test file, and XML"
          />
        )}

        {(isParseComplete || validationError) && (
          <div className="charles-import-body">
            {isParseComplete ? (
              <div className="parsed-rules-info">
                {rulesToImport?.parsedRuleTypes?.length > 0 && (
                  <Space direction="vertical" align="center">
                    <div className="">Successfully parsed below settings:</div>
                    <ul>
                      {rulesToImport.parsedRuleTypes.map((ruleType) => (
                        <li key={ruleType}>
                          <CheckCircleOutlined className="check-outlined-icon" /> {ruleType}
                        </li>
                      ))}
                    </ul>
                  </Space>
                )}
                {rulesToImport?.otherRuleTypesCount > 0 &&
                  (isParsedRulesExist ? (
                    <div className="text-center">
                      Other settings are not supported.{" "}
                      <CharlesDocsLink
                        title="Learn more"
                        linkClickSrc="some_settings_unsupported_screen"
                        importTriggerSrc={modalSrc}
                      />
                    </div>
                  ) : (
                    <div className="text-center">
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
                    Invalid settings file. Follow below steps to export settings from Charles:
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
                  <div className="text-center">
                    <Typography.Text type="danger">{validationError}</Typography.Text>
                  </div>
                )}
              </>
            ) : null}

            <Row justify="center" className="mt-8">
              {isParsedRulesExist ? (
                <RQButton type="primary" loading={isLoading} onClick={handleCharlesRulesImport}>
                  Import
                </RQButton>
              ) : (
                <RQButton type="primary" onClick={handleResetImport}>
                  Try another file
                </RQButton>
              )}
            </Row>
          </div>
        )}

        <div className="charles-import-footer">
          To export your rules from Charles,{" "}
          <Link target="_blank" rel="noreferrer" to={LINKS.REQUESTLY_DOCS_IMPORT_SETTINGS_FROM_CHARLES}>
            Follow these steps
            <div className="icon__wrapper">
              <HiOutlineExternalLink />
            </div>
          </Link>
        </div>
      </div>
    </>
  );
};
