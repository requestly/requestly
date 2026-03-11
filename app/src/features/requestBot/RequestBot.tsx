import React, { useEffect, useRef, useState } from "react";
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

export const RequestBot: React.FC<RequestBotProps> = ({ isOpen, onClose, modelType = "app" }) => {
  const isOptedforAIFeatures = useSelector(getIsOptedforAIFeatures);
  const [userHasConsented, setUserHasConsented] = useState(false);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!isOpen) {
      setUserHasConsented(false);
    }
  }, [isOpen]);

  const showConsentModal = isOpen && !isOptedforAIFeatures && !userHasConsented;
  const shouldShowBot = isOpen && (isOptedforAIFeatures || userHasConsented);
  const modelConfig = MODELS[modelType] ?? MODELS.app;

  useEffect(() => {
    if (!shouldShowBot) {
      return;
    }

    closeButtonRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose, shouldShowBot]);

  const handleAIConsentEnable = () => {
    setUserHasConsented(true);
  };

  const handleAIConsentDismiss = () => {
    onClose();
  };

  return (
    <>
      <m.div
        initial={false}
        animate={{ opacity: shouldShowBot ? 1 : 0 }}
        transition={{ duration: 0.2 }}
        className="request-bot-layer"
        style={{
          pointerEvents: shouldShowBot ? "auto" : "none",
          visibility: shouldShowBot ? "visible" : "hidden",
        }}
      >
        <m.button
          type="button"
          aria-label="Close AI assistant"
          className="request-bot-backdrop"
          initial={false}
          animate={{ opacity: shouldShowBot ? 1 : 0 }}
          transition={{ duration: 0.2 }}
          onClick={onClose}
        />

        <m.section
          initial={false}
          animate={{
            opacity: shouldShowBot ? 1 : 0,
            x: shouldShowBot ? 0 : 24,
          }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="request-bot"
          role="dialog"
          aria-modal="true"
          aria-label="RequestBot"
        >
          <div className="request-bot-content">
            <button
              ref={closeButtonRef}
              type="button"
              className="request-bot-close-button"
              onClick={onClose}
              aria-label="Close AI assistant"
            >
              <IoMdClose />
            </button>

            <div className="request-bot-body">
              <iframe title="RequestBot" className="request-bot-iframe" src={modelConfig.src} />
            </div>

            <button
              type="button"
              className="request-bot-support-button"
              onClick={() => {
                onClose();
                window?.$crisp?.push(["do", "chat:open"]);
                trackGetHumanSupportClicked();
              }}
            >
              Get human support
            </button>
          </div>
        </m.section>
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
