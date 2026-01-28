import React from 'react';
import {
  Button,
  EmptyState,
  EmptyStateAction,
  EmptyStateDescription,
  EmptyStateIcon,
  EmptyStateTitle,
  Modal,
  ModalBody
} from '@browserstack/design-stack';
import { MdWarning } from '@browserstack/design-stack-icons';

const ConfirmationModal = ({
  title = '',
  description = '',
  onCancel = () => {},
  ctaTitle = 'Continue',
  onCTAClick = () => {},
  show = false
}) => (
  <Modal
    show={show}
    onClose={onCancel}
    size="sm"
    dialogWrapperClassName="bs-ds-scope"
  >
    <ModalBody density="compact">
      <EmptyState density="compact">
        <EmptyStateIcon
          wrapperClassName="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-attention-weakest"
          density="compact"
        >
          <MdWarning className="h-6 w-6 icon-attention-default" />
        </EmptyStateIcon>
        <EmptyStateTitle
          density="compact"
          wrapperClassName="text-lg font-medium mt-5"
        >
          {title}
        </EmptyStateTitle>
        <EmptyStateDescription
          wrapperClassName="text-sm mt-2"
          density="compact"
        >
          {description}
        </EmptyStateDescription>
        <EmptyStateAction wrapperClassName="flex gap-2 mt-6" density="compact">
          <Button onClick={onCancel} fullWidth colors="white" density="compact">
            Go back
          </Button>
          <Button
            onClick={onCTAClick}
            fullWidth
            colors="attention"
            density="compact"
          >
            {ctaTitle}
          </Button>
        </EmptyStateAction>
      </EmptyState>
    </ModalBody>
  </Modal>
);

export default ConfirmationModal;
