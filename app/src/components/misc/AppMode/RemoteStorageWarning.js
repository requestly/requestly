import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Button, Col, Tooltip, Typography } from "antd";
import { getAppMode, getUserAuthDetails } from "store/selectors";
import APP_CONSTANTS from "config/constants";
import { Link } from "react-router-dom";
import { isUserUsingAndroidDebugger } from "components/features/mobileDebugger/utils/sdkUtils";
import { CONSTANTS as GLOBAL_CONSTANTS } from "@requestly/requestly-core";
const { Title, Text } = Typography;
const { PATHS } = APP_CONSTANTS;

// Showing warning if
// extension is not installed
// and appMode is not desktop
// and android debugger is not used
function RemoteStorageWarning() {
  //Global State
  const appMode = useSelector(getAppMode);
  const user = useSelector(getUserAuthDetails);

  //Local State
  const [showWarning, setShowWarning] = useState(false);

  useEffect(() => {
    if (user.loggedIn && user.details?.profile?.uid) {
      setShowWarning(
        appMode === GLOBAL_CONSTANTS.APP_MODES.REMOTE &&
          !isUserUsingAndroidDebugger(user.details.profile.uid)
      );
    }
  }, [user, appMode]);

  const renderCTA = () => {
    return (
      <>
        <Title level={5}>Cannot execute rules locally</Title>
        <Text type="secondary">
          {" "}
          you can either use the{" "}
          <Link target="_blank" to={PATHS.MOBILE_DEBUGGER.RELATIVE}>
            mobile debugger
          </Link>{" "}
          or{" "}
          <Link target="_blank" to={PATHS.INSTALL_EXTENSION.RELATIVE}>
            install the extension
          </Link>
        </Text>
      </>
    );
  };

  return showWarning ? (
    <Col className="hp-d-flex-center hp-mr-sm-12 hp-mr-12">
      <Tooltip placement="bottom" title={renderCTA()}>
        <Button danger size="small" type="primary">
          No rule Executor
        </Button>
      </Tooltip>
    </Col>
  ) : null;
}

export default RemoteStorageWarning;
