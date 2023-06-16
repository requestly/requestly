import React from "react";
import { Card, Col, Divider, Row, Typography } from "antd";
import changeLogs, { VERSION_NEXT } from "./changeLogs";
import { getExtensionVersion } from "actions/ExtensionActions";
import * as semver from "semver";

const VersionedChangelogs: React.FC = () => {
  const currentRequestlyVersion = getExtensionVersion() || "0.0.0";

  return (
    <>
      {changeLogs.map((changeLog) => {
        if (changeLog.version !== VERSION_NEXT && semver.lte(changeLog.version, currentRequestlyVersion)) {
          return (
            <div key={changeLog.version}>
              <Typography.Title level={4} style={{ margin: 0 }}>
                {`v${changeLog.version}`}
              </Typography.Title>
              <ul>
                {changeLog.logs.map((log, index) => {
                  return (
                    <li key={`${changeLog.version}_${index}`}>
                      {log.title} {log.link ? <a href={log.link}>Read More</a> : null}
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        }
        return null;
      })}
    </>
  );
};

const Updates: React.FC = () => {
  return (
    <>
      <div>
        <Row>
          <Col span={24}>
            <Card title={null} bordered={false} className="primary-card" bodyStyle={{ color: "#c2c2c2" }}>
              <Typography.Title level={2}>
                Congratulations 🎉 Requestly has been upgraded to {getExtensionVersion()}
              </Typography.Title>
              <Divider orientation="left">
                <Typography.Title level={4} style={{ margin: 0 }}>
                  Here are the things that we changed
                </Typography.Title>
              </Divider>
              <VersionedChangelogs />
            </Card>
          </Col>
        </Row>
      </div>
    </>
  );
};

export default React.memo(Updates);
