import React, { useState, useRef, useEffect } from "react";
import { FaExclamationCircle } from "@react-icons/all-files/fa/FaExclamationCircle";
import { Row, Col, Container, Card, CardBody } from "reactstrap";
import { toast } from "utils/Toast.js";
// CONSTANTS
import { CONSTANTS as GLOBAL_CONSTANTS } from "@requestly/requestly-core";
// UTILS
import { redirectToAccountDetails } from "../../../utils/RedirectionUtils";
// FIREBASE
import { getFunctions, httpsCallable } from "firebase/functions";
import Jumbotron from "components/bootstrap-legacy/jumbotron";
import { RQButton } from "lib/design-system/components";

const RefreshSubscription = () => {
  const mountedRef = useRef(true);
  // Component State
  const [isProcessing, setIsProcessing] = useState(false);

  const doRefreshSubscription = () => {
    setIsProcessing(true);
    const functions = getFunctions();
    const refreshSubscription = httpsCallable(functions, "subscription-refreshUserSubscription");

    refreshSubscription()
      .then((res) => {
        if (!mountedRef.current) return null;
        const response = res.data;
        if (response.success) {
          setIsProcessing(false);
          redirectToAccountDetails(false, true);
        } else {
          setIsProcessing(false);
          toast.warn(response.message);
        }
      })
      .catch((err) => {
        if (!mountedRef.current) return null;
        setIsProcessing(false);
        toast.warn(err.message);
      });
  };

  useEffect(() => {
    // Cleanup
    return () => {
      mountedRef.current = false;
    };
  }, []);

  return (
    <Container className=" mt--7" fluid>
      {/* Table */}
      <Row>
        <Col>
          <Card className=" shadow">
            <CardBody>
              <Row>
                <Col>
                  <Jumbotron style={{ background: "transparent" }} className="text-center">
                    <h4>If you are facing any issue with your current subscription, a refresh might be helpful.</h4>
                    {isProcessing ? (
                      <React.Fragment>
                        <br />
                        <h5>
                          <FaExclamationCircle color="orange" /> This process may take a few seconds. Do not close this
                          page.
                        </h5>
                      </React.Fragment>
                    ) : null}

                    <br />
                    <RQButton
                      className="btn-icon btn-3"
                      type="primary"
                      onClick={doRefreshSubscription}
                      loading={isProcessing}
                    >
                      Refresh Subscription
                    </RQButton>
                    <br />
                    <hr />
                    <p>
                      Still facing issues? Reach our payment support team at{" "}
                      <a href={`mailto:${GLOBAL_CONSTANTS.COMPANY_INFO.SUPPORT_EMAIL}`}>
                        {GLOBAL_CONSTANTS.COMPANY_INFO.SUPPORT_EMAIL}
                      </a>
                      .
                    </p>
                  </Jumbotron>
                </Col>
              </Row>
            </CardBody>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default RefreshSubscription;
