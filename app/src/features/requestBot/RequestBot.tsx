import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useFeatureIsOn } from "@growthbook/growthbook-react";
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

export const RequestBot: React.FC<RequestBotProps> = ({ isOpen, onClose, modelType = "app" }) => {
  const isAIEnabledGlobally = useFeatureIsOn("global_ai_support");
  const isOptedforAIFeatures = useSelector(getIsOptedforAIFeatures);
  const [isAIConsentModalOpen, setIsAIConsentModalOpen] = useState(false);
  const [shouldShowBot, setShouldShowBot] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // Check if AI is enabled globally and user has consented
      if (!isAIEnabledGlobally || !isOptedforAIFeatures) {
        setIsAIConsentModalOpen(true);
        setShouldShowBot(false);
        onClose();
      } else {
        setShouldShowBot(true);
      }
    } else {
      setShouldShowBot(false);
    }
  }, [isOpen, isAIEnabledGlobally, isOptedforAIFeatures, onClose]);

  const handleAIConsentEnable = () => {
    setShouldShowBot(true);
  };

  return (
    <>
      <m.div
        initial={{ opacity: 0, right: -450 }}
        animate={{ opacity: shouldShowBot ? 1 : 0, right: shouldShowBot ? 65 : -450 }}
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
        isOpen={isAIConsentModalOpen}
        toggle={setIsAIConsentModalOpen}
        onEnableCallback={handleAIConsentEnable}
      />
    </>
  );
};
