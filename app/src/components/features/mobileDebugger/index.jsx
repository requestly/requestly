import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import ProCard from "@ant-design/pro-card";

import { actions } from "store";
import { Col, Divider, Row, Typography } from "antd";
import MobileDebuggerAppSelector from "./components/AppSelector";
import TeamFeatureComingSoon from "components/landing/TeamFeatureComingSoon";
import { getIsWorkspaceMode } from "store/features/teams/selectors";

const { Title } = Typography;

const MobileDebuggerDashboard = () => {
  const dispatch = useDispatch();
  const isWorkspaceMode = useSelector(getIsWorkspaceMode);

  useEffect(() => {
    dispatch(
      actions.updateMobileDebuggerAppDetails({
        id: null,
        name: null,
        platform: null,
      })
    );
  }, [dispatch]);

  const renderDashboard = () => {
    return (
      <ProCard>
        <Title level={3}>Dashboard</Title>
        <Divider />
        <Row>
          <Col span={8}>
            <Title level={5}>Select An App </Title>
            <MobileDebuggerAppSelector />
          </Col>
        </Row>
      </ProCard>
    );
  };

  if (isWorkspaceMode) return <TeamFeatureComingSoon title="Mobile Debugger" />;

  return <div>{renderDashboard()}</div>;
};

export default MobileDebuggerDashboard;
