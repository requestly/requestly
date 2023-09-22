import React from "react";
import { Button, Collapse } from "antd";
import { RQModal } from "lib/design-system/components";
import { IoCloseOutline } from "@react-icons/all-files/io5/IoCloseOutline";
import { BsPin } from "@react-icons/all-files/bs/BsPin";
import { ReactComponent as BlueUnderline } from "./assets/blue-underline.svg";
import "./PinExtensionPopup.css";

interface Props {
  isOpen: boolean;
  onCancel: () => void;
}

export const PinExtensionPopup: React.FC<Props> = ({ isOpen, onCancel }) => {
  const handleCloseClick = () => {
    onCancel();
    // send analytics
  };

  const handleAlreadyPinnedClick = () => {
    onCancel();
    // send analytics
  };

  return (
    <RQModal
      open={isOpen}
      closable={false}
      maskClosable={false}
      width={373}
      style={{
        margin: "0",
        top: "16px",
        left: "100%",
        transform: "translateX(calc(-100% - 16px))",
      }}
      wrapClassName="pin-extension-popup-container"
    >
      <div className="pin-extension-popup">
        <div className="title">
          <span>
            Pin <BlueUnderline />
          </span>
          Requestly to your browser 📌
        </div>

        <img
          width={338}
          height={196}
          alt="Pin extension"
          className="pin-extension-gif"
          src="https://dummyimage.com/600x400/000/fff"
        />

        <div>
          <div className="subtitle">Access Requestly features quickly from the extension</div>
          <Collapse ghost accordion>
            <Collapse.Panel header="Activate/Deactivate rules" key="0">
              <img
                width={338}
                height={196}
                className="feature-gif"
                alt="Activate/Deactivate rules"
                src="https://dummyimage.com/600x400/000/fff"
              />
            </Collapse.Panel>
            <Collapse.Panel header="Know which rules executed on a web page" key="1">
              <img
                width={338}
                height={196}
                className="feature-gif"
                alt="Executed rules"
                src="https://dummyimage.com/600x400/000/fff"
              />
            </Collapse.Panel>
            <Collapse.Panel header="Record and replay browser activity" key="2">
              <img
                width={338}
                height={196}
                className="feature-gif"
                alt="Record and replay session"
                src="https://dummyimage.com/600x400/000/fff"
              />
            </Collapse.Panel>
            <Collapse.Panel header="Pause Requestly when not in use" key="3">
              <img
                width={338}
                height={196}
                className="feature-gif"
                alt="Pause requestly extension"
                src="https://dummyimage.com/600x400/000/fff"
              />
            </Collapse.Panel>
          </Collapse>
        </div>

        <div className="action-btns">
          <Button type="link" onClick={handleCloseClick}>
            <IoCloseOutline /> Close
          </Button>
          <Button type="link" onClick={handleAlreadyPinnedClick}>
            <BsPin /> I've already pinned
          </Button>
        </div>
      </div>
    </RQModal>
  );
};
