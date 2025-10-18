import React, { useEffect, useRef } from "react";
import { m } from "framer-motion";
import { IoMdClose } from "@react-icons/all-files/io/IoMdClose";
import { trackGetHumanSupportClicked } from "./analytics";
import { RequestBotModel } from "./types";
import { MODELS } from "./constants";
import "./requestBot.css";

interface RequestBotProps {
  isOpen: boolean;
  onClose: () => void;
  modelType?: RequestBotModel;
}

export const RequestBot: React.FC<RequestBotProps> = ({ isOpen, onClose, modelType = "app" }) => {
  const botRef = useRef<HTMLDivElement>(null);

  // Close on outside click - but NOT if clicking on Ask AI button
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent | TouchEvent) => {
      if (!isOpen) return;

      const element = botRef.current;
      const target = e.target as HTMLElement;

      // Check if click is on Ask AI button or its children
      const isClickOnAskAIButton =
        target.closest("[data-ask-ai-trigger]") !== null || target.textContent?.includes("Ask AI");

      // Only close if click is outside dialog AND not on Ask AI button
      if (element && !element.contains(target) && !isClickOnAskAIButton) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [isOpen, onClose]);

  return (
    <m.div
      ref={botRef}
      initial={{ opacity: 0, right: -450 }}
      animate={{ opacity: isOpen ? 1 : 0, right: isOpen ? 65 : -450 }}
      transition={{ duration: 0.2 }}
      className="request-bot"
      style={{ pointerEvents: isOpen ? "auto" : "none" }}
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
  );
};
