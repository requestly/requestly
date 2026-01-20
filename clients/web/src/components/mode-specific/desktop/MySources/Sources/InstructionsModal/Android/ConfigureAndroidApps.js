import { Col, List, Row } from "antd";

const ConfigureAndroidApps = () => {
  return (
    <div>
      <Row>
        <Col span={16}>
          <List itemLayout="horizontal">
            <List.Item>
              <List.Item.Meta
                title="You will need to make a custom build where you allow Requestly to read your newtwork traffic"
                description="make sure to remove this from production builds"
              />
            </List.Item>
            <List.Item>
              <List.Item.Meta
                title="a. Add the following to res/xml/network_security_config.xml"
                description={
                  <pre>
                    <code>
                      {`<network-security-config>
  <debug-overrides>
    <trust-anchors>
      <certificates src="user" />
      <certificates src="system" />
    </trust-anchors>
  </debug-overrides>

  <base-config cleartextTrafficPermitted="true">
    <trust-anchors>
      <certificates src="system" />
      <certificates src="user" />
    </trust-anchors>
  </base-config>
</network-security-config>`}
                    </code>
                  </pre>
                }
              />
            </List.Item>
            <List.Item>
              <List.Item.Meta
                title="b.Add to AndroidManifest.xml"
                description={
                  <pre>
                    <code>
                      {`<?xml version="1.0" encoding="utf-8"?>
<manifest ... >
    <application android:networkSecurityConfig="@xml/network_security_config" ... >
    ...
    </application>
</manifest>`}
                    </code>
                  </pre>
                }
              />
            </List.Item>
          </List>
        </Col>
      </Row>
    </div>
  );
};

export default ConfigureAndroidApps;
