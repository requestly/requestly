import React, { useState, useCallback, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Col } from "antd";
import { Modal } from "antd";
//ICONS
import { AiOutlineWarning } from "react-icons/ai";
import { FaDownload } from "react-icons/fa";
//ACTIONS
import { prepareContentToExport, initiateDownload } from "./actions";
import SpinnerColumn from "../../../misc/SpinnerColumn";
import { getAppMode, getGroupwiseRulesToPopulate } from "store/selectors";
import { actions } from "store";

const ExportRulesModal = (props) => {
  const { toggle: toggleExportRulesModal, isOpen, rulesToExport } = props;

  //Global State
  const dispatch = useDispatch();
  const groupwiseRulesToPopulate = useSelector(getGroupwiseRulesToPopulate);
  const appMode = useSelector(getAppMode);

  //Component State
  const [dataToExport, setDataToExport] = useState(null);

  const initDownload = useCallback(
    () => initiateDownload(dataToExport.fileContent, dataToExport.rulesCount),
    [dataToExport]
  );

  useEffect(() => {
    if (isOpen && dataToExport?.rulesCount >= 1) {
      initDownload();
    }
  }, [isOpen, dataToExport, initDownload]);

  const renderLoader = () => (
    <SpinnerColumn message="Preparing data to export" />
  );

  const renderDownloadSummary = () => {
    if (dataToExport.rulesCount === 0) {
      return renderWarningMessage();
    } else {
      return (
        <Col lg="12" md="12" xl="12" sm="12" xs="12" className="text-center">
          <h1 className="display-2 cursor-pointer" onClick={initDownload}>
            <FaDownload />
          </h1>
          <br />
          <b>
            Your download will begin in a moment. If it doesn't,{" "}
            <span
              onClick={initDownload}
              className="cursor-pointer text-primary"
            >
              click here
            </span>
            .
          </b>
          <br />
          <p>
            <b>Total Rules Exported: </b>
            {dataToExport.rulesCount} <br />
            {/* <b>Total Groups Exported: </b>
            {dataToExport.groupsCount} */}
          </p>
        </Col>
      );
    }
  };

  const renderWarningMessage = () => (
    <Col lg="12" md="12" xl="12" sm="12" xs="12" className="text-center">
      {/* <Jumbotron style={{ background: "transparent" }} className="text-center"> */}
      <h1 className="display-2">
        <AiOutlineWarning />
      </h1>
      <h5>Please select a rule before exporting</h5>
      {/* </Jumbotron> */}
    </Col>
  );

  useEffect(() => {
    if (!dataToExport) {
      prepareContentToExport(
        appMode,
        rulesToExport,
        groupwiseRulesToPopulate
      ).then((result) => {
        setDataToExport(result);
        dispatch(actions.clearSelectedRules());
      });
    }
  }, [
    rulesToExport,
    groupwiseRulesToPopulate,
    dataToExport,
    appMode,
    dispatch,
  ]);

  return (
    <Modal
      className="modal-dialog-centered "
      visible={isOpen}
      onCancel={toggleExportRulesModal}
      footer={null}
      style={{ textAlign: "center" }}
      title="Export Rules Wizard"
    >
      <div className="modal-body ">
        {dataToExport ? renderDownloadSummary() : renderLoader()}
      </div>
    </Modal>
  );
};

export default ExportRulesModal;
