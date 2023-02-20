import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import ProCard from "@ant-design/pro-card";
import { Button, Col, Row } from "antd";
import illustrationDark from "assets/images/illustrations/fixing-bugs-dark.svg";
import illustration from "assets/images/illustrations/fixing-bugs.svg";
import { getAppMode, getAppTheme, getUserAuthDetails } from "store/selectors";
import THEMES from "config/constants/sub/themes";
import { toast } from "utils/Toast";
import { StorageService } from "init";
import { addDoc, collection, getFirestore } from "firebase/firestore";
import firebaseApp from "../../../firebase";
import { RiSendPlaneFill } from "react-icons/ri";
import { redirectToRules } from "utils/RedirectionUtils";

const SendDebugReport = () => {
  const navigate = useNavigate();

  // Global State
  const appTheme = useSelector(getAppTheme);
  const appMode = useSelector(getAppMode);
  const user = useSelector(getUserAuthDetails);

  // Component State
  const [isSending, setIsSending] = useState(false);

  const handleSend = async () => {
    if (user?.details?.profile?.uid) {
      setIsSending(true);
      try {
        const storageDump = await StorageService(appMode).getAllRecords();
        const uid = user.details.profile.uid;
        // Debug - Storage
        const db = getFirestore(firebaseApp);
        await addDoc(collection(db, "debugReports", uid, "dumps"), {
          ...storageDump,
          metadata: {
            ts: new Date().getTime(),
          },
        });
        setIsSending(false);
        redirectToRules(navigate);
        toast.success("Sent successfully");
      } catch (e) {
        toast.error(
          "An error has occurred. Please contact support. Error code: Lise"
        );
      }
    } else {
      toast.error("Please login first.");
      setIsSending(false);
    }
  };

  return (
    <React.Fragment>
      <ProCard className="primary-card github-like-border">
        <Row>
          <Col className="hp-text-center" span={24}>
            <img
              src={appTheme === THEMES.LIGHT ? illustration : illustrationDark}
              alt="Upgrade Account"
              style={{ maxHeight: "30vh" }}
            />

            <h3 className="hp-mb-0 hp-mt-24 hp-mb-16 hp-mr-4">
              Send Debug Report
            </h3>

            <p className="hp-p1-body hp-mb-0">
              This process will create an error report that will be sent to us.
              <br />
              It may include your data including Rules.
            </p>
            <br />
            <Button
              type="primary"
              onClick={handleSend}
              icon={<RiSendPlaneFill className="remix-icon" />}
              loading={isSending}
            >
              {isSending ? "Sending" : "Send"}
            </Button>
          </Col>
        </Row>
      </ProCard>
    </React.Fragment>
  );
};

export default SendDebugReport;
