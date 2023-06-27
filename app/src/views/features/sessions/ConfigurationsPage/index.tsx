import React, { useCallback, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { Col, Radio, Row, Switch } from "antd";
import { ConfigurationRadioItem } from "./ConfigurationRadioItem";
import "./configurations.css";

const ConfigurationsPage: React.FC = () => {
  const { test } = useOutletContext<{ test: string }>();
  const [isAutomaticRecordingEnabled, setIsAutomaticRecordingEnabled] = useState(false);

  console.log({ test });

  const handleAutomaticRecordingStatus = useCallback((status: boolean) => {
    setIsAutomaticRecordingEnabled(status);
  }, []);

  return (
    <Row className="sessions-configuration-container">
      <Col
        xs={{ offset: 1, span: 22 }}
        sm={{ offset: 1, span: 22 }}
        md={{ offset: 2, span: 20 }}
        lg={{ offset: 3, span: 18 }}
        xl={{ offset: 4, span: 16 }}
        flex="1 1 820px"
      >
        {/* TODO: add a back button */}
        <div className="header">Session Recording Settings</div>

        <div className="automatic-recording">
          <div className="automatic-recording-details">
            <div className="heading">Automatic recording</div>
            <div className="caption">Adjust the automatic recording rules</div>
          </div>

          <div className="automatic-recording-switch">
            <span>{isAutomaticRecordingEnabled ? "Enabled" : "Disabled"}</span>
            <Switch checked={isAutomaticRecordingEnabled} onChange={handleAutomaticRecordingStatus} />
          </div>

          <Radio.Group className="automatic-recording-radio-group">
            <Row align="bottom" justify="space-between">
              <Col span={14}>
                <ConfigurationRadioItem
                  value={""}
                  title="Auto Mode"
                  caption="Save up to last 5 minutes of activity on any tab whenever required."
                />
              </Col>

              <Col span={10}>
                <Row>
                  {/* TODO: update link */}
                  <a href="/" target="_blank" rel="noreferrer" className="learn-more-link ml-auto">
                    Learn how we made auto-mode safe & automatic data
                  </a>
                </Row>
              </Col>
            </Row>
            <ConfigurationRadioItem
              value={""}
              title="Rule Mode"
              caption="Start recording automatically when you visit websites or URLs below."
            />
          </Radio.Group>
        </div>
      </Col>
    </Row>
  );
};

export default ConfigurationsPage;
