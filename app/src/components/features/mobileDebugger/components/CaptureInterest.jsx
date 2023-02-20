import { Col, Modal, Result, Row } from "antd";
import { AndroidFilled } from "@ant-design/icons";
import React from "react";
import { PopupButton } from "@typeform/embed-react";

const CaptureInterest = ({
  setIsModalVisible,
  isModalVisible,
  isSorryModalVisible,
  setIsSorryModalVisible,
}) => {
  // LOCAL
  const feedbackTaken = false;

  // HANDLER FUNCTIONS
  const handleOk = () => {
    setIsModalVisible(false);
  };

  const handleSorryModalOk = () => {
    setIsModalVisible(false);
  };
  return (
    <Row>
      <Col
        span={24}
        xs={{ offset: 0 }}
        sm={{ offset: 0 }}
        md={{ span: 10, offset: 7 }}
      >
        <Modal
          title="Thank you for showing your interest"
          visible={isModalVisible}
          onOk={handleOk}
          okText="Sweet!"
          onCancel={() => setIsModalVisible(false)}
          cancelButtonProps={{ style: { display: "none" } }}
        >
          <p>
            Thank you for showing your interest in Requestly's Android
            Interceptor. We have recorded your response and forwarded it to our
            team. We'll let you know when we have something ready for you.
          </p>
          <p>
            If you have any questions, please check out the Android Interceptor
            Docs or drop us a message, we'll be there to help you :)
          </p>
        </Modal>
        <Modal
          title="Thank you for your feedback"
          visible={isSorryModalVisible}
          onOk={handleSorryModalOk}
          okText="Sweet!"
          onCancel={() => setIsSorryModalVisible(false)}
          cancelButtonProps={{ style: { display: "none" } }}
          footer={false}
          bodyStyle={{ display: "none" }}
        />
        {feedbackTaken ? (
          <Result
            status="success"
            title="Successfully Submitted Feedback"
            subTitle="Thanks a lot for your feedback! We'll keep you posted about Requestly Android Interceptor."
          />
        ) : (
          <Result
            icon={<AndroidFilled />}
            title="Interested in Android Interceptor?"
            subTitle="Requestly is building something amazing! Intercept network requests in your Android App using Requestly's Android Interceptor SDK"
            extra={
              <>
                {/* <Button
                  type="primary"
                  onClick={() => {
                    setIsModalVisible(true);
                    interestCaptured("android_interceptor");
                    setFeedbackTaken(true);
                  }}
                >
                  Yes, sounds great!
                </Button>{" "} */}

                <PopupButton
                  id="BUsaN1l2"
                  style={{ fontSize: 15 }}
                  className="typeform-btn"
                >
                  Get Early Access
                </PopupButton>
              </>
            }
          ></Result>
        )}
      </Col>
    </Row>
  );
};

export default CaptureInterest;
