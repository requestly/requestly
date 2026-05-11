import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { m } from "framer-motion";
import { IoMdClose } from "@react-icons/all-files/io/IoMdClose";
import { trackGetHumanSupportClicked } from "./analytics";
import { RequestBotModel } from "./types";
import { MODELS } from "./constants";
import { AIConsentModal } from "features/ai";
import { getIsOptedforAIFeatures } from "store/slices/global/user/selectors";
import "./requestBot.css";

interface RequestBotProps {
  isOpen: boolean;
  onClose: () => void;
  modelType?: RequestBotModel;
}

const REQUEST_BOT_OPEN_RIGHT_OFFSET = 16;
const REQUEST_BOT_CLOSED_RIGHT_OFFSET = -450;

export const RequestBot: React.FC<RequestBotProps> = ({ isOpen, onClose, modelType = "app" }) => {
  const isOptedforAIFeatures = useSelector(getIsOptedforAIFeatures);
  const [userHasConsented, setUserHasConsented] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setUserHasConsented(false);
    }
  }, [isOpen]);

  const showConsentModal = isOpen && !isOptedforAIFeatures && !userHasConsented;
  const shouldShowBot = isOpen && (isOptedforAIFeatures || userHasConsented);

  const handleAIConsentEnable = () => {
    setUserHasConsented(true);
  };

  const handleAIConsentDismiss = () => {
    onClose();
  };

  return (
    <>
      <m.div
        initial={{ opacity: 0, right: REQUEST_BOT_CLOSED_RIGHT_OFFSET }}
        animate={{
          opacity: shouldShowBot ? 1 : 0,
          right: shouldShowBot ? REQUEST_BOT_OPEN_RIGHT_OFFSET : REQUEST_BOT_CLOSED_RIGHT_OFFSET,
        }}
        transition={{ duration: 0.2 }}
        className="request-bot"
        style={{ pointerEvents: shouldShowBot ? "auto" : "none" }}
      >
        <IoMdClose className="request-bot-close-btn" onClick={onClose} />
        <iframe title="RequestBot" className="request-bot-iframe" src={MODELS[modelType].src} />
        <div
          className="get-human-support"
          onClick={() => {
            onClose();
            window?.$crisp?.push(["do", "chat:open"]);
            trackGetHumanSupportClicked();
          }}
        >
          Get human support
        </div>
      </m.div>
      <AIConsentModal
        isOpen={showConsentModal}
        toggle={handleAIConsentDismiss}
        onEnableCallback={handleAIConsentEnable}
        autoCloseOnEnable={false}
      />
    </>
  );
};
