import React, { useCallback } from "react";
import { Col, Row } from "antd";
import Typography from "antd/lib/typography";
import { RQButton, RQModal } from "lib/design-system/components";
import "./MandatoryUpdateScreen.scss";
import { FaDownload } from "@react-icons/all-files/fa/FaDownload";

const { Title, Text } = Typography;

interface Props {
  handleCTAClick: () => void;
  title?: string;
  description?: string;
  ctaText?: string;
  independentComponent?: boolean;
}
/* DEFAULT COPY IS FOR WHEN MANUAL REINSTALLATION IS REQUIRED */
const MandatoryUpdateScreen: React.FC<Props> = ({
  handleCTAClick,
  title,
  description,
  ctaText,
  independentComponent,
}) => {
  const renderContent = useCallback(
    () => (
      <Row justify="center" className="content">
        <Col span={5} className="asset">
          <img src="/assets/media/components/force-update.svg" alt="Update now" />
        </Col>
        <Col span={19} className="info">
          <Title level={5}>{title ?? "Update required: This version is no longer supported"}</Title>
          <Row>
            <Text type="secondary">
              {description ??
                "You're using an outdated version of Requestly that is no longer functional. To continue using the app, \n please download and install the latest version below."}
            </Text>
          </Row>
          <RQButton type="primary" onClick={handleCTAClick} icon={<FaDownload />}>
            <Text>{ctaText ?? "Download now"}</Text>
          </RQButton>
        </Col>
      </Row>
    ),
    [handleCTAClick, title, description, ctaText]
  );
  if (independentComponent) {
    return <div className="mandatory-update-wrapper">{renderContent()}</div>;
  }
  return (
    <>
      <RQModal className="full-screen-dialog" mask={true} closeIcon={<></>} open={true} footer={null}>
        {renderContent()}
      </RQModal>
    </>
  );
};

export default MandatoryUpdateScreen;
