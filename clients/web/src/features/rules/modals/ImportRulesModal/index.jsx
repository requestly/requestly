import { useState, useCallback, useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useFeatureLimiter } from "hooks/featureLimiter/useFeatureLimiter";
import { useFeatureIsOn, useFeatureValue } from "@growthbook/growthbook-react";
import { Button, Col, List, Modal, Row, Space } from "antd";
import { toast } from "utils/Toast.js";
import { AiOutlineWarning } from "@react-icons/all-files/ai/AiOutlineWarning";
import { BsFileEarmarkCheck } from "@react-icons/all-files/bs/BsFileEarmarkCheck";
import CharlesIcon from "assets/icons/charlesIcon.svg?react";
import ModheaderIcon from "assets/icons/modheaderIcon.svg?react";
import ResourceOverrideIcon from "assets/icons/resourceOverrideIcon.webp";
import { getAppMode, getIsRefreshRulesPending } from "store/selectors";
import { getUserAuthDetails } from "store/slices/global/user/selectors";
import { getAllRules } from "store/features/rules/selectors";
import { trackRQLastActivity } from "utils/AnalyticsUtils";
import { globalActions } from "store/slices/global/slice";
import { processDataToImport, addRulesAndGroupsToStorage } from "./actions";
import { RQButton } from "lib/design-system/components";
import { FilePicker } from "components/common/FilePicker";
import { FeatureLimitType } from "hooks/featureLimiter/types";
import { RULE_IMPORT_TYPE } from "features/rules";
import Logger from "lib/logger";
import {
  trackRulesJsonParsed,
  trackRulesImportFailed,
  trackRulesImportCompleted,
  trackCharlesSettingsImportStarted,
  trackResourceOverrideSettingsImportStarted,
  trackHeaderEditorSettingsImportStarted,
} from "modules/analytics/events/features/rules";
import { trackUpgradeToastViewed } from "features/pricing/components/PremiumFeature/analytics";
import "./importRules.scss";
import { ImportFromCharles } from "features/rules/screens/rulesList/components/RulesList/components/ImporterComponents/CharlesImporter";
import { SOURCE } from "modules/analytics/events/common/constants";
import { ImportFromModheader } from "features/rules/screens/rulesList/components/RulesList/components/ImporterComponents/ModheaderImporter/ModheaderImporter";
import { ImportFromResourceOverride } from "features/rules/screens/rulesList/components/RulesList/components/ImporterComponents/ResourceOverrideImporter";
import { useLocation } from "react-router-dom";
import { ImporterType } from "components/Home/types";
import { HeaderEditorImporter } from "features/rules/screens/rulesList/components/RulesList/components/ImporterComponents/HeaderEditorImporter/HeaderEditorImporterComponent";

