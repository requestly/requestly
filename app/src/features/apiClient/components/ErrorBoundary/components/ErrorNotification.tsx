import React, { useCallback, useEffect, useState } from "react";
import { notification } from "antd";
import { RightOutlined, WarningOutlined } from "@ant-design/icons";
import { RQButton } from "lib/design-system-v2/components";
import { RQModal } from "lib/design-system/components";
import { RenderableError } from "errors/RenderableError";
import { NativeError } from "errors/NativeError";
import { getErrorPresentationDetails } from "../utils";
import { ErrorDetails } from "./ErrorDetails";
import "./ErrorNotification.scss";

interface ErrorNotificationProps {
  error: NativeError | Error;
  resetError: () => void;
}

export const ErrorNotification: React.FC<ErrorNotificationProps> = ({ error, resetError }) => {
  const [api, contextHolder] = notification.useNotification();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const isRenderableError = error instanceof RenderableError;

  const showModal = useCallback(() => {
    setIsModalVisible(true);
    notification.destroy();
  }, []);

  const handleModalClose = useCallback(() => {
    setIsModalVisible(false);
    resetError();
  }, [resetError]);

  const openNotification = useCallback(() => {
    api.warning({
      message: <div className="error-notification__heading">{getErrorPresentationDetails(error).heading}</div>,
      description: (
        <div className="error-notification__subheading">{getErrorPresentationDetails(error).subheading}</div>
      ),
      placement: "bottomRight",
      type: "warning",
      duration: isRenderableError ? 0 : 4.5,
      className: "error-notification",
      icon: <WarningOutlined className="error-notification__icon" />,
      btn: isRenderableError ? (
        <RQButton type="transparent" size="small" onClick={showModal}>
          More details
          <RightOutlined style={{ fontSize: "10px" }} />
        </RQButton>
      ) : null,
    });
  }, [api, error, isRenderableError, showModal]);

  useEffect(() => {
    openNotification();
  }, [openNotification]);

  return (
    <>
      {contextHolder}
      {isRenderableError && (
        <RQModal
          title={null}
          open={isModalVisible}
          onCancel={handleModalClose}
          footer={[
            <RQButton key="close" type="primary" onClick={handleModalClose}>
              Close
            </RQButton>,
          ]}
          width={600}
        >
          <div className="error-boundary-modal-content">
            <ErrorDetails error={error} />
          </div>
        </RQModal>
      )}
    </>
  );
};
