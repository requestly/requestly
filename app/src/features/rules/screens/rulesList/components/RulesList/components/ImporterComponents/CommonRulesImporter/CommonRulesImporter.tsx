import React, { useState } from "react";
import { HttpRuleImporterMethod, HttpRuleImporterOutput } from "@requestly/alternative-importers";
import { FilePicker } from "components/common/FilePicker";
import { useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { Group, RecordType, Rule } from "@requestly/shared/types/entities/rules";
import { CheckCircleOutlined, InfoCircleOutlined, LinkOutlined, WarningOutlined } from "@ant-design/icons";
import { HiOutlineExternalLink } from "@react-icons/all-files/hi/HiOutlineExternalLink";
import { Col, Row } from "antd";
import CopyButton from "components/misc/CopyButton";

import "./commonRulesImporter.scss";
import { RBACEmptyState, RoleBasedComponent } from "features/rbac";
import { RQButton } from "lib/design-system/components";
import { addRulesAndGroupsToStorage } from "components/features/rules/ImportRulesModal/actions";
import { getAppMode } from "store/selectors";
import PATHS from "config/constants/sub/paths";

export interface CommonRulesImporterProps {
  productName: string;
  supportedFileTypes: string[];
  importer: HttpRuleImporterMethod<any>;
  docsLink: string;
  shareLink: string;
}

export const CommonRulesImporter: React.FC<CommonRulesImporterProps> = (props) => {
  const navigate = useNavigate();
  const appMode = useSelector(getAppMode);

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isDataProcessing, setIsDataProcessing] = useState<boolean>(false);
  const [isParseComplete, setIsParseComplete] = useState<boolean>(false);
  const [recordsToImport, setRecordsToImport] = useState<(Rule | Group)[]>();
  const [importerOutput, setImporterOutput] = useState<HttpRuleImporterOutput>();
  const [importError, setImportError] = useState<string | null>(null);

  const handleResetImport = () => {
    setImportError(null);
    setIsParseComplete(false);
    setRecordsToImport([]);
  };

  const onFilesDrop = async (files: File[]) => {
    const file = files[0];
    const reader = new FileReader();

    reader.onerror = () => {
      setImportError("Could not process the selected file! Try again.");
      //   trackResourceOverrideSettingsImportFailed("error reading the imported file");
    };

    reader.onload = () => {
      const fileContent = reader.result as string;
      setIsDataProcessing(true);

      if (!props.supportedFileTypes.includes(file.type)) {
        setIsDataProcessing(false);
        setImportError("Failed to parse settings file");
        // trackResourceOverrideSettingsImportFailed("wrong file format");
        return;
      }
      try {
        const output = props.importer(JSON.parse(fileContent));
        setImporterOutput(output);
        const convertedRecords = output.data || [];
        setIsDataProcessing(false);
        setRecordsToImport(convertedRecords);
        setIsParseComplete(true);
        // trackResourceOverrideSettingsParsed(
        //   convertedRules?.length,
        //   convertedRules?.map((rule) => rule.ruleType)
        // );
      } catch (e) {
        setIsDataProcessing(false);
        // trackResourceOverrideSettingsImportFailed(e.message);
        setImportError("Failed to parse settings file");
      }
    };
    reader.readAsText(file);
  };

  const handleRulesImport = () => {
    setIsLoading(true);

    addRulesAndGroupsToStorage(appMode, recordsToImport)
      .then(() => {
        navigate(PATHS.RULES.ABSOLUTE);
      })
      .catch((e) => {
        setImportError("Failed to import your file");
        return;
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const DocsLink: React.FC<{ title: string }> = ({ title }) => {
    return (
      <a
        target="_blank"
        rel="noreferrer"
        href={props.docsLink}
        // onClick={() => trackResourceOverrideSettingsImportDocsClicked(linkClickSrc, importTriggerSrc)}
      >
        {title ?? "Learn more about it here"}
        <HiOutlineExternalLink className="external-icon-link" />
      </a>
    );
  };

  const HeaderComponent: React.FC<{}> = () => {
    return (
      <Row justify={"space-between"} className="common-importer-header">
        <Col className="importer-header-heading">Import {props.productName} settings</Col>
        <CopyButton icon={<LinkOutlined />} type={"transparent"} title={"Share"} copyText={props.shareLink} />
      </Row>
    );
  };

  const FooterComponent: React.FC<{}> = () => {
    return (
      <div className="common-importer-footer">
        To export your rules from {props.productName},{"  "}
        <Link target="_blank" rel="noreferrer" to={props.docsLink}>
          Follow these steps
          <div className="icon__wrapper">
            <HiOutlineExternalLink />
          </div>
        </Link>
      </div>
    );
  };

  const ImporterComponent: React.FC<{}> = () => {
    return (
      <>
        {importError ? <ImportErrorComponent /> : null}
        <FilePicker
          maxFiles={1}
          onFilesDrop={(files) => {
            handleResetImport();
            onFilesDrop(files);
          }}
          isProcessing={isDataProcessing}
          title={`Drag and drop your ${props.productName} export file to upload`}
          subtitle={`Accepted file formats: ${props.supportedFileTypes.join(", ")}`}
          selectorButtonTitle={isParseComplete || importError ? "Try another file" : "Select file"}
        />
      </>
    );
  };

  const ProcessedSuccessComponent: React.FC<{}> = () => {
    return (
      <>
        {importerOutput?.notSupportedFeatures.length > 0 && (
          <div className="common-importer-warning-banner">
            <div className="common-importer-warning-banner-text">
              <WarningOutlined className="common-importer-warning-icon" /> A few settings are not supported.
            </div>
            <div className="common-importer-warning-docs-link">
              <DocsLink title="Know more" />
            </div>
          </div>
        )}
        {/* <Space direction="vertical" align="start" size={8}> */}
        <div className="imported-rules-container">
          <div className="success-heading">
            <CheckCircleOutlined className="check-outlined-icon" /> Successfully parsed below settings
          </div>
          <ul>
            {recordsToImport.map((record) => {
              if (record.objectType === RecordType.RULE) {
                return (
                  <li key={record.id}>
                    <b>{record.ruleType} Rule </b> : {record.name}
                  </li>
                );
              }
              return null;
            })}
          </ul>
        </div>
        {/* </Space> */}
        <Row justify="end" className="importer-actions-row">
          <RQButton
            type="primary"
            loading={isLoading}
            onClick={() => {
              handleRulesImport();
            }}
          >
            Import rules
          </RQButton>
        </Row>
      </>
    );
  };

  const ImportErrorComponent: React.FC<{}> = () => {
    return (
      <div className="import-error">
        <Row className="import-error-heading">
          <InfoCircleOutlined className="icon__wrapper" />
          &nbsp;{importError}. Try importing another one.
        </Row>
      </div>
    );
  };

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
      <div className={`common-importer-container ${isParseComplete ? "importer-success" : ""}`}>
        <HeaderComponent />
        <div className="common-importer-body">
          {!isParseComplete && <ImporterComponent />}
          {isParseComplete && <ProcessedSuccessComponent />}
        </div>
        <FooterComponent />
      </div>
    </RoleBasedComponent>
  );
};
