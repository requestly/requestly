import React, { useEffect, useMemo } from "react";
import { Button, Collapse, CollapseProps } from "antd";
import { RQModal } from "lib/design-system/components";
import { TfiClose } from "@react-icons/all-files/tfi/TfiClose";
import { BsPin } from "@react-icons/all-files/bs/BsPin";
import { BiSliderAlt } from "@react-icons/all-files/bi/BiSliderAlt";
import { PiCaretDownBold } from "@react-icons/all-files/pi/PiCaretDownBold";
import { FiVideo } from "@react-icons/all-files/fi/FiVideo";
import { FaToggleOff } from "@react-icons/all-files/fa6/FaToggleOff";
import BlueUnderline from "./assets/blue-underline.svg?react";
import {
  trackPinExtensionPopupClosed,
  trackPinExtensionPopupExpanded,
  trackPinExtensionPopupViewed,
  PinExtensionCollapseExpandedAction,
} from "modules/analytics/events/common/onboarding/pinExtensionPopup";
import "./PinExtensionPopup.css";

interface Props {
  isOpen: boolean;
  onCancel: () => void;
}

export const PinExtensionPopup: React.FC<Props> = ({ isOpen, onCancel }) => {
  useEffect(() => {
    trackPinExtensionPopupViewed();
  }, []);

  const handleCloseClick = () => {
    onCancel();
    trackPinExtensionPopupClosed("close");
  };

  const handleAlreadyPinnedClick = () => {
    onCancel();
    trackPinExtensionPopupClosed("already_pinned");
  };

  const collapsePanelItems: {
    header: React.ReactNode;
    analyticEventAction: PinExtensionCollapseExpandedAction;
    image: { alt: string; src: any };
  }[] = useMemo(
    () => [
      {
        analyticEventAction: "activate_deactivate",
        header: (
          <div>
            <BiSliderAlt /> <span className="header-text">Activate/Deactivate rules</span>
          </div>
        ),
        image: {
          alt: "Activate/Deactivate rules",
          src: "/assets/media/components/activate-deactivate-rule.gif",
        },
      },
      {
        analyticEventAction: "what_rules_executed",
        header: (
          <div>
            <BiSliderAlt style={{ transform: "rotate(90deg)" }} />{" "}
            <span className="header-text">Know which rules executed on a web page</span>
          </div>
        ),
        image: {
          alt: "Executed rules",
          src: "/assets/media/components/executed-rules.gif",
        },
      },
      {
        analyticEventAction: "record_and_replay",
        header: (
          <div>
            <FiVideo /> <span className="header-text">Record and replay browser activity</span>
          </div>
        ),
        image: {
          alt: "Record and replay session",
          src: "/assets/media/components/record-browser-activity.gif",
        },
      },
      {
        analyticEventAction: "pause_extension",
        header: (
          <div>
            <FaToggleOff /> <span className="header-text">Pause Requestly when not in use</span>
          </div>
        ),
        image: {
          alt: "Pause requestly extension",
          src: "/assets/media/components/pause-rq.gif",
        },
      },
    ],
    []
  );

  const handleExapandedPanelChange = (key: Parameters<CollapseProps["onChange"]>[0]) => {
    if (key) {
      const action = collapsePanelItems[Number(key)].analyticEventAction;
      trackPinExtensionPopupExpanded(action);
    }
  };

  return (
    <RQModal
      width={373}
      open={isOpen}
      closable={false}
      closeIcon={null}
      maskClosable={false}
      className="pin-extension-popup-container"
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
          fetchPriority="high"
          alt="Pin extension"
          className="pin-extension-gif"
          src={"/assets/media/components/pin-ext-guide.gif"}
        />

        <div>
          <div className="subtitle">Access Requestly features quickly from the extension</div>
          <Collapse
            ghost
            accordion
            expandIconPosition="end"
            onChange={handleExapandedPanelChange}
            expandIcon={({ isActive }) => (
              <PiCaretDownBold className={`header-down-caret ${isActive ? "rotate" : ""}`} />
            )}
          >
            {collapsePanelItems.map(({ header, image }, index) => (
              <Collapse.Panel header={header} key={index}>
                <img width={315} height={169} className="feature-gif" alt={image.alt} src={image.src} />
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
