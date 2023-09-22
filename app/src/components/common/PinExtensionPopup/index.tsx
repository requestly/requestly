import React, { useMemo } from "react";
import { Button, Collapse } from "antd";
import { RQModal } from "lib/design-system/components";
import { TfiClose } from "@react-icons/all-files/tfi/TfiClose";
import { BsPin } from "@react-icons/all-files/bs/BsPin";
import { BiSliderAlt } from "@react-icons/all-files/bi/BiSliderAlt";
import { PiCaretDownBold } from "@react-icons/all-files/pi/PiCaretDownBold";
import { FiVideo } from "@react-icons/all-files/fi/FiVideo";
import { FaToggleOff } from "@react-icons/all-files/fa6/FaToggleOff";
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

  const collapsePanelItems = useMemo(
    () => [
      {
        header: (
          <div>
            <BiSliderAlt /> Activate/Deactivate rules
          </div>
        ),
        image: {
          alt: "Activate/Deactivate rules",
          src: "https://dummyimage.com/600x400/000/fff",
        },
      },
      {
        header: (
          <div>
            <BiSliderAlt style={{ transform: "rotate(90deg)" }} /> Know which rules executed on a web page
          </div>
        ),
        image: {
          alt: "Executed rules",
          src: "https://dummyimage.com/600x400/000/fff",
        },
      },
      {
        header: (
          <div>
            <FiVideo /> Record and replay browser activity
          </div>
        ),
        image: {
          alt: "Record and replay session",
          src: "https://dummyimage.com/600x400/000/fff",
        },
      },
      {
        header: (
          <div>
            <FaToggleOff /> Pause Requestly when not in use
          </div>
        ),
        image: {
          alt: "Pause requestly extension",
          src: "https://dummyimage.com/600x400/000/fff",
        },
      },
    ],
    []
  );

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
          <Collapse
            ghost
            accordion
            expandIconPosition="end"
            expandIcon={({ isActive }) => (
              <PiCaretDownBold className={`header-down-caret ${isActive ? "rotate" : ""}`} />
            )}
          >
            {collapsePanelItems.map(({ header, image }, index) => (
              <Collapse.Panel header={header} key={index}>
                <img width={338} height={196} className="feature-gif" alt={image.alt} src={image.src} />
              </Collapse.Panel>
            ))}
          </Collapse>
        </div>

        <div className="action-btns">
          <Button type="link" onClick={handleCloseClick}>
            <TfiClose /> Close
          </Button>
          <Button type="link" onClick={handleAlreadyPinnedClick}>
            <BsPin /> I've already pinned
          </Button>
        </div>
      </div>
    </RQModal>
  );
};
