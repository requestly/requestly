import React from "react";
import { Row, Col, Button } from "antd";
import { useNavigate } from "react-router-dom";
//SUB COMPONENTS
import ApplyLicenseForm from "./ApplyLicenseForm";

//UTILS
import { redirectToManageLicense } from "../../../utils/RedirectionUtils";
import ProCard from "@ant-design/pro-card";
import { SettingOutlined } from "@ant-design/icons";

const ApplyLicense = () => {
  const navigate = useNavigate();
  return (
    <React.Fragment>
      <ProCard
        className="primary-card github-like-border"
        title="License Details"
        extra={
          <Button
            type="primary"
            onClick={(e) => redirectToManageLicense(navigate)}
            icon={<SettingOutlined />}
          >
            Manage License
          </Button>
        }
      >
        <Row>
          <Col span={24} align="center">
            <ApplyLicenseForm />
          </Col>
        </Row>
      </ProCard>
    </React.Fragment>
  );
};

export default ApplyLicense;
