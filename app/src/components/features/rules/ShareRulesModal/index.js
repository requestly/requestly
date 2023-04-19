import React, { useEffect, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Button, Col } from "reactstrap";
import { Modal } from "antd";
//SUB COMPONENTS
import SpinnerColumn from "../../../misc/SpinnerColumn";
//UTILS
import { getIsRefreshRulesPending } from "../../../../store/selectors";
//ICONS
import { AiOutlineWarning } from "react-icons/ai";
import { FaTrash } from "react-icons/fa";
//ACTIONS
import { deleteRulesFromStorage } from "./actions";
import { actions } from "../../../../store";
import { unselectAllRules } from "../actions";

const ShareRulesModal = (props) => {
  const { toggle, isOpen, rulesToShare } = props;
  const rulesArray = Object.values(rulesToShare);

  //Global State
  const dispatch = useDispatch();
  const isRulesListRefreshPending = useSelector(getIsRefreshRulesPending);

  //Component State
  const [deleteRulesConfirmed, setDeleteRulesConfirmed] = useState(false);
  const [deleteRulesCompleted, setDeleteRulesCompleted] = useState(false);

  //To ignore rules that were earlier selected but then unselected
  const rulesToShareArray = rulesArray.filter((selectedRule) => selectedRule.isSelected);

  const renderLoader = () => <SpinnerColumn message="Deleting Rules" />;

  const renderModalFooter = (options) => {
    const { showConfirmationBtn } = options;
    return (
      <div
        className="modal-footer "
        style={{
          //backgroundColor: "white",
          position: "sticky",
          bottom: "0",
          zIndex: "100",
        }}
      >
        {showConfirmationBtn ? (
          <Button color="primary" data-dismiss="modal" type="button" onClick={() => setDeleteRulesConfirmed(true)}>
            Yes
          </Button>
        ) : null}
        <Button color="secondary" data-dismiss="modal" type="button" onClick={toggle}>
          Close
        </Button>
      </div>
    );
  };

  const renderConfirmation = () => {
    if (rulesToShareArray.length === 0) {
      return renderWarningMessage();
    } else {
      return (
        <React.Fragment>
          <div className="modal-body ">
            <Col lg="12" md="12" xl="12" sm="12" xs="12" className="text-center">
              <h1 className="display-2">
                <FaTrash />
              </h1>
              <b>Are you sure to delete the selected rules?</b>
              <p>
                <b>Total Rules Selected: </b>
                {rulesToShareArray.length} <br />
              </p>
            </Col>
          </div>
          {renderModalFooter({
            showConfirmationBtn: true,
          })}
        </React.Fragment>
      );
    }
  };

  const renderDeleteSummary = () => {
    return (
      <React.Fragment>
        <div className="modal-body ">
          <Col lg="12" md="12" xl="12" sm="12" xs="12" className="text-center">
            <b>Successfully deleted rules</b>
          </Col>
        </div>
        {renderModalFooter({
          showConfirmationBtn: false,
        })}
      </React.Fragment>
    );
  };

  const renderWarningMessage = () => (
    <React.Fragment>
      <div className="modal-body ">
        <Col lg="12" md="12" xl="12" sm="12" xs="12" className="text-center">
          <h1 className="display-2">
            <AiOutlineWarning />
          </h1>
          <h5>Please select a rule before deleting</h5>
        </Col>
      </div>

      {renderModalFooter({
        showConfirmationBtn: false,
      })}
    </React.Fragment>
  );

  const postDeletionSteps = () => {
    setDeleteRulesCompleted(true);
    //Refresh List
    dispatch(
      actions.updateRefreshPendingStatus({
        type: "rules",
        newValue: !isRulesListRefreshPending,
      })
    );
    //Close Modal
    toggle();
    //Unselect all rules
    unselectAllRules(dispatch);
  };
  const stablePostDeletionSteps = useCallback(postDeletionSteps, [dispatch, isRulesListRefreshPending, toggle]);

  useEffect(() => {
    if (deleteRulesConfirmed && !deleteRulesCompleted) {
      deleteRulesFromStorage(rulesToShareArray, stablePostDeletionSteps).then(() => {});
    }
  }, [deleteRulesConfirmed, deleteRulesCompleted, rulesToShareArray, stablePostDeletionSteps]);

  return (
    <Modal className="modal-dialog-centered " visible={isOpen} onCancel={toggle} footer={null}>
      <div className="modal-header ">
        <h5 className="modal-title" id="exampleModalLabel">
          Delete Rules
        </h5>
        <button aria-label="Close" className="close" data-dismiss="modal" type="button" onClick={toggle}>
          <span aria-hidden={true}>×</span>
        </button>
      </div>

      {!deleteRulesConfirmed ? renderConfirmation() : deleteRulesCompleted ? renderDeleteSummary() : renderLoader()}
    </Modal>
  );
};

export default ShareRulesModal;
