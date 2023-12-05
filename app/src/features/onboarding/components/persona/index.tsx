import { Col, Row, Typography } from "antd";
import { PersonaInput } from "./components/PersonaInput";
import { RQButton, RQInput } from "lib/design-system/components";
import { MdCheck } from "@react-icons/all-files/md/MdCheck";
import "./index.scss";

export const PersonaScreen = () => {
  return (
    <div className="persona-form-wrapper">
      <div className="persona-form">
        <Row gutter={16} align="middle">
          <Col className="login-success-icon display-row-center">
            <MdCheck className="text-white" />
          </Col>
          <Col className="login-success-message">You’re logged in successfully!</Col>
        </Row>
        <Typography.Title level={5} style={{ marginTop: "24px", fontWeight: 500 }}>
          Helps us in optimizing your experience
        </Typography.Title>
        <Col className="mt-16">
          <PersonaInput />
        </Col>
        <div className="onboarding-form-input mt-8">
          <label htmlFor="full-name">Your full name</label>
          <RQInput placeholder="E.g., you@company.com" id="full-name" />
        </div>
        <RQButton type="primary" size="large" className="persona-save-btn w-full mt-16">
          Save
        </RQButton>
      </div>
    </div>
  );
};
