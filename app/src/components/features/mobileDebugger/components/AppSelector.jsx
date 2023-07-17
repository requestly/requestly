import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { PlusOutlined } from "@ant-design/icons";
import { Button, Select, Typography } from "antd";
import { useNavigate } from "react-router-dom";
import { getMobileDebuggerAppDetails, getUserAuthDetails } from "store/selectors";
import { redirectToCreateNewApp, redirectToMobileDebuggerHome } from "utils/RedirectionUtils";
import { APP_PLATFORMS_MAP } from "../screens/createApp/constants";
import { getSdkApps } from "../utils/sdkUtils";
import { AuthConfirmationPopover } from "components/hoc/auth/AuthConfirmationPopover";
import { AUTH } from "modules/analytics/events/common/constants.js";

const { Title } = Typography;

const MobileDebuggerAppSelector = () => {
  const navigate = useNavigate();

  // GLOBAL STATE
  const user = useSelector(getUserAuthDetails);
  const mobileDebuggerAppDetails = useSelector(getMobileDebuggerAppDetails);

  // COMPONENT STATE
  const [apps, setApps] = useState([]);
  const [areAppsLoaded, setAreAppsLoaded] = useState(false);
  const [selectedApp, setSelectedApp] = useState(null);

  useEffect(() => {
    if (user?.loggedIn) {
      getSdkApps(user?.details?.profile?.uid).then((sdkApps) => {
        if (sdkApps) {
          setApps([...sdkApps]);
        }
        setAreAppsLoaded(true);
      });
    } else {
      setAreAppsLoaded(true);
    }
  }, [user?.details?.profile?.uid, user?.loggedIn]);

  useEffect(() => {
    if (mobileDebuggerAppDetails) {
      setSelectedApp(mobileDebuggerAppDetails && mobileDebuggerAppDetails["id"]);
    }
  }, [mobileDebuggerAppDetails, user]);

  const appSelectHandler = (value) => {
    setSelectedApp(value);

    if (value === "new") {
      redirectToCreateNewApp(navigate);
      return;
    }

    redirectToMobileDebuggerHome(navigate, value);
  };

  const renderAppsSelector = () => {
    return (
      <Select
        value={selectedApp}
        onSelect={appSelectHandler}
        style={{ flexShrink: "0", width: "13rem" }}
        placeholder="Select Your App"
      >
        {apps.map((app) => {
          return (
            <Select.Option key={app.id} value={app.id}>
              {APP_PLATFORMS_MAP[app.platform]?.icon || null} {app.name || app.id}{" "}
            </Select.Option>
          );
        })}
        <Select.Option key="new" value="new" style={{ textAlign: "center" }}>
          <Title level={5} style={{ margin: 0 }}>
            <PlusOutlined /> Create New App
          </Title>
        </Select.Option>
      </Select>
    );
  };

  const createNewAppHandler = () => {
    redirectToCreateNewApp(navigate);
  };

  const renderCreateNewAppButton = () => {
    return (
      <AuthConfirmationPopover
        title="You need to sign up to create a new app"
        onConfirm={createNewAppHandler}
        source={AUTH.SOURCE.CREATE_NEW_APP}
      >
        <Button type="primary" onClick={user?.details?.isLoggedIn && createNewAppHandler}>
          <PlusOutlined /> Create New App
        </Button>
      </AuthConfirmationPopover>
    );
  };

  if (areAppsLoaded && apps.length === 0) {
    return renderCreateNewAppButton();
  }

  return renderAppsSelector();
};

export default MobileDebuggerAppSelector;
