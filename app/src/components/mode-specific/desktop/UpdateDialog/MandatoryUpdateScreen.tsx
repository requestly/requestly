import React from "react";
import { Col, Row } from "antd";
import Typography from "antd/lib/typography";
import { RQButton, RQModal } from "lib/design-system/components";
import "./MandatoryUpdateScreen.scss";
import { FaDownload } from "@react-icons/all-files/fa/FaDownload";

const { Title, Text } = Typography;

interface Props {
  handleCTAClick: () => void;
  CTAText?: string;
}

const MandatoryUpdateScreen: React.FC<Props> = ({ handleCTAClick, CTAText }) => {
  return (
    <>
      <RQModal className="full-screen-dialog" mask={true} closeIcon={<></>} open={true} footer={null}>
        <Row justify="center" className="content">
          <Col span={5} className="asset">
            <img src="/assets/media/components/force-update.svg" alt="Update now" />
          </Col>
          <Col span={19} className="info">
            <Title level={5}>Update required: This version is no longer supported</Title>
            <Row>
              <Text type="secondary">
                You're using an outdated version of Requestly that is no longer functional. To continue using the app,
                please download and install the latest version below.
              </Text>
            </Row>
            <RQButton type="primary" onClick={handleCTAClick} icon={<FaDownload />}>
              <Text>{CTAText ?? "Download now"}</Text>
            </RQButton>
          </Col>
        </Row>
      </RQModal>
    </>
  );
};

export default MandatoryUpdateScreen;
