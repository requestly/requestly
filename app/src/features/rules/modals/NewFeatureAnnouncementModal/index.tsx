import React from "react";
import { Modal } from "antd";
import featureGif from "./drag-and-drop-rules.gif";
import "./NewFeatureAnnouncementModal.scss";

interface NewFeatureAnnouncementModalProps {
  open: boolean;
  onClose: () => void;
}

export const NewFeatureAnnouncementModal: React.FC<NewFeatureAnnouncementModalProps> = ({ open, onClose }) => {
  return (
    <Modal
      className="rq-modal modal-dialog-centered"
      footer={null}
      open={open}
      onCancel={onClose}
      wrapClassName="feature-announcement-modal"
      width={650}
    >
      <div className="feature-announcement-modal-body">
        <div className="new-tag">NEW</div>
        <div className="title-container">
          <div className="title">Drag and Drop rules within groups</div>
        </div>
        <img className="feature-image" src={featureGif} alt="feature-gif" />
      </div>
    </Modal>
  );
};
