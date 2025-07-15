import { Button, Col, Row, notification } from "antd";
import * as semver from "semver";
import firebaseApp from "firebase";
import { getDatabase, onValue, ref } from "firebase/database";
import { useEffect } from "react";
import { InfoCircleOutlined } from "@ant-design/icons";
import "./index.scss";

const useAppUpdateChecker = () => {
  useEffect(() => {
    const database = getDatabase(firebaseApp);
    const appVersionsRef = ref(database, "_appData");

    const unsub = onValue(
      appVersionsRef,
      (snapshot) => {
        const appVersions = snapshot.val();

        const latestAppVersion = appVersions?.latestAppVersion;
        const currentAppVersion = process.env.REACT_APP_VERSION;

        console.log("[Debug] App Versions", { latestAppVersion, currentAppVersion });

        if (!currentAppVersion || (latestAppVersion && semver.gt(latestAppVersion, currentAppVersion))) {
          console.log("[Debug] New version available");
          notification.open({
            message: (
              <Row justify={"space-between"} className="app-update-notification-content" align={"middle"}>
                <Col>
                  <InfoCircleOutlined />
                </Col>
                <Col>A new version of app is available</Col>
                <Col>
                  <Button type="link" onClick={() => window.location.replace(window.location.href)}>
                    Refresh
                  </Button>
                </Col>
              </Row>
            ),
            placement: "top",
            duration: 0,
            maxCount: 1,
            key: "app-update-notification",
            closeIcon: <></>,
            className: "app-update-notification",
          });
        } else {
          console.log("[Debug] App is up to date");
        }
      },
      (err) => {
        console.log("[Debug] Error in onValue listener", err);
      }
    );

    return () => {
      console.log("[Debug] Unsubbing listener");
      unsub();
    };
  }, []);
};

export default useAppUpdateChecker;
