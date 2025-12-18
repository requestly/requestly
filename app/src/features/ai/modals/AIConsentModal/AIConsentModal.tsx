import React, { useState } from "react";
import { Modal } from "antd";
import { TbShieldLock } from "@react-icons/all-files/tb/TbShieldLock";
import { MdOutlineNearMeDisabled } from "@react-icons/all-files/md/MdOutlineNearMeDisabled";
import { IoMdInformationCircleOutline } from "@react-icons/all-files/io/IoMdInformationCircleOutline";
import { MdArrowOutward } from "@react-icons/all-files/md/MdArrowOutward";
import { RQButton } from "lib/design-system-v2/components";
import { toggleAIFeatures } from "backend/user/toggleAIFeatures";
import { useDispatch, useSelector } from "react-redux";
import { getUserAuthDetails } from "store/slices/global/user/selectors";
import { toast } from "utils/Toast";
import { globalActions } from "store/slices/global/slice";
import { getUserMetadata } from "store/slices/global/user/selectors";
import { Link } from "react-router-dom";
import PATHS from "config/constants/sub/paths";
import "./aiConsentModal.scss";

interface AIConsentModalProps {
  isOpen: boolean;
  toggle: (isOpen: boolean) => void;
  onEnableCallback?: () => void;
}

const AI_DETAILS = [
  {
    label: "AI only processes the content you select",
    icon: <TbShieldLock />,
  },
  {
    label: "Your data is never used to train models",
    icon: <MdOutlineNearMeDisabled />,
  },
  {
    label: "AI can make mistakes — review suggestions before applying",
    icon: <IoMdInformationCircleOutline />,
  },
];

export const AIConsentModal: React.FC<AIConsentModalProps> = ({ isOpen, toggle, onEnableCallback }) => {
  const user = useSelector(getUserAuthDetails);
  const userMetadata = useSelector(getUserMetadata);
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(false);

  const handleEnable = async () => {
    setIsLoading(true);
    const result = await toggleAIFeatures(user.details?.profile?.uid, true);
    if (result.success) {
      dispatch(globalActions.updateUserMetadata({ ...userMetadata, ai_consent: true }));
      toggle(false);
      onEnableCallback?.();
    } else {
      toast.error("Something went wrong while enabling AI features. Please try again later or contact support.");
    }
    setIsLoading(false);
  };
  return (
    <Modal
      width={480}
      wrapClassName="ai-consent-modal-wrap"
      className="ai-consent-modal"
      open={isOpen}
      onCancel={() => toggle(false)}
      title={<div className="ai-consent-modal-title"> ✨ Enable AI features </div>}
      footer={
        <div className="ai-consent-modal-footer">
          <RQButton onClick={() => toggle(false)}>Cancel</RQButton>
          <RQButton type="primary" loading={isLoading} onClick={handleEnable}>
            Enable AI
          </RQButton>
        </div>
      }
    >
      <div className="ai-consent-modal-content">
        <div className="ai-consent-modal-content__title">
          Speed up your workflow with AI-powered suggestions and automation.
        </div>
        <div className="ai-consent-modal-content__details-container">
          <div className="ai-consent-modal-content__details-container--title">How AI works in this feature</div>
          <div className="ai-consent-modal-content__details_list">
            {AI_DETAILS.map(({ icon, label }, index) => (
              <div className="ai-consent-modal-content__details_list--item" key={index}>
                {icon}
                {label}
              </div>
            ))}
          </div>
          <a target="_blank" href="#" rel="noreferrer">
            Learn more in FAQs <MdArrowOutward />
          </a>
        </div>
        <div className="ai-consent-modal-content__settings-link">
          You can turn AI off anytime in Settings →{" "}
          <Link to={PATHS.SETTINGS.GLOBAL_SETTINGS.RELATIVE} className="external-link">
            AI features
          </Link>
        </div>
      </div>
    </Modal>
  );
};
