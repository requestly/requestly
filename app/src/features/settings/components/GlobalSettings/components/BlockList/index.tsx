import { useEffect, useState } from "react";
import { Col, Input, Row, Typography } from "antd";
import SettingsItem from "../SettingsItem";
import { RQButton } from "lib/design-system/components";
import { toast } from "utils/Toast";
import { StorageService } from "init";
import { useSelector } from "react-redux";
import { getAppMode } from "store/selectors";
import { CONSTANTS as GLOBAL_CONSTANTS } from "@requestly/requestly-core";
import { prefixUrlWithHttps } from "utils/URLUtils";

export const BlockList = () => {
  const [blockedDomains, setBlockedDomains] = useState<string[]>([]);
  const [inputValue, setInputValue] = useState<string>("");
  const appMode = useSelector(getAppMode);

  const handleAddDomain = () => {
    try {
      const formattedInputValue = prefixUrlWithHttps(inputValue);
      const inputUrl = new URL(formattedInputValue);

      setBlockedDomains((prev) => {
        return [...prev, inputUrl.host];
      });
      StorageService(appMode)
        .saveRecord(GLOBAL_CONSTANTS.STORAGE_KEYS.BLOCKED_DOMAINS)
        .then(() => {
          toast.success("Successfully added.");
        });
    } catch (e) {
      toast.error("please enter a valid URL or domain");
    }
  };

  useEffect(() => {
    StorageService(appMode)
      .getRecord(GLOBAL_CONSTANTS.STORAGE_KEYS.BLOCKED_DOMAINS)
      .then((blockedDomains) => {
        setBlockedDomains(blockedDomains ?? []);
      });
  }, [appMode]);

  return (
    <SettingsItem
      isActive={true}
      onChange={null}
      title="Blocked Sites"
      caption="HTTP rules and SessionBook wont't work on these sites"
      settingsBody={
        <div className="blocklist-body">
          <Row align={"middle"}>
            <Col span={20}>
              <Input placeholder="Enter URL" onChange={(e) => setInputValue(e.target.value)} />
            </Col>
            <Col>
              <RQButton
                onClick={() => {
                  handleAddDomain();
                }}
              >
                Add
              </RQButton>
            </Col>
          </Row>
          {blockedDomains.map((blockedDomain) => (
            <Row>
              <Typography.Text>{blockedDomain}</Typography.Text>
            </Row>
          ))}
        </div>
      }
      isTogglable={false}
    />
  );
};
