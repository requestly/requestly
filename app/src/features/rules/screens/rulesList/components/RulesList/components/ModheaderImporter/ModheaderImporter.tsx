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
import { Group, Rule } from "types";
import { addRulesAndGroupsToStorage } from "components/features/rules/ImportRulesModal/actions";
import "./modheaderImporter.css";
import { redirectToRules } from "utils/RedirectionUtils";

const validExportSteps = [
  {
    step: `Click on the ModHeader icon in the Chrome toolbar to open the extension.`,
  },
  {
    step: `Click to opent the menu from top right corner and select "Export"`,
  },
  {
    step: `Click on "Export/ share" profile.`,
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

// const CharlesDocsLink = ({
//   title,
//   linkClickSrc,
//   importTriggerSrc,
// }: {
//   title: string;
//   linkClickSrc: string;
//   importTriggerSrc: string;
// }) => (
//   <a
//     target="_blank"
//     rel="noreferrer"
//     href={LINKS.REQUESTLY_DOCS_IMPORT_SETTINGS_FROM_CHARLES}
//     onClick={() => trackCharlesSettingsImportDocsClicked(linkClickSrc, importTriggerSrc)}
//   >
//     {title} <HiOutlineExternalLink className="external-icon-link" />
//   </a>
// );

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
      try {
        modheaderProfilesJSON = JSON.parse(fileContent as string);
      } catch (e) {
        setValidationError("Failed to parse your Modheader file.");
        setIsDataProcessing(false);
        return;
      }

      const importedRules = parseRulesFromModheader(modheaderProfilesJSON);

      setIsDataProcessing(false);
      setRulesToImport(importedRules);
      setIsParseComplete(true);
    };
    reader.readAsText(file);
  };

  const handleModheaderRulesImport = () => {
    setIsLoading(true);

    addRulesAndGroupsToStorage(appMode, rulesToImport)
      // .then(() => {
      //   dispatch(
      //     actions.updateRefreshPendingStatus({
      //       type: "rules",
      //       newValue: !isRulesListRefreshPending,
      //     })
      //   );
      // })
      .then(() => {
        callback?.();
        redirectToRules(navigate, true);
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
      <div className="modheader-import-container">
        <Row justify={"space-between"} className="modheader-import-header">
          <Col className="modheader-import-heading">
            {isBackButtonVisible && (
              <ArrowLeftOutlined size={16} className="modheader-import-back-icon" onClick={onBackButtonClick} />
            )}
            Import Modheader profiles
          </Col>
          <Col
            className="modheader-import-share-container"
            onClick={() =>
              copyToClipBoard(window.origin + PATHS.IMPORT_FROM_MODHEADER.ABSOLUTE, "URL copied to clipboard")
            }
          >
            <LinkOutlined className="icon__wrapper" />
            Share
          </Col>
        </Row>

        {(isParseComplete || validationError) && (
          <div className="modheader-import-body">
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
                <RQButton type="primary" loading={isLoading} onClick={handleModheaderRulesImport}>
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
          title="Drag and drop your Modheader export file to upload"
          subtitle="Accepted file formats: JSON"
          selectorButtonTitle={isParseComplete || validationError ? "Try another file" : "Select file"}
        />

        {/* <div className="charles-import-footer">
          To export your rules from Charles,{"  "}
          <Link target="_blank" rel="noreferrer" to={LINKS.REQUESTLY_DOCS_IMPORT_SETTINGS_FROM_CHARLES}>
            Follow these steps
            <div className="icon__wrapper">
              <HiOutlineExternalLink />
            </div>
          </Link>
        </div> */}
      </div>
    </>
  );
};
