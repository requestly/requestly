import React from "react";
import { Link } from "react-router-dom";
import { Button, Row, Col } from "antd";
import { LeftOutlined } from "@ant-design/icons";
import { isAppOpenedInIframe } from "utils/AppUtils";

const Error404 = () => {
  return (
    <>
      <Row className="hp-bg-color-primary-4 hp-bg-color-dark-90 hp-text-center">
        <Col className="hp-error-content hp-py-32" span={24}>
          <Row className="hp-h-100" align="middle" justify="center">
            <Col>
              <div className="hp-position-relative hp-mt-sm-0 hp-mt-64 hp-mb-32">
                <div className="hp-error-content-circle hp-bg-dark-100"></div>

                <img
                  className="hp-position-relative hp-d-block hp-m-auto"
                  src={"/assets/media/views/404.svg"}
                  alt="404"
                />
              </div>

              <h1 className="hp-error-content-title hp-mb-sm-0 hp-mb-8 hp-font-weight-300">404</h1>

              <h2 className="h1 hp-mb-sm-0 hp-mb-16">Oops, Page not found!</h2>

              {!isAppOpenedInIframe() && (
                <>
                  <p className="hp-mb-32 hp-p1-body">
                    You might be looking for something which is available in a particular workspace, try switching
                    workspaces.
                  </p>

                  <Link to="/">
                    <Button type="primary" icon={<LeftOutlined />}>
                      Back to Home
                    </Button>
                  </Link>
                </>
              )}
            </Col>
          </Row>
        </Col>
      </Row>
    </>
  );
};

export default Error404;
