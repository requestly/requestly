import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Col, Row } from "antd";
import SettingsItem from "../SettingsItem";
import { RQButton, RQInput } from "lib/design-system/components";
import { toast } from "utils/Toast";
import { useSelector } from "react-redux";
import { getAppMode } from "store/selectors";
import { CONSTANTS as GLOBAL_CONSTANTS } from "@requestly/constants";
import { prefixUrlWithHttps } from "utils/URLUtils";
import "./blocklist.scss";
import { AiOutlineClose } from "@react-icons/all-files/ai/AiOutlineClose";
import { debounce } from "lodash";
import { trackBlockListUpdated } from "modules/analytics/events/misc/settings";
import { clientStorageService } from "services/clientStorageService";

export const BlockList = () => {
  const [searchParams] = useSearchParams();

  const [blockedDomains, setBlockedDomains] = useState<string[]>([]);
  const [inputValue, setInputValue] = useState<string>("");
  const appMode = useSelector(getAppMode);

  const source = searchParams.get("source") ?? "settings";

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
      clientStorageService
        .saveStorageObject({ [GLOBAL_CONSTANTS.STORAGE_KEYS.BLOCKED_DOMAINS]: newBlockedDomains })
        .then(() => {
          toast.success("Successfully added.");
          setInputValue("");
          trackBlockListUpdated({
            action: "add",
            url: inputUrl.host,
            block_list: newBlockedDomains,
            source: source,
          });
        });
    } catch (e) {
      toast.error("Please enter a valid URL or domain");
    }
  };

  const handleRemoveDomain = (index: number) => {
    const domainToRemove = blockedDomains[index];
    const newBlockedDomains = blockedDomains.filter((_, i) => i !== index);
    setBlockedDomains(newBlockedDomains);
    clientStorageService
      .saveStorageObject({ [GLOBAL_CONSTANTS.STORAGE_KEYS.BLOCKED_DOMAINS]: newBlockedDomains })
      .then(() => {
        toast.success("Successfully removed.");
        setInputValue("");
        trackBlockListUpdated({
          action: "remove",
          url: domainToRemove,
          block_list: newBlockedDomains,
          source: source,
        });
      });
  };

  useEffect(() => {
    clientStorageService.getStorageObject(GLOBAL_CONSTANTS.STORAGE_KEYS.BLOCKED_DOMAINS).then((blockedDomains) => {
      setBlockedDomains(blockedDomains ?? []);
    });
  }, [appMode]);

  return (
    <SettingsItem
      isActive={true}
      onChange={() => {}}
      title="Blocked Sites"
      caption="HTTP rules and SessionBook won't work on these sites"
      settingsBody={
        <div className="blocklist-body">
          <Row align={"middle"} justify={"space-between"} className="header-row">
            <Col span={21}>
              <RQInput
                placeholder="Enter URL"
                onChange={(e) => setInputValue(e.target.value)}
                onPressEnter={handleAddDomain}
                value={inputValue}
              />
            </Col>
            <Col span={2}>
              <RQButton onClick={handleAddDomain} type="primary">
                Add
              </RQButton>
            </Col>
          </Row>
          <Row className="blocklist-subheading">Adding a domain will include all its subdomains.</Row>
          <div className="blocklist-container">
            {blockedDomains.map((blockedDomain, index) => (
              <Row className="blocklist-domains-container" align={"middle"} justify={"space-between"} key={index}>
                <Col span={23}>{blockedDomain}</Col>
                <Col className="blocklist-close-icon" onClick={debounce(() => handleRemoveDomain(index), 100)}>
                  <AiOutlineClose />
                </Col>
              </Row>
            ))}
          </div>
        </div>
      }
      isTogglable={false}
    />
  );
};
