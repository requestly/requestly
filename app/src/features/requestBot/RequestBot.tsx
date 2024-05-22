import React from "react";
import { m } from "framer-motion";
import { IoMdClose } from "@react-icons/all-files/io/IoMdClose";
import "./requestBot.css";

interface RequestBotProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RequestBot: React.FC<RequestBotProps> = ({ isOpen, onClose }) => {
  return (
    <m.div
      initial={{ opacity: 0, right: -50 }}
      animate={{ opacity: isOpen ? 1 : 0, right: isOpen ? 0 : -50 }}
      transition={{ duration: 0.2 }}
      className="request-bot-container"
    >
      <div className="request-bot">
        <IoMdClose className="request-bot-close-btn" onClick={onClose} />
        <iframe
          frameBorder="0"
          src="https://widget.writesonic.com/CDN/index.html?service-base-url=https%3A%2F%2Fapi-azure.botsonic.ai&token=ecb64aff-5d8a-40e6-b07b-80b14997c80f&base-origin=https%3A%2F%2Fbot.writesonic.com&instance-name=Botsonic&standalone=true&page-url=https%3A%2F%2Fbot.writesonic.com%2Fbots%2Fd59d951e-714f-41d9-8834-4d8dfa437b0e%2Fintegrations"
        ></iframe>
        <div
          className="get-human-support"
          onClick={() => {
            onClose();
            window.$saturn.open();
          }}
        >
          Get human support
        </div>
      </div>
    </m.div>
  );
};
