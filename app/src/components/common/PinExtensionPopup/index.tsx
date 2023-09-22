import React, { useEffect, useMemo } from "react";
import { Button, Collapse, CollapseProps } from "antd";
import { RQModal } from "lib/design-system/components";
import { TfiClose } from "@react-icons/all-files/tfi/TfiClose";
import { BsPin } from "@react-icons/all-files/bs/BsPin";
import { BiSliderAlt } from "@react-icons/all-files/bi/BiSliderAlt";
import { PiCaretDownBold } from "@react-icons/all-files/pi/PiCaretDownBold";
import { FiVideo } from "@react-icons/all-files/fi/FiVideo";
import { FaToggleOff } from "@react-icons/all-files/fa6/FaToggleOff";
import { ReactComponent as BlueUnderline } from "./assets/blue-underline.svg";
import pinExtensionGif from "./assets/pin-ext-guide.gif";
import activateDeactivateGif from "./assets/activate-deactivate.gif";
import executedRulesGif from "./assets/executed-rules.gif";
import recordAndReplayGif from "./assets/record-browser-activity.gif";
import pauseRequestlyGif from "./assets/pause-rq.gif";
import {
  trackPinExtensionPopupClosed,
  trackPinExtensionPopupExpanded,
  trackPinExtensionPopupViewed,
} from "modules/analytics/events/common/onboarding/pinExtensionPopup";
import "./PinExtensionPopup.css";

type PanelType = "activate_deactivate" | "what_rules_executed" | "record_and_replay" | "pause_extension";

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
    analyticEventAction: PanelType;
    image: { alt: string; src: any };
  }[] = useMemo(
    () => [
      {
        analyticEventAction: "activate_deactivate",
        header: (
          <div>
            <BiSliderAlt /> Activate/Deactivate rules
          </div>
        ),
        image: {
          alt: "Activate/Deactivate rules",
          src: activateDeactivateGif,
        },
      },
      {
        analyticEventAction: "what_rules_executed",
        header: (
          <div>
            <BiSliderAlt style={{ transform: "rotate(90deg)" }} /> Know which rules executed on a web page
          </div>
        ),
        image: {
          alt: "Executed rules",
          src: executedRulesGif,
        },
      },
      {
        analyticEventAction: "record_and_replay",
        header: (
          <div>
            <FiVideo /> Record and replay browser activity
          </div>
        ),
        image: {
          alt: "Record and replay session",
          src: recordAndReplayGif,
        },
      },
      {
        analyticEventAction: "pause_extension",
        header: (
          <div>
            <FaToggleOff /> Pause Requestly when not in use
          </div>
        ),
        image: {
          alt: "Pause requestly extension",
          src: pauseRequestlyGif,
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

        <img width={338} height={196} alt="Pin extension" className="pin-extension-gif" src={pinExtensionGif} />

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
