import React, { useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Col, Row, Space } from "antd";
import { getAppMode } from "store/selectors";
import { ArrowLeftOutlined, CheckCircleOutlined, InfoCircleOutlined, LinkOutlined } from "@ant-design/icons";
import { RQButton } from "lib/design-system/components";
import { FilePicker } from "components/common/FilePicker";
import PATHS from "config/constants/sub/paths";
// import LINKS from "config/constants/sub/links";
// import { HiOutlineExternalLink } from "@react-icons/all-files/hi/HiOutlineExternalLink";
import { copyToClipBoard } from "utils/Misc";
import { parseRulesFromModheader } from "modules/rule-adapters/modheader-rule-adapters/parseRulesFromModheader";
import { addRulesAndGroupsToStorage } from "components/features/rules/ImportRulesModal/actions";
import "../importer-components.css";
import { Group, Rule } from "@requestly/shared/types/entities/rules";

const validExportSteps = [
  {
    step: `Click on the ModHeader icon in the Chrome toolbar to open the extension.`,
  },
  {
    step: `Click to open the menu from top right corner and select "Export"`,
  },
  {
    step: `Click on "Export/Share" profile.`,
  },
  {
    step: `Select the JSON tab`,
    additionalSteps: [
      {
        step: `Select the profiles you want to export`,
      },
    ],
  },
  {
    step: `Click on the "Download JSON" button`,
  },
];

interface ImportFromModheaderProps {
  source?: string | null; // null indicates this is not mounted inside modal
  callback?: () => void;
  isBackButtonVisible?: boolean;
  onBackButtonClick?: () => void;
}

export const ImportFromModheader: React.FC<ImportFromModheaderProps> = ({
  source = null,
  callback,
  isBackButtonVisible,
  onBackButtonClick,
}) => {
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isDataProcessing, setIsDataProcessing] = useState<boolean>(false);
  const [isParseComplete, setIsParseComplete] = useState<boolean>(false);
  const [rulesToImport, setRulesToImport] = useState<(Rule | Group)[]>([]);
  const [validationError, setValidationError] = useState<string | null>(null);

  const appMode = useSelector(getAppMode);

  const onFilesDrop = async (files: File[]) => {
    const file = files[0];
    const reader = new FileReader();

    reader.onerror = () => {
      setValidationError("Could not process the selected file! Try again.");
      return;
    };

    reader.onload = () => {
      const fileContent = reader.result;
      setIsDataProcessing(true);

      if (!file.type.includes("json")) {
        // stop parsing for wrong file format
        setIsDataProcessing(false);
        setValidationError("Failed to parse Modheader file.");

        return;
      }

      let modheaderProfilesJSON;
      let parsedRules = [];
      try {
        modheaderProfilesJSON = JSON.parse(fileContent as string);
        parsedRules = parseRulesFromModheader(modheaderProfilesJSON);
      } catch (e) {
        setValidationError("Failed to parse your Modheader file.");
        setIsDataProcessing(false);
        return;
      }

      setIsDataProcessing(false);
      setRulesToImport(parsedRules);
      setIsParseComplete(true);
    };
    reader.readAsText(file);
  };

  const handleModheaderRulesImport = () => {
    setIsLoading(true);

    addRulesAndGroupsToStorage(appMode, rulesToImport)
      .then(() => {
        callback?.();
        navigate(PATHS.RULES.ABSOLUTE);
      })
      .catch((e) => {
        setValidationError("Failed to import your Modheader file.");
        return;
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const handleResetImport = () => {
    setValidationError(null);
    setIsParseComplete(false);
    setRulesToImport([]);
  };

  const isParsedRulesExist = useMemo(() => !!rulesToImport.length, [rulesToImport?.length]);

  return (
    <>
      <div className="importer-container">
        <Row justify={"space-between"} className="importer-header">
          <Col className="importer-heading">
            {isBackButtonVisible && (
              <ArrowLeftOutlined size={16} className="importer-back-icon" onClick={onBackButtonClick} />
            )}
            Import Modheader profiles
          </Col>
          <Col
            className="importer-share-container"
            onClick={() =>
              copyToClipBoard(window.origin + PATHS.IMPORT_FROM_MODHEADER.ABSOLUTE, "URL copied to clipboard")
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
            title="Drag and drop your Modheader export file to upload"
            subtitle="Accepted file formats: json"
            selectorButtonTitle={isParseComplete || validationError ? "Try another file" : "Select file"}
          />
        )}

        {(isParseComplete || validationError) && (
          <>
            <div className="importer-body">
              {isParseComplete ? (
                <div className="parsed-rules-info">
                  {isParsedRulesExist && (
                    <Space direction="vertical" align="start" size={8}>
                      <div className="parsed-success-row">
                        <CheckCircleOutlined className="check-outlined-icon" /> Successfully parsed your modheader
                        profile.
                      </div>
                    </Space>
                  )}
                </div>
              ) : validationError ? (
                <div className="parsed-rules-error-info">
                  <Row className="validation-heading">
                    <InfoCircleOutlined className="icon__wrapper" />
                    Invalid export file.
                  </Row>
                  <Row className="validation-subheading">Follow below steps to export Profiles from Modheader:</Row>
                  <ol>
                    {validExportSteps.map(({ step, additionalSteps = [] }, index) => (
                      <>
                        <li key={index}>{step}</li>
                        {additionalSteps.length > 0 && (
                          <ol className="additional-import-steps-list">
                            {additionalSteps.map(({ step }, index) => (
                              <li key={index}>{step}</li>
                            ))}
                          </ol>
                        )}
                      </>
                    ))}
                  </ol>
                </div>
              ) : null}
            </div>
            <Row justify="end" className="importer-actions-row">
              <RQButton onClick={callback}>Close</RQButton>
              <RQButton
                type="primary"
                loading={isLoading}
                onClick={() => {
                  if (isParsedRulesExist) handleModheaderRulesImport();
                  else handleResetImport();
                }}
              >
                {isParsedRulesExist ? "Import rules" : "Upload another file"}
              </RQButton>
            </Row>
          </>
        )}
      </div>
    </>
  );
};
