import { useEffect, useState } from "react";
import { Col, Row } from "antd";
import SettingsItem from "../SettingsItem";
import { RQButton, RQInput } from "lib/design-system/components";
import { toast } from "utils/Toast";
import { StorageService } from "init";
import { useSelector } from "react-redux";
import { getAppMode } from "store/selectors";
import { CONSTANTS as GLOBAL_CONSTANTS } from "@requestly/requestly-core";
import { prefixUrlWithHttps } from "utils/URLUtils";
import "./blocklist.scss";
import { CloseOutlined } from "@ant-design/icons";

export const BlockList = () => {
  const [blockedDomains, setBlockedDomains] = useState<string[]>([]);
  const [inputValue, setInputValue] = useState<string>("");
  const appMode = useSelector(getAppMode);

  const handleAddDomain = () => {
    try {
      const formattedInputValue = prefixUrlWithHttps(inputValue);
      const inputUrl = new URL(formattedInputValue);

      if (!inputUrl.host.includes(".")) {
        throw new Error("Invalid domain");
      }

      if (blockedDomains.includes(inputUrl.host)) {
        toast.error("Blocked domain already exists");
        return;
      }
      const newBlockedDomains = [...blockedDomains, inputUrl.host];

      setBlockedDomains(newBlockedDomains);
      StorageService(appMode)
        .saveRecord({ [GLOBAL_CONSTANTS.STORAGE_KEYS.BLOCKED_DOMAINS]: newBlockedDomains })
        .then(() => {
          toast.success("Successfully added.");
          setInputValue("");
        });
    } catch (e) {
      toast.error("please enter a valid URL or domain");
    }
  };

  const handleRemoveDomain = (index: number) => {
    const newBlockedDomains = blockedDomains.filter((_, i) => i !== index);
    setBlockedDomains(newBlockedDomains);
    StorageService(appMode)
      .saveRecord({ [GLOBAL_CONSTANTS.STORAGE_KEYS.BLOCKED_DOMAINS]: newBlockedDomains })
      .then(() => {
        toast.success("Successfully removed.");
        setInputValue("");
      });
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
          <Row align={"middle"} justify={"space-between"} className="header-row">
            <Col span={21}>
              <RQInput
                placeholder="Enter URL"
                onChange={(e) => setInputValue(e.target.value)}
                onPressEnter={handleAddDomain}
              />
            </Col>
            <Col span={2}>
              <RQButton onClick={handleAddDomain} type="primary">
                Add
              </RQButton>
            </Col>
          </Row>
          <Row className="blocklist-subheading">Adding a domain will include all its subdomains.</Row>
          {blockedDomains.map((blockedDomain, index) => (
            <>
              <Row className="blocklist-domains-container" align={"middle"} justify={"space-between"}>
                <Col span={23}>{blockedDomain}</Col>
                <Col className="blocklist-close-icon" onClick={() => handleRemoveDomain(index)}>
                  <CloseOutlined className="icon__wrapper" />
                </Col>
              </Row>
            </>
          ))}
        </div>
      }
      isTogglable={false}
    />
  );
};
