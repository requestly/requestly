import React, { useState, useEffect, useRef } from "react";
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
  const isOptedforAIFeatures = useSelector(getIsOptedforAIFeatures);
  const [isAIConsentModalOpen, setIsAIConsentModalOpen] = useState(false);
  const [shouldShowBot, setShouldShowBot] = useState(false);
  const [userHasConsented, setUserHasConsented] = useState(false);
  const consentEnabledRef = useRef(false);

  useEffect(() => {
    if (isAIConsentModalOpen) {
      consentEnabledRef.current = false;
    }
  }, [isAIConsentModalOpen]);

  useEffect(() => {
    if (isOpen) {
      if (!isOptedforAIFeatures && !userHasConsented) {
        setIsAIConsentModalOpen(true);
        setShouldShowBot(false);
      } else {
        setShouldShowBot(true);
        setIsAIConsentModalOpen(false);
      }
    } else {
      setShouldShowBot(false);
      setIsAIConsentModalOpen(false);
      setUserHasConsented(false);
    }
  }, [isOpen, isOptedforAIFeatures, userHasConsented]);

  const handleAIConsentEnable = () => {
    consentEnabledRef.current = true;
    setUserHasConsented(true);
    setShouldShowBot(true);
    setIsAIConsentModalOpen(false);
  };

  const handleAIConsentDismiss = () => {
    setIsAIConsentModalOpen(false);
    setTimeout(() => {
      if (!consentEnabledRef.current) {
        onClose();
      }
    }, 0);
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
        toggle={handleAIConsentDismiss}
        onEnableCallback={handleAIConsentEnable}
      />
    </>
  );
};
