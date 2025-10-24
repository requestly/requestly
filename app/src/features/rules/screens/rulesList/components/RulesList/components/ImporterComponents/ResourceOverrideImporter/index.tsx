import React, { useEffect, useMemo, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { Col, Modal, Row, Space } from "antd";
import { globalActions } from "store/slices/global/slice";
import { getAppMode, getIsRefreshRulesPending } from "store/selectors";
import {
  ArrowLeftOutlined,
  CheckCircleOutlined,
  InfoCircleOutlined,
  LinkOutlined,
  WarningOutlined,
} from "@ant-design/icons";
import { RQButton } from "lib/design-system/components";
import { FilePicker } from "components/common/FilePicker";
import { createNewGroupAndSave } from "modules/rule-adapters/utils";
import PATHS from "config/constants/sub/paths";
import LINKS from "config/constants/sub/links";
import { HiOutlineExternalLink } from "@react-icons/all-files/hi/HiOutlineExternalLink";
import { copyToClipBoard } from "utils/Misc";
import "../importer-components.css";
import { parseRulesFromResourceOverride } from "modules/rule-adapters/resource-override-rule-adapters/parseRulesFromResourceOverride";
import { Rule } from "@requestly/shared/types/entities/rules";
import { generateObjectId } from "utils/FormattingHelper";
import {
  trackResourceOverrideSettingsImportComplete,
  trackResourceOverrideSettingsImportDocsClicked,
  trackResourceOverrideSettingsImportFailed,
  trackResourceOverrideSettingsImportViewed,
  trackResourceOverrideSettingsParsed,
} from "modules/analytics/events/features/rules";
import { RBACEmptyState, RoleBasedComponent } from "features/rbac";

const validExportSteps = [
  {
    step: `Open Resource Override Dashboard by clicking on resource override icon in extentions tab`,
  },
  {
    step: `Click on "options" in the top right buttons from the dashboard`,
  },
  {
    step: `Click on "Save Rules"`,
  },
];

const ResourceOverrideLink = ({
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
    href={LINKS.REQUESTLY_DOCS_IMPORT_SETTINGS_FROM_RESOURCE_OVERRIDE}
    onClick={() => trackResourceOverrideSettingsImportDocsClicked(linkClickSrc, importTriggerSrc)}
  >
    {title} <HiOutlineExternalLink className="external-icon-link" />
  </a>
);

interface ModalProps {
  isOpen: boolean;
  toggle: () => void;
  triggeredBy: string;
  isBackButtonVisible?: boolean;
  onBackButtonClick?: () => void;
}

export const ImportFromResourceOverrideModal: React.FC<ModalProps> = ({
  isOpen,
  toggle,
  triggeredBy,
  isBackButtonVisible,
  onBackButtonClick,
}) => {
  useEffect(() => {
    trackResourceOverrideSettingsImportViewed(triggeredBy);
  }, [triggeredBy]);

  return (
    <Modal
      open={isOpen}
      centered
      onCancel={toggle}
      footer={null}
      className="importer-modal custom-rq-modal"
      width={550}
    >
      <ImportFromResourceOverride
        source={triggeredBy}
        callback={() => toggle()}
        isBackButtonVisible={isBackButtonVisible}
        onBackButtonClick={onBackButtonClick}
      />
    </Modal>
  );
};

export const ImportFromResourceOverrideWrapperView: React.FC = () => {
  useEffect(() => {
    trackResourceOverrideSettingsImportViewed("TOP_LEVEL_ROUTE");
  }, []);

  return (
    <RoleBasedComponent
      resource="http_rule"
      permission="create"
      fallback={
        <RBACEmptyState
          title="You cannot import as a viewer"
          description="As a viewer, you will be able to view and test rules once someone from your team import them. You can contact your workspace admin to update your role."
        />
      }
    >
      <div className="importer-wrapper">
        <ImportFromResourceOverride />
      </div>
    </RoleBasedComponent>
  );
};

interface ImportFromResourceOverrideProps {
  source?: string | null; // null indicates this is not mounted inside modal
  callback?: () => void;
  isBackButtonVisible?: boolean;
  onBackButtonClick?: () => void;
}

export const ImportFromResourceOverride: React.FC<ImportFromResourceOverrideProps> = ({
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
  const [rulesToImport, setRulesToImport] = useState<Rule[]>();
  const [validationError, setValidationError] = useState<string | null>(null);

  const appMode = useSelector(getAppMode);
  const isRulesListRefreshPending = useSelector(getIsRefreshRulesPending);

  const onFilesDrop = async (files: File[]) => {
    const file = files[0];
    const reader = new FileReader();

    reader.onerror = () => {
      setValidationError("Could not process the selected file! Try again.");
      trackResourceOverrideSettingsImportFailed("error reading the imported file");
    };

    reader.onload = () => {
      const fileContent = reader.result as string;
      setIsDataProcessing(true);

      if (!file.type.includes("json")) {
        // stop parsing for wrong file format
        setIsDataProcessing(false);
        setValidationError("Failed to parse resource override settings file.");
        trackResourceOverrideSettingsImportFailed("wrong file format");
        return;
      }
      try {
        const convertedRules = parseRulesFromResourceOverride(JSON.parse(fileContent));
        setIsDataProcessing(false);
        setRulesToImport(convertedRules);
        setIsParseComplete(true);
        trackResourceOverrideSettingsParsed(
          convertedRules?.length,
          convertedRules?.map((rule) => rule.ruleType)
        );
      } catch (e) {
        setIsDataProcessing(false);
        trackResourceOverrideSettingsImportFailed(e.message);
        setValidationError("Failed to parse resource override settings file.");
      }
    };
    reader.readAsText(file);
  };

  const handleResuorceOverrideRulesImport = async () => {
    setIsLoading(true);
    await createNewGroupAndSave({
      appMode,
      rules: rulesToImport,
      status: false,
      groupName: `resource-override-${generateObjectId()}`,
      onSuccess: () => {},
      onError: () => {
        setValidationError("Something went wrong while importing your settings! Try again.");
        trackResourceOverrideSettingsImportFailed("error on saving the parsed rules in storage");
      },
    });
    dispatch(
      //@ts-ignore
      globalActions.updateRefreshPendingStatus({
        type: "rules",
        newValue: !isRulesListRefreshPending,
      })
    );
    navigate(PATHS.RULES.MY_RULES.ABSOLUTE);
    callback?.();
    setIsLoading(false);
    trackResourceOverrideSettingsImportComplete(
      rulesToImport?.length,
      rulesToImport?.map((rule) => rule.ruleType)
    );
  };

  const handleResetImport = () => {
    setValidationError(null);
    setIsParseComplete(false);
    setRulesToImport([]);
  };

  const isParsedRulesExist = useMemo(() => !!rulesToImport?.length, [rulesToImport?.length]);
  return (
    <>
      <div className="importer-container">
        <Row justify={"space-between"} className="importer-header">
          <Col className="importer-heading">
            {isBackButtonVisible && <ArrowLeftOutlined size={16} onClick={onBackButtonClick} />}
            Import Resource Override settings
          </Col>
          <Col
            className="importer-share-container"
            onClick={() =>
              copyToClipBoard(window.origin + PATHS.IMPORT_FROM_RESOURCE_OVERRIDE.ABSOLUTE, "URL copied to clipboard")
            }
          >
            <LinkOutlined className="icon__wrapper" />
            Share
          </Col>
        </Row>

        {!isParseComplete && !validationError && (
          <FilePicker
            maxFiles={1}
            onFilesDrop={(files) => {
              handleResetImport();
              onFilesDrop(files);
            }}
            isProcessing={isDataProcessing}
            title="Drag and drop your Resource Override export file to upload"
            subtitle="Accepted file formats: JSON"
            selectorButtonTitle={isParseComplete || validationError ? "Try another file" : "Select file"}
          />
        )}

        {isParseComplete && isParsedRulesExist && rulesToImport?.length > 0 && (
          <div className="importer-warning-banner">
            <div className="importer-warning-banner-text">
              <WarningOutlined className="importer-warning-icon" /> A few settings are not supported.
            </div>
            <div className="importer-warning-docs-link">
              <ResourceOverrideLink
                title="Learn more about it here"
                linkClickSrc="all_settings_unsupported_screen"
                importTriggerSrc={source}
              />
            </div>
          </div>
        )}

        {(isParseComplete || validationError) && (
          <div className="importer-body">
            {isParseComplete ? (
              <div className="importer-parsed-rules-info">
                {isParsedRulesExist && (
                  <Space direction="vertical" align="start" size={8}>
                    <div className="parsed-success-row">
                      <CheckCircleOutlined className="check-outlined-icon" /> Successfully parsed below settings:
                    </div>
                    <ul>
                      {rulesToImport.map((rule) => (
                        <li key={rule.id}>{rule.ruleType}</li>
                      ))}
                    </ul>
                  </Space>
                )}
                {!isParsedRulesExist && rulesToImport?.length > 0 && (
                  <>
                    <div className="info-link-container">
                      <InfoCircleOutlined />
                      {"Uploaded settings are not supported."}
                    </div>
                    <div className="doc-link-container">
                      <ResourceOverrideLink
                        title="Learn more about it here"
                        linkClickSrc="all_settings_unsupported_screen"
                        importTriggerSrc={source}
                      />
                    </div>
                  </>
                )}
              </div>
            ) : validationError ? (
              <div className="parsed-rules-error-info">
                <Row className="validation-heading">
                  <InfoCircleOutlined />
                  Invalid settings file.
                </Row>
                <Row className="validation-subheading">
                  Follow below steps to export settings from Resource Override:
                </Row>
                <ol>
                  {validExportSteps.map(({ step }, index) => (
                    <>
                      <li key={index}>{step}</li>
                      {/* {additionalSteps.length > 0 && (
                        <ol className="additional-import-steps-list">
                          {additionalSteps.map(({ step }, index) => (
                            <li key={index}>{step}</li>
                          ))}
                        </ol>
                      )} */}
                    </>
                  ))}
                </ol>
              </div>
            ) : null}
          </div>
        )}

        {(isParseComplete || validationError) && (
          <Row justify="end" className="importer-actions-row">
            <RQButton onClick={callback}>Close</RQButton>
            <RQButton
              type="primary"
              loading={isLoading}
              onClick={() => {
                if (isParsedRulesExist) handleResuorceOverrideRulesImport();
                else handleResetImport();
              }}
            >
              {isParsedRulesExist ? "Import rules" : "Upload another file"}
            </RQButton>
          </Row>
        )}
      </div>

      <div className="importer-footer">
        To export your rules from Resource Override,{"  "}
        <Link target="_blank" rel="noreferrer" to={LINKS.REQUESTLY_DOCS_IMPORT_SETTINGS_FROM_RESOURCE_OVERRIDE}>
          Follow these steps
          <div className="icon__wrapper">
            <HiOutlineExternalLink />
          </div>
        </Link>
      </div>
    </>
  );
};
