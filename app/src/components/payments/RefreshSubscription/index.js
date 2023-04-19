import React, { useState, useRef, useEffect } from "react";
import { FaExclamationCircle } from "react-icons/fa";
import { FiRefreshCcw } from "react-icons/fi";
import { Row, Col, Container, Card, CardBody, Button } from "reactstrap";
import { toast } from "utils/Toast.js";
// CONSTANTS
import { CONSTANTS as GLOBAL_CONSTANTS } from "@requestly/requestly-core";
// UTILS
import { redirectToAccountDetails } from "../../../utils/RedirectionUtils";
// FIREBASE
import { getFunctions, httpsCallable } from "firebase/functions";
import Jumbotron from "components/bootstrap-legacy/jumbotron";
const RefreshSubscription = () => {
  const mountedRef = useRef(true);
  // Component State
  const [isProcessing, setIsProcessing] = useState(false);

  const doRefreshSubscription = () => {
    setIsProcessing(true);
    const functions = getFunctions();
    const refreshSubscription = httpsCallable(functions, "refreshSubscription");

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
                    <Button
                      className="btn-icon btn-3"
                      color="primary"
                      type="button"
                      disabled={isProcessing}
                      onClick={doRefreshSubscription}
                    >
                      <span className="btn-inner--icon">
                        <b>
                          <FiRefreshCcw className={isProcessing ? "icon-spin" : ""} />
                        </b>
                      </span>
                      <span className="btn-inner--text">Refresh Subscription</span>
                    </Button>
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
