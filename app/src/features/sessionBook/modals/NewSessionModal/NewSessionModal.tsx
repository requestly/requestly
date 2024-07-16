import React from "react";
import { RQModal } from "lib/design-system/components";
import { SessionsOnboardingView } from "features/sessionBook/screens/SessionsListScreen/components/OnboardingView/SessionsOnboardingView";
import "./newSessionModal.scss";

interface NewSessionModalProps {
  isOpen: boolean;
  toggleModal: () => void;
}

export const NewSessionModal: React.FC<NewSessionModalProps> = ({ isOpen, toggleModal }) => {
  return (
    <RQModal open={isOpen} onCancel={toggleModal} wrapClassName="create-new-session-modal" centered>
      <SessionsOnboardingView isModalView />
    </RQModal>
  );
};
