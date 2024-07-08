import React, { useEffect, useMemo, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { Col, Modal, Row, Space } from "antd";
import { actions } from "store";
import { getAppMode, getIsRefreshRulesPending } from "store/selectors";
import { ArrowLeftOutlined, CheckCircleOutlined, InfoCircleOutlined, LinkOutlined } from "@ant-design/icons";
import { RQButton } from "lib/design-system/components";
import { FilePicker } from "components/common/FilePicker";
import { parseRulesFromCharlesXML } from "modules/rule-adapters/charles-rule-adapters/parseRulesFromCharlesXML";
import { createNewGroupAndSave } from "modules/rule-adapters/utils";
import {
  CharlesRuleImportErrorMessage,
  ParsedRulesFromChalres,
} from "modules/rule-adapters/charles-rule-adapters/types";
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
    {title} <HiOutlineExternalLink className="external-icon-link" />
  </a>
);

export const ImportFromCharlesModal: React.FC<ModalProps> = ({ isOpen, toggle, triggeredBy }) => {
  useEffect(() => {
    trackCharlesSettingsImportViewed(triggeredBy);
  }, [triggeredBy]);
  return (
    <Modal
      open={isOpen}
      centered
      onCancel={toggle}
      footer={null}
      className="import-from-charles-modal custom-rq-modal"
      width={550}
    >
      <ImportFromCharles source={triggeredBy} callback={() => toggle()} />
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
  source?: string | null; // null indicates this is not mounted inside modal
  callback?: () => void;
  isBackButtonVisible?: boolean;
  onBackButtonClick?: () => void;
}

export const ImportFromCharles: React.FC<ImportFromCharlesProps> = ({
  source = null,
  callback,
  isBackButtonVisible,
  onBackButtonClick,
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
          //@ts-ignore
          actions.updateRefreshPendingStatus({
            type: "rules",
            newValue: !isRulesListRefreshPending,
          })
        );

        trackCharlesSettingsImportComplete(rulesToImport?.parsedRuleTypes?.length, rulesToImport?.parsedRuleTypes);
        navigate(PATHS.RULES.MY_RULES.ABSOLUTE);
        callback?.();
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
            {isBackButtonVisible && (
              <ArrowLeftOutlined size={16} className="charles-import-back-icon" onClick={onBackButtonClick} />
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

        {(isParseComplete || validationError) && (
          <div className="charles-import-body">
            {isParseComplete ? (
              <div className="parsed-rules-info">
                {rulesToImport?.parsedRuleTypes?.length > 0 && (
                  <Space direction="vertical" align="start" size={8}>
                    <div className="parsed-success-row">
                      <CheckCircleOutlined className="check-outlined-icon" /> Successfully parsed below settings:
                    </div>
                    <ul>
                      {rulesToImport.parsedRuleTypes.map((ruleType) => (
                        <li key={ruleType}>{ruleType}</li>
                      ))}
                    </ul>
                  </Space>
                )}
                {rulesToImport?.otherRuleTypesCount > 0 && (
                  <div className="info-link-container">
                    <InfoCircleOutlined />
                    {isParsedRulesExist ? "Other settings are not supported." : "Uploaded settings are not supported."}
                    <CharlesDocsLink
                      title="Learn more about it here"
                      linkClickSrc="all_settings_unsupported_screen"
                      importTriggerSrc={source}
                    />
                  </div>
                )}
              </div>
            ) : validationError ? (
              <div className="parsed-rules-error-info">
                <Row className="validation-heading">
                  <InfoCircleOutlined className="icon__wrapper" />
                  Invalid settings file.
                </Row>
                <Row className="validation-subheading">Follow below steps to export settings from Charles:</Row>
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
            ) : null}

            {isParsedRulesExist && (
              <Row justify="center" className="mt-8">
                <RQButton type="primary" loading={isLoading} onClick={handleCharlesRulesImport}>
                  Import
                </RQButton>
              </Row>
            )}
          </div>
        )}

        <FilePicker
          maxFiles={1}
          onFilesDrop={(files) => {
            handleResetImport();
            onFilesDrop(files);
          }}
          isProcessing={isDataProcessing}
          title="Drag and drop your Charles export file to upload"
          subtitle="Accepted file formats: CSV, Trace test file, and XML"
          selectorButtonTitle={isParseComplete || validationError ? "Try another file" : "Select file"}
        />

        <div className="charles-import-footer">
          To export your rules from Charles,{"  "}
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
