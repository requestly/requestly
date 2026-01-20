import React from "react";
import { Row, Col, Button } from "antd";
import { RQModal } from "lib/design-system/components";
import "./InviteErrorModal.css";

const InviteErrorModal = ({ isOpen, handleModalClose, errors }) => {
  return (
    <RQModal centered open={isOpen} onCancel={handleModalClose}>
      <div className="rq-modal-content">
        <div>
          <img alt="oops" className="inivite-modal-oops-icon" src="/assets/media/settings/oops.svg" />
        </div>
        <div className="header invite-member-modal-header">Oops!</div>

        <div className="text-gray text-sm no-account-message">
          Some emails can't be invited due to the following reasons:
          <br />
          <br />
        </div>

        {errors?.map((error) => {
          return (
            <p className="text-gray overflow-hidden">
              <span className="text-bold">{error?.email}</span> ({error.errorCode || error.message})
            </p>
          );
        })}
      </div>

      <Row align="right" className="rq-modal-footer">
        <Col className="ml-auto">
          <Button data-dismiss="modal" onClick={handleModalClose}>
            Ok
          </Button>
        </Col>
      </Row>
    </RQModal>
  );
};

export default InviteErrorModal;
