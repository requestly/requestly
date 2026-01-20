import React, { useState, useEffect, useCallback } from "react";
import { useDispatch } from "react-redux";
import { Button, Col, Row, Space } from "antd";
import { toast } from "utils/Toast.js";
import { Modal } from "antd";
import isEmpty from "is-empty";
//ICONS
import { FaTrash } from "@react-icons/all-files/fa/FaTrash";
import { AiOutlineWarning } from "@react-icons/all-files/ai/AiOutlineWarning";
//ACTIONS
import { deleteSharedList } from "backend/sharedList/deleteSharedList";
import { LoadingOutlined } from "@ant-design/icons";
import { globalActions } from "store/slices/global/slice";

const DeleteSharedListModal = ({ sharedListIdsToDelete, userId, isOpen, toggle }) => {
  //Global State
  const dispatch = useDispatch();

  //Component State
  const [deletionSuccessful, setDeletionSuccessful] = useState(false);
  const [deletionConfirmed, setDeletionConfirmed] = useState(false);

  const renderLoader = () => (
    <Row>
      <Col span={24} align="center">
        <Space>
          <LoadingOutlined />
        </Space>
      </Col>
    </Row>
  );

  const renderModalFooter = (options) => {
    const { showConfirmationBtn } = options;
    return (
      <Row>
        <Col span={24} align="center">
          <Space>
            <Button color="secondary" data-dismiss="modal" type="button" onClick={toggle}>
              Close
            </Button>
            {showConfirmationBtn ? (
              <Button type="primary" data-dismiss="modal" onClick={() => setDeletionConfirmed(true)}>
                Yes
              </Button>
            ) : null}
          </Space>
        </Col>
      </Row>
    );
  };

  const renderConfirmation = () => {
    if (isEmpty(sharedListIdsToDelete)) {
      return renderWarningMessage();
    } else {
      return (
        <React.Fragment>
          <Row>
            <Col span={24} align="center">
              <h1 className="display-2">
                <FaTrash />
              </h1>
              <b>Are you sure to delete the selected lists?</b>
              <p>
                <b>Total Lists Selected: </b>
                {sharedListIdsToDelete.length} <br />
              </p>
            </Col>
          </Row>
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
            <b>Successfully deleted lists</b>
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
      <Row>
        <Col align="center" span={24}>
          <h1 className="display-2">
            <AiOutlineWarning />
          </h1>
          <h5>Please select a list before deleting</h5>
        </Col>
      </Row>
      <br />
      {renderModalFooter({
        showConfirmationBtn: false,
      })}
    </React.Fragment>
  );

  const doDeleteSharedLists = (cb) => {
    const allPromises = [];
    sharedListIdsToDelete.forEach((sharedListId) => {
      allPromises.push(deleteSharedList(sharedListId, dispatch));
    });
    return Promise.all(allPromises);
  };

  const stableDoDeleteSharedLists = useCallback(doDeleteSharedLists, [dispatch, sharedListIdsToDelete]);

  const updateCurrentlySelectedLists = (dispatch, newValue) => {
    dispatch(globalActions.updateSelectedSharedLists(newValue));
  };

  useEffect(() => {
    if (deletionConfirmed && !deletionSuccessful) {
      stableDoDeleteSharedLists().then(() => {
        //Mark flag to prevent further detection
        setDeletionSuccessful(true);
        toast.success("Shared list deleted successfully");
        //Unselect all lists
        updateCurrentlySelectedLists(dispatch, {});
        //Mark flag to Refresh Lists on index page
        dispatch(globalActions.updateRefreshPendingStatus({ type: "sharedLists" }));
        //Close the modal -> Unmount this component
        toggle();
      });
    }
  }, [deletionConfirmed, deletionSuccessful, stableDoDeleteSharedLists, toggle, dispatch]);

  return (
    <Modal className="modal-dialog-centered " visible={isOpen} onCancel={toggle} footer={null} title="Delete List">
      {!deletionConfirmed ? renderConfirmation() : deletionSuccessful ? renderDeleteSummary() : renderLoader()}
    </Modal>
  );
};

export default DeleteSharedListModal;
