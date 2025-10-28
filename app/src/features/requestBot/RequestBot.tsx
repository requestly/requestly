import React from "react";
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
  return (
    <m.div
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
