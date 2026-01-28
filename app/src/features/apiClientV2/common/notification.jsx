import React from 'react';
import { Notifications, notify, Loader } from '@browserstack/design-stack';
import {
  MdCheckCircleOutline,
  MdErrorOutline,
  MdInfoOutline,
  MdWarningAmber
} from '@browserstack/design-stack-icons';

const getIcon = (type) => {
  switch (type) {
    case 'error':
      return (
        <MdErrorOutline className="h-6 w-6 leading-5 icon-danger-default" />
      );
    case 'success':
      return <MdCheckCircleOutline className="h-6 w-6 icon-success-default " />;
    case 'warning':
      return <MdWarningAmber className="h-6 w-6 icon-attention-default " />;
    case 'loading':
      return <Loader />;
    default:
      return <MdInfoOutline className="h-6 w-6 leading-5 icon-brand-default" />;
  }
};

export const rqNotify = ({
  type = '',
  title = '',
  description = '',
  actionButtons = null,
  duration = 0,
  autoClose = true,
  onClose = () => {},
  id = ''
}) => {
  notify(
    <Notifications
      title={title}
      description={description}
      headerIcon={getIcon(type)}
      handleClose={(toastData) => {
        notify.remove(toastData.id);
        if (typeof onClose === 'function') {
          onClose?.();
        }
      }}
      actionButtons={actionButtons}
    />,
    {
      id,
      autoClose,
      position: 'top-right',
      duration: duration || 3000
    }
  );
};