export const ImportRulesModal = ({ toggle: toggleModal, isOpen }) => {
  //Global State
  const dispatch = useDispatch();
  const { state } = useLocation();
  const appMode = useSelector(getAppMode);
  const allRules = useSelector(getAllRules);
  const user = useSelector(getUserAuthDetails);
  const isRulesListRefreshPending = useSelector(getIsRefreshRulesPending);
  const { getFeatureLimitValue } = useFeatureLimiter();
  const isCharlesImportFeatureFlagOn = useFeatureIsOn("import_rules_from_charles");

  //Component State
  const [dataToImport, setDataToImport] = useState(false);
  const [processingDataToImport, setProcessingDataToImport] = useState(false);
  const [rulesToImportCount, setRulesToImportCount] = useState(false);
  const [groupsToImportCount, setGroupsToImportCount] = useState(false);
  const [conflictingRecords, setConflictingRecords] = useState([]);
  const [isImportFromCharlesModalOpen, setIsImportFromCharlesModalOpen] = useState(false);
  const [isImportFromModheaderModalOpen, setIsImportFromModheaderModalOpen] = useState(false);
  const [isImportFromResourceOverrideModalOpen, setIsImportFromResourceOverrideModalOpen] = useState(false);
  const [isImportFromHeaderEditorModalOpen, setIsImportFromHeaderEditorModalOpen] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  const isImportLimitReached = useMemo(() => {
    return getFeatureLimitValue(FeatureLimitType.num_rules) < rulesToImportCount + allRules.length;
  }, [rulesToImportCount, getFeatureLimitValue, allRules.length]);

  const isBackgateRestrictionEnabled = useFeatureValue("backgates_restriction", false);
  const isUpgradePopoverEnabled = useFeatureValue("show_upgrade_popovers", false);

  const onDrop = useCallback(
    async (acceptedFiles) => {
      //Ignore other uploaded files
      const file = acceptedFiles[0];

      const reader = new FileReader();

      reader.onabort = () => toggleModal();
      reader.onerror = () => toggleModal();
      reader.onload = () => {
        //Render the loader
        setProcessingDataToImport(true);
        let parsedArray = [];
        try {
          parsedArray = JSON.parse(reader.result);
          //Start processing data
          processDataToImport(parsedArray, user, allRules).then((result) => {
            setDataToImport(result.data);
            setRulesToImportCount(result.rulesCount);
            setGroupsToImportCount(result.groupsCount);
            trackRulesJsonParsed({
              parsed_rules_count: result.rulesCount,
              parsed_groups_count: result.groupsCount,
              successful: true,
            });
          });
        } catch (error) {
          Logger.log(error);
          alert("Imported file doesn't match Requestly format. Please choose another file.");
          trackRulesJsonParsed({
            successful: false,
          });
          trackRulesImportFailed("json_parse_failed");
          toggleModal();
        }
      };
      reader.readAsText(file);
    },
    [user, allRules, toggleModal]
  );

  const renderFilePicker = () => {
    return (
      <FilePicker
        onFilesDrop={onDrop}
        loaderMessage="Processing rules..."
        isProcessing={processingDataToImport}
        title="Drag and drop your rules JSON file."
      />
    );
  };

  const RenderConflictingRules = () => {
    if (conflictingRecords.length !== 0) {
      return (
        <>
          <List
            size="small"
            dataSource={conflictingRecords.slice(0, 5)}
            renderItem={(item) => <div style={{ marginLeft: "3.7rem", textAlign: "left" }}>{item.name}</div>}
          />
          {conflictingRecords.length > 5 ? (
            <h4>+ {conflictingRecords.length - 5} more rules are in conflict. Select an option to continue?</h4>
          ) : (
            <h4 style={{ marginTop: "2rem" }}>Above rules are in conflict. Select an option to continue?</h4>
          )}
        </>
      );
    }
    return null;
  };

  const renderImportConfirmation = () => {
    return (rulesToImportCount && rulesToImportCount > 0) || (groupsToImportCount && groupsToImportCount > 0) ? (
      <Col lg="12" md="12" xl="12" sm="12" xs="12" className="text-center" style={{ textAlign: "center" }}>
        <h1 className="display-2">
          <BsFileEarmarkCheck className="success" />
        </h1>
        <h4>
          Successfully parsed{" "}
          {rulesToImportCount > 0 && rulesToImportCount - conflictingRecords.length > 0
            ? `${rulesToImportCount - (conflictingRecords.length || 0)} rules`
            : null}
          {groupsToImportCount > 0 ? ", " + groupsToImportCount + " groups" : null}{" "}
          {conflictingRecords.length > 0 ? "and " + conflictingRecords.length + " conflicting rules." : null}
        </h4>
        <RenderConflictingRules />
      </Col>
    ) : (
      renderWarningMessage()
    );
  };

  const doImportRules = useCallback(
    (natureOfImport) => {
      setIsImporting(true);
      addRulesAndGroupsToStorage(appMode, dataToImport)
        .then(async () => {
          dispatch(
            globalActions.updateRefreshPendingStatus({
              type: "rules",
              newValue: !isRulesListRefreshPending,
            })
          );
          toggleModal();
        })
        .then(() => {
          toast.info(`Successfully imported rules`);
          trackRQLastActivity("rules_imported");
          trackRulesImportCompleted({
            count: rulesToImportCount,
            nature_of_import: natureOfImport,
            conflicting_rules_count: conflictingRecords?.length || 0,
          });
        })
        .catch((e) => {
          trackRulesImportFailed("unsuccessful_save");
        })
        .finally(() => setIsImporting(false));
    },
    [appMode, dataToImport, dispatch, isRulesListRefreshPending, rulesToImportCount, toggleModal, conflictingRecords]
  );

  const renderImportRulesBtn = () => {
    if (
      dataToImport &&
      processingDataToImport &&
      rulesToImportCount &&
      rulesToImportCount > 0 &&
      conflictingRecords.length !== 0
    ) {
      return (
        <Row className="rq-modal-footer">
          <Space className="ml-auto">
            <Button
              color="primary"
              data-dismiss="modal"
              type="button"
              onClick={() => {
                handleRulesAndGroupsImport(RULE_IMPORT_TYPE.OVERWRITE);
              }}
            >
              Overwrite Conflicting Rules
            </Button>
            <Button
              color="primary"
              data-dismiss="modal"
              type="button"
              onClick={() => {
                handleRulesAndGroupsImport(RULE_IMPORT_TYPE.DUPLICATE);
              }}
            >
              Duplicate Conflicting Rules
            </Button>
          </Space>
        </Row>
      );
    }
    return dataToImport &&
      processingDataToImport &&
      rulesToImportCount &&
      rulesToImportCount > 0 &&
      conflictingRecords.length === 0 ? (
      <Row className="rq-modal-footer">
        <Button
          type="primary"
          className="ml-auto"
          data-dismiss="modal"
          loading={isImporting}
          onClick={() => handleRulesAndGroupsImport(RULE_IMPORT_TYPE.NORMAL)}
        >
          Import
        </Button>
      </Row>
    ) : null;
  };

  const handleRulesAndGroupsImport = useCallback(
    (importType) => {
      if (isImportLimitReached && isUpgradePopoverEnabled && isBackgateRestrictionEnabled) {
        toast.error(
          "The rules cannot be imported due to exceeding free plan limits. To proceed, consider upgrading your plan.",
          4
        );
        trackUpgradeToastViewed(rulesToImportCount, "import_rules_modal");
        return;
      }

      if (importType === RULE_IMPORT_TYPE.DUPLICATE) {
        processDataToImport(dataToImport, user, allRules, false);
      }
      doImportRules(importType);
    },

    [
      isImportLimitReached,
      allRules,
      dataToImport,
      doImportRules,
      user,
      rulesToImportCount,
      isUpgradePopoverEnabled,
      isBackgateRestrictionEnabled,
    ]
  );

  const renderWarningMessage = () => {
    return (
      <Col lg="12" md="12" xl="12" sm="12" xs="12" className="text-center">
        <h4>
          <AiOutlineWarning /> Could not find valid data in this file. Please try another
        </h4>
      </Col>
    );
  };

  useEffect(() => {
    if (dataToImport) {
      dataToImport.forEach((data) => {
        const duplicateDataIndex = allRules.findIndex((rule) => {
          return rule.id === data.id;
        });
        if (duplicateDataIndex !== -1) {
          const duplicateData = allRules[duplicateDataIndex];
          setConflictingRecords((prev) => {
            if (prev.findIndex((rule) => rule.id === duplicateData.id) === -1) {
              return [...prev, { id: duplicateData.id, name: duplicateData.name }];
            } else return [...prev];
          });
        }
      });
    }
  }, [allRules, dataToImport]);

  useEffect(() => {
    if (state?.modal) {
      switch (state?.modal) {
        case ImporterType.CHARLES:
          setIsImportFromCharlesModalOpen(true);
          break;
        case ImporterType.MOD_HEADER:
          setIsImportFromModheaderModalOpen(true);
          break;
        case ImporterType.RESOURCE_OVERRIDE:
          setIsImportFromResourceOverrideModalOpen(true);
          break;
        case ImporterType.HEADER_EDITOR:
          setIsImportFromHeaderEditorModalOpen(true);
          break;
        default:
          break;
      }
    }
  }, [state?.modal]);

  return (
    <>
      <Modal open={isOpen} onCancel={toggleModal} width={550} className="custom-rq-modal" footer={null}>
        {isImportFromCharlesModalOpen ? (
          <ImportFromCharles
            isBackButtonVisible={true}
            onBackButtonClick={() => setIsImportFromCharlesModalOpen(false)}
            callback={toggleModal}
          />
        ) : isImportFromModheaderModalOpen ? (
          <ImportFromModheader
            isBackButtonVisible={true}
            onBackButtonClick={() => setIsImportFromModheaderModalOpen(false)}
            callback={toggleModal}
          />
        ) : isImportFromResourceOverrideModalOpen ? (
          <ImportFromResourceOverride
            isBackButtonVisible={true}
            onBackButtonClick={() => setIsImportFromResourceOverrideModalOpen(false)}
            callback={toggleModal}
          />
        ) : isImportFromHeaderEditorModalOpen ? (
          <HeaderEditorImporter />
        ) : (
          <>
            <div className="rule-importer-content">
              <Row align="middle" justify="space-between" className="rules-importer-heading">
                Import Rules
              </Row>
              {dataToImport ? renderImportConfirmation() : renderFilePicker()}
              {isCharlesImportFeatureFlagOn ? (
                <div className="rules-importer-footer">
                  <div>Or import from other apps:</div>
                  <RQButton
                    type="link"
                    size="small"
                    onClick={() => {
                      setIsImportFromCharlesModalOpen(true);
                      trackCharlesSettingsImportStarted(SOURCE.UPLOAD_RULES);
                    }}
                  >
                    <CharlesIcon />
                    &nbsp; Import from Charles
                  </RQButton>
                  <RQButton
                    type="link"
                    size="small"
                    onClick={() => {
                      setIsImportFromModheaderModalOpen(true);
                      // trackCharlesSettingsImportStarted(SOURCE.UPLOAD_RULES);
                    }}
                  >
                    <ModheaderIcon />
                    &nbsp; Import from ModHeader
                  </RQButton>
                  <RQButton
                    type="link"
                    size="small"
                    onClick={() => {
                      setIsImportFromResourceOverrideModalOpen(true);
                      trackResourceOverrideSettingsImportStarted(SOURCE.UPLOAD_RULES);
                    }}
                  >
                    <img src={ResourceOverrideIcon} width={11} height={10} alt="Resource override icon" />
                    &nbsp; Import from Resource Override
                  </RQButton>
                  <RQButton
                    type="link"
                    size="small"
                    onClick={() => {
                      setIsImportFromHeaderEditorModalOpen(true);
                      trackHeaderEditorSettingsImportStarted(SOURCE.UPLOAD_RULES);
                    }}
                  >
                    <img
                      src="/assets/img/brandLogos/header-editor-custom-icon.png"
                      width={11}
                      height={10}
                      alt="Header Editor icon"
                    />
                    &nbsp; Import from Header Editor
                  </RQButton>
                </div>
              ) : null}
            </div>
          </>
        )}
        {renderImportRulesBtn()}
      </Modal>
    </>
  );
};
