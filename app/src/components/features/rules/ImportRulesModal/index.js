import React, { useState, useCallback, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Button, Col, List, Row, Space } from "antd";
import { Modal } from "antd";
import { useDropzone } from "react-dropzone";
import { toast } from "utils/Toast.js";
//ICONS
import { AiOutlineWarning } from "react-icons/ai";
import { BsFileEarmarkCheck } from "react-icons/bs";
import { FiUpload } from "react-icons/fi";
//UTILS
import { getIsRefreshRulesPending, getUserAuthDetails, getAppMode, getAllRules } from "../../../../store/selectors";
import { trackRQLastActivity } from "../../../../utils/AnalyticsUtils";
//ACTIONS
import { actions } from "../../../../store";
import { processDataToImport, addRulesAndGroupsToStorage } from "./actions";
import SpinnerColumn from "../../../misc/SpinnerColumn";
import { migrateHeaderRulesToV2 } from "../../../../utils/rules/migrateHeaderRulesToV2";
import { isFeatureCompatible } from "../../../../utils/CompatibilityUtils";
import FEATURES from "../../../../config/constants/sub/features";
import { AUTH } from "modules/analytics/events/common/constants";
import {
  trackRulesJsonParsed,
  trackRulesImportFailed,
  trackRulesImportCompleted,
  trackCharlesSettingsImportStarted,
} from "modules/analytics/events/features/rules";
import Logger from "lib/logger";
import { ImportFromCharlesModal } from "../ImportFromCharlesModal";
import { LeftOutlined } from "@ant-design/icons";

const ImportRulesModal = (props) => {
  const { toggle: toggleModal, isOpen } = props;

  //Global State
  const dispatch = useDispatch();
  const allRules = useSelector(getAllRules);
  const isRulesListRefreshPending = useSelector(getIsRefreshRulesPending);
  const user = useSelector(getUserAuthDetails);
  const appMode = useSelector(getAppMode);

  //Component State
  const [dataToImport, setDataToImport] = useState(false);
  const [processingDataToImport, setProcessingDataToImport] = useState(false);
  const [rulesToImportCount, setRulesToImportCount] = useState(false);
  const [groupsToImportCount, setGroupsToImportCount] = useState(false);
  const [conflictingRecords, setConflictingRecords] = useState([]);
  const [showImportOptions, setShowImportOptions] = useState(true);
  const [isImportFromCharlesModalOpen, setIsImportFromCharlesModalOpen] = useState(false);

  const ImportRulesDropzone = () => {
    const onDrop = useCallback(async (acceptedFiles) => {
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
    }, []);
    const { getRootProps, getInputProps } = useDropzone({ onDrop });

    return (
      <div {...getRootProps()}>
        <input {...getInputProps()} />
        <center>
          <h1 className="display-2">
            <FiUpload />
          </h1>
          <p>Drag and drop requestly export file, or click to select</p>
        </center>
      </div>
    );
  };

  const renderFilePicker = () => {
    return (
      <React.Fragment>
        <ImportRulesDropzone />
      </React.Fragment>
    );
  };

  const renderLoader = () => <SpinnerColumn message="Processing data" />;

  const RenderConflictingRules = () => {
    if (conflictingRecords.length !== 0) {
      return (
        <>
          <List
            size="small"
            dataSource={conflictingRecords.slice(0, 5)}
            renderItem={(item) => (
              // <List.Item>
              <h5 style={{ textAlign: "left" }}>{item.name}</h5>
              // </List.Item>
            )}
          />
          {conflictingRecords.length > 5 ? (
            <h4>+ {conflictingRecords.length - 5} more rules are in conflict. Select an option to continue?</h4>
          ) : (
            <h4>Above rules are in conflict. Select an option to continue?</h4>
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
          <BsFileEarmarkCheck />
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

  const doImportRules = (natureOfImport) => {
    const migratedDataToImport = isFeatureCompatible(FEATURES.HEADERS_V2_MIGRATION)
      ? migrateHeaderRulesToV2(dataToImport)
      : dataToImport;

    addRulesAndGroupsToStorage(appMode, migratedDataToImport)
      .then(async () => {
        dispatch(
          actions.updateRefreshPendingStatus({
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
      });
  };

  const renderImportRulesBtn = () => {
    if (
      dataToImport &&
      processingDataToImport &&
      rulesToImportCount &&
      rulesToImportCount > 0 &&
      conflictingRecords.length !== 0
    ) {
      return (
        <Space>
          <Button
            color="primary"
            data-dismiss="modal"
            type="button"
            onClick={() => {
              // by default overwrite is true so we dont need to process the importData again
              doImportRules("overwrite");
            }}
          >
            Overwrite Conflicting Rules
          </Button>
          <Button
            color="primary"
            data-dismiss="modal"
            type="button"
            onClick={() => {
              processDataToImport(dataToImport, user, allRules, false);
              doImportRules("duplicate");
            }}
          >
            Duplicate Conflicting Rules
          </Button>
        </Space>
      );
    }
    return dataToImport &&
      processingDataToImport &&
      rulesToImportCount &&
      rulesToImportCount > 0 &&
      conflictingRecords.length === 0 ? (
      <Button color="primary" data-dismiss="modal" type="button" onClick={() => doImportRules("normal")}>
        Import
      </Button>
    ) : null;
  };

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

  const toggleImportFromCharlesModal = useCallback(() => {
    if (isImportFromCharlesModalOpen) {
      toggleModal();
    } else {
      trackCharlesSettingsImportStarted(AUTH.SOURCE.RULES_LIST);
    }

    setIsImportFromCharlesModalOpen((prev) => !prev);
  }, [toggleModal, isImportFromCharlesModalOpen]);

  const handleRegularRuleImportClick = () => {
    setShowImportOptions(false);
  };

  return (
    <>
      {isImportFromCharlesModalOpen ? (
        <ImportFromCharlesModal
          isOpen={isImportFromCharlesModalOpen}
          toggle={toggleImportFromCharlesModal}
          analyticEventSource={AUTH.SOURCE.RULES_LIST}
        />
      ) : null}

      <Modal
        style={{ display: isImportFromCharlesModalOpen ? "none" : "block" }}
        className="modal-dialog-centered"
        open={isOpen}
        onCancel={toggleModal}
        footer={null}
        title={
          <Row align="middle">
            <Button
              size="small"
              style={{ marginRight: "6px" }}
              onClick={() => setShowImportOptions(true)}
              icon={<LeftOutlined style={{ fontSize: "14px" }} />}
            />

            {showImportOptions ? <span>Select the type of rules you want to import</span> : <span>Import Rules</span>}
          </Row>
        }
      >
        {showImportOptions ? (
          <>
            <Row align="middle" justify="center">
              <Button type="default" onClick={handleRegularRuleImportClick}>
                Import Requestly rules (JSON file)
              </Button>
            </Row>
            <center style={{ margin: "8px 0" }} className="text-gray">
              or
            </center>
            <Row align="middle" justify="center">
              <Button type="default" onClick={toggleImportFromCharlesModal}>
                Import Charles Proxy settings (XML file)
              </Button>
            </Row>
          </>
        ) : (
          <>
            <div className="modal-body">
              {dataToImport ? renderImportConfirmation() : processingDataToImport ? renderLoader() : renderFilePicker()}
            </div>
            <br />
            <div
              className="modal-footer"
              style={{
                textAlign: "center",
              }}
            >
              {renderImportRulesBtn()}
            </div>
          </>
        )}
      </Modal>
    </>
  );
};

export default ImportRulesModal;
