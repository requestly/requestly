import React from "react";
import { m } from "framer-motion";
import { IoMdClose } from "@react-icons/all-files/io/IoMdClose";
import { trackGetHumanSupportClicked } from "./analytics";
import "./requestBot.css";
import { getUserAuthDetails } from "store/selectors";
import { useDispatch, useSelector } from "react-redux";
import { actions } from "store";

interface RequestBotProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RequestBot: React.FC<RequestBotProps> = ({ isOpen, onClose }) => {
  const user = useSelector(getUserAuthDetails);
  const dispatch = useDispatch();
  const paidUser = user.loggedIn && user?.details?.planDetails?.planName !== "free";

  return (
    <m.div
      initial={{ opacity: 0, right: -450 }}
      animate={{ opacity: isOpen ? 1 : 0, right: isOpen ? 65 : -450 }}
      transition={{ duration: 0.2 }}
      className="request-bot"
    >
      <IoMdClose className="request-bot-close-btn" onClick={onClose} />
      <iframe
        title="RequestBot"
        className="request-bot-iframe"
        src="https://widget.writesonic.com/CDN/index.html?service-base-url=https%3A%2F%2Fapi-azure.botsonic.ai&token=ecb64aff-5d8a-40e6-b07b-80b14997c80f&base-origin=https%3A%2F%2Fbot.writesonic.com&instance-name=Botsonic&standalone=true&page-url=https%3A%2F%2Fbot.writesonic.com%2Fbots%2Fd59d951e-714f-41d9-8834-4d8dfa437b0e%2Fintegrations"
      ></iframe>
      <div
        className="get-human-support"
        onClick={() => {
          onClose();
          paidUser
            ? window.$crisp.push(["do", "chat:open"])
            : dispatch(
                // @ts-ignore
                actions.toggleActiveModal({
                  modalName: "pricingModal",
                  newValue: true,
                  newProps: { selectedPlan: null, source: "support_option_clicked" },
                })
              );

          trackGetHumanSupportClicked();
        }}
      >
        Get human support
      </div>
    </m.div>
  );
};
