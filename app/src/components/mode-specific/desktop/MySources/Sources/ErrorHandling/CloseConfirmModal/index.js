import React from "react";
import { Modal, Row, Col, Button } from "antd";

const CloseConfirmModal = (props) => {
  return (
    <Modal
      className="modal-dialog-centered "
      open={props.isOpen}
      onCancel={props.toggle}
      footer={
        <Button color="primary" type="button" onClick={props.action}>
          Continue
        </Button>
      }
    >
      <div className="modal-body one-padding-top zero-padding-bottom">
        <Row className="one-padding-bottom  my-auto">
          <Col className="my-auto">
            <p>
              This requires existing instance of browser to be closed. Please save your work and click Continue to
              relaunch it.
            </p>
          </Col>
        </Row>
      </div>
    </Modal>
  );
};

export default CloseConfirmModal;
