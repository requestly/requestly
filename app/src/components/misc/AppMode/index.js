import React from "react";
import { useSelector } from "react-redux";
import { Col, Row, Container, Card, CardBody, CardTitle } from "reactstrap";
// UTILS
import { getPrettyAppModeName } from "../../../utils/FormattingHelper";
import { getAppMode } from "../../../store/selectors";
// DATA
import { AppModesConfig } from "../../sections/Navbars/components/sub/AppModeSelector/data";
import { FaExternalLinkAlt } from "react-icons/fa";
import Jumbotron from "components/bootstrap-legacy/jumbotron";

const AppMode = () => {
  //GLOBAL STATE
  const currentAppMode = useSelector(getAppMode);

  return (
    <React.Fragment>
      {/* Page content */}
      <Container className=" mt--7 sm-margin-top-negative-3" fluid>
        {/* Table */}
        <Row>
          <Col>
            <Card className="shadow">
              <CardBody>
                <Jumbotron style={{ background: "transparent" }}>
                  <Row className="mb-4 ">
                    <Col className="text-center">
                      <h2>Requestly is available as</h2>
                    </Col>
                  </Row>
                  <Row>
                    {Object.keys(AppModesConfig).map((appMode) => {
                      return (
                        <Col md="6 mb-6" key={appMode}>
                          <Card
                            className={`card-stats mb-4 mb-lg-0 reduce-opacity-on-hover ${
                              AppModesConfig[appMode].actionLink
                                ? "cursor-pointer"
                                : "cursor-disabled"
                            } `}
                            onClick={() =>
                              AppModesConfig[appMode].actionLink
                                ? window.open(
                                    AppModesConfig[appMode].actionLink,
                                    "_blank"
                                  )
                                : null
                            }
                          >
                            <CardBody>
                              <Row>
                                <div className="col">
                                  <CardTitle className="text-uppercase text-muted ">
                                    {getPrettyAppModeName(appMode)}
                                    {currentAppMode === appMode ? (
                                      <span className="badge badge-pill badge-sm badge-success ml-2">
                                        Current
                                      </span>
                                    ) : null}
                                  </CardTitle>
                                  <span>
                                    {AppModesConfig[appMode].description}
                                  </span>
                                </div>
                                <Col className="col-auto">
                                  <div
                                    className={`icon icon-shape text-white rounded-circle shadow bg-gradient-${AppModesConfig[appMode].iconBackgroundColor}`}
                                    style={{ fontSize: "1.5em" }}
                                  >
                                    {React.createElement(
                                      AppModesConfig[appMode].Icon
                                    )}
                                  </div>
                                </Col>
                              </Row>
                              <p className="mt-3  text-muted text-sm">
                                {appMode === currentAppMode ? (
                                  <span className="text-nowrap">
                                    You are currently using Requestly{" "}
                                    {getPrettyAppModeName(appMode)}
                                  </span>
                                ) : (
                                  <span className="text-nowrap">
                                    {AppModesConfig[appMode].actionLabel}
                                    {AppModesConfig[appMode].actionLink ? (
                                      <FaExternalLinkAlt className="ml-2 fix-icon-is-down" />
                                    ) : null}
                                  </span>
                                )}
                              </p>
                            </CardBody>
                          </Card>
                        </Col>
                      );
                    })}
                  </Row>
                </Jumbotron>
              </CardBody>
            </Card>
          </Col>
        </Row>
      </Container>
    </React.Fragment>
  );
};
export default AppMode;
