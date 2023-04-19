import { Button, Col, Modal, Row, Typography } from "antd";
import { FiUsers } from "react-icons/fi";
import { ReactMultiEmail, isEmail } from "react-multi-email";

import { useState } from "react";
import { toast } from "utils/Toast";

import firebaseApp from "../../../../../firebase";
import { getFunctions, httpsCallable } from "firebase/functions";
import { trackAndroidDebuggerShared } from "modules/analytics/events/features/mobileDebugger";

const { Title } = Typography;

const ShareAppAccessModal = ({ isVisible, setVisible, appId, appName }) => {
  // Component state
  const [isLoading, setIsLoading] = useState(false);
  const [emails, setEmails] = useState([]);

  const handleCancel = () => {
    if (!isLoading) setVisible(false);
  };

  const handleShareAppAccess = async () => {
    setIsLoading(true);
    // call backend function
    const functions = getFunctions(firebaseApp);
    const shareAppAccess = httpsCallable(functions, "shareAppAccess");
    await shareAppAccess({
      appId,
      appName,
      emails,
    })
      .then((res) => {
        // handle messaging bases on res
        const response = res.data;
        if (!response.success) {
          toast.error(response.message);
        } else {
          if (response.message) {
            toast.warn(response.message);
          } else {
            toast.success("Users have been granted access!");
          }
          trackAndroidDebuggerShared();
          setIsLoading(false);
          setVisible(false);
        }
        setIsLoading(false);
      })
      .catch((err) => {
        toast.error("Unexpected Failure, please report this!");
        setIsLoading(false);
      });
  };
  return (
    <Modal
      title={
        <span>
          <FiUsers /> Share App Access
        </span>
      }
      visible={isVisible}
      onCancel={handleCancel}
      footer={null}
    >
      <Row>
        <Title level={3}>Invite your teammates to debug together</Title>
      </Row>
      <Row>
        <Col span={24} className="hp-mb-24">
          <ReactMultiEmail
            placeholder="Enter a comma separated list of emails"
            emails={emails}
            onChange={(emails) => {
              setEmails(emails);
            }}
            validateEmail={(email) => {
              return isEmail(email); // return boolean
            }}
            getLabel={(email, index, removeEmail) => {
              return (
                <div data-tag key={index}>
                  {email}
                  <span data-tag-handle onClick={() => removeEmail(index)}>
                    ×
                  </span>
                </div>
              );
            }}
          />
        </Col>
      </Row>
      <Row>
        <Col span={24} align="center">
          <Button type="primary" loading={isLoading} onClick={handleShareAppAccess}>
            Share Access
          </Button>
        </Col>
      </Row>
    </Modal>
  );
};

export default ShareAppAccessModal;
