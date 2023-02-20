import React, { useState } from "react";
import { Col, Modal, Row } from "antd";
import { ExclamationCircleOutlined } from "@ant-design/icons";
import { getFunctions, httpsCallable } from "firebase/functions";
// Utils
import { toast } from "utils/Toast.js";
import Text from "antd/lib/typography/Text";
import { AddUser, Document, Filter } from "react-iconly";
import Title from "antd/lib/typography/Title";

const MoveToProfessionalModal = ({ isOpen, toggle, dontRefreshPage }) => {
  const [confirmLoading, setConfirmLoading] = useState(false);

  const handleError = () => {
    setConfirmLoading(false);

    toast.error(
      "You don't have a payment method attached. Please write to us at contact@requestly.io"
    );
  };

  const handleSuccess = () => {
    if (!dontRefreshPage) {
      toast.success("Upgrade successful");
      setTimeout(() => {
        window.location.reload();
      }, 3000);
    } else {
      toast.success("Please save work & refresh the page!");
    }

    toggle();
  };

  const handleOk = () => {
    setConfirmLoading(true);

    const functions = getFunctions();
    const requestUpgrade = httpsCallable(functions, "upgradeToProfessional");

    requestUpgrade()
      .then((response) => {
        if (response.data.success) {
          handleSuccess();
        } else {
          throw Error("Failed!");
        }
      })
      .catch((err) => {
        handleError();
      });
  };

  return (
    <>
      <Modal
        title="🚀 Upgrade to Professional Plan"
        visible={isOpen}
        onOk={handleOk}
        confirmLoading={confirmLoading}
        onCancel={toggle}
        icon={<ExclamationCircleOutlined />}
        okText="Confirm Upgrade"
      >
        <Row>
          <Col span={24}>
            <Title level={3} className="font-weight-900 white-in-light">
              Go Pro to keep your features
            </Title>
          </Col>
        </Row>
        <br />
        <div>
          <Row>
            <Col span={24}>
              <Text strong>Pro Plan features:</Text>
            </Col>
          </Row>
          <Row className="mt-1">
            <Col span={24}>
              <Row gutter={[16, 16]}>
                {/* Feature Start */}
                <Col className="gutter-row" span={12}>
                  <Row align="middle" justify="space-between">
                    <Col>
                      <Row align="middle">
                        <Filter
                          size={24}
                          set="curved"
                          className="remix-icon hp-text-color-primary-1 hp-mr-8"
                        />

                        <Col>
                          <p className="hp-mb-0 hp-badge-text hp-font-weight-400">
                            Unlimited Rules
                          </p>
                        </Col>
                      </Row>
                    </Col>
                  </Row>
                </Col>
                {/* Feature End */}
                {/* Feature Start */}
                <Col className="gutter-row" span={12}>
                  <Row align="middle" justify="space-between">
                    <Col>
                      <Row align="middle">
                        <Document
                          size={24}
                          set="curved"
                          className="remix-icon hp-text-color-primary-1 hp-mr-8"
                        />

                        <Col>
                          <p className="hp-mb-0 hp-badge-text hp-font-weight-400">
                            Unlimited Mocks
                          </p>
                        </Col>
                      </Row>
                    </Col>
                  </Row>
                </Col>
                {/* Feature End */}
                {/* Feature Start */}
                <Col className="gutter-row" span={12}>
                  <Row align="middle" justify="space-between">
                    <Col>
                      <Row align="middle">
                        <AddUser
                          size={24}
                          set="curved"
                          className="remix-icon hp-text-color-primary-1 hp-mr-8"
                        />

                        <Col>
                          <p className="hp-mb-0 hp-badge-text hp-font-weight-400">
                            Unlimited Sharing
                          </p>
                        </Col>
                      </Row>
                    </Col>
                  </Row>
                </Col>
                {/* Feature End */}
              </Row>
            </Col>
          </Row>
        </div>
        <br />
        <p>
          You'll be upgraded to Requestly Professional plan ($25/month). This
          process might take a few seconds.
        </p>
      </Modal>
    </>
  );
};

export default MoveToProfessionalModal;
