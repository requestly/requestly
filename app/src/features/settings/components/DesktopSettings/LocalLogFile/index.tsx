import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import FEATURES from "config/constants/sub/features";
import { isFeatureCompatible } from "utils/CompatibilityUtils";
import { useGrowthBook } from "@growthbook/growthbook-react";
import { Col, Row, Switch, Tooltip } from "antd";
import { RQButton, RQInput } from "lib/design-system/components";
import {
  trackLocalLogFileConfigToggled,
  trackLocalLogFileFilterAdded,
  trackLocalLogFileFilterRemoved,
} from "features/settings/analytics";
import { AiOutlineClose } from "@react-icons/all-files/ai/AiOutlineClose";
import { debounce } from "lodash";

import "./localLogFile.scss";
import {
  getAllConfig,
  setFilterConfig,
  setIsEnabledConfig,
  // setLogStorePathConfig
} from "./actions";
import { toast } from "utils/Toast";

const LocalLogFile: React.FC = () => {
  /* STATE */
  const [logStorePath, setLogStorePath] = useState<string>("");
  const [isEnabled, setIsEnabled] = useState<boolean>(false);
  const [filter, setFilter] = useState<string[]>([]);
  // const [isSelectingFile, setIsSelectingFile] = useState<boolean>(false);

  const isFlagForFeatureEnabled = useGrowthBook().getFeatureValue(FEATURES.LOCAL_LOG_FILE, false);
  const isCompatible = isFeatureCompatible(FEATURES.LOCAL_LOG_FILE);

  const isFeatureVisible = useMemo(() => {
    return isFlagForFeatureEnabled && isCompatible;
  }, [isFlagForFeatureEnabled, isCompatible]);

  const isFilterUIEnabled = useMemo(() => {
    return isEnabled && logStorePath;
  }, [isEnabled, logStorePath]);

  const [filterInputValue, setFilterInputValue] = useState<string>("");
  /* Automatic Trigger update */
  const isFirstRender = useRef(true);
  useEffect(() => {
    if (isFirstRender.current) {
      if (isCompatible) {
        getAllConfig()
          .then((res) => {
            setLogStorePath(res.storePath);
            setIsEnabled(res.isEnabled);
            setFilter(res.filter);
          })
          .catch((err) => {
            console.error("DBG: Error fetching offline log config", err);
          });
      }
      isFirstRender.current = false;
    }
  }, [isCompatible]);

  /* HANDLERS */
  const handleToggle = useCallback((newStatus: boolean) => {
    setIsEnabled(newStatus);
    setIsEnabledConfig(newStatus).catch((err) => {
      console.error("DBG: Error setting offline log config", err);
      toast.error("Error updating offline log config");
      setIsEnabled(!newStatus);
    });
    trackLocalLogFileConfigToggled(newStatus);
  }, []);

  const handleAddFilter = useCallback(() => {
    const newFilter = filterInputValue.trim();
    if (filter.includes(newFilter)) {
      return;
    }

    const newFilters = [newFilter, ...filter];
    setFilter(newFilters);

    setFilterConfig(newFilters).catch((err) => {
      console.error("DBG: Error adding filter", err);
      toast.error("Error adding filter");
      setFilter(filter);
    });

    setFilterInputValue("");
    trackLocalLogFileFilterAdded();
  }, [filter, filterInputValue]);

  const handleRemoveFilter = useCallback(
    (index: number) => {
      const newFilter = filter.filter((_, i) => i !== index);
      setFilterConfig(newFilter)
        .then(() => {
          toast.success("Successfully removed filter");
        })
        .catch((err) => {
          console.error("DBG: Error removing filter", err);
          toast.error("Error removing filter");
          setFilter(filter);
        });
      setFilter(newFilter);
      trackLocalLogFileFilterRemoved();
    },
    [filter]
  );

  // intended to be one of many settings inside desktop settings page
  return isFeatureVisible ? (
    <div className="w-full setting-item-container">
      <Row align="middle">
        <Col span={22}>
          <div className="title">Session Logs Storage</div>
          <div className="setting-item-caption">
            <span>Save the session logs for the matching requests to a local file.</span>
            <p>Logs get cleared at every app launch/restart</p>
          </div>
        </Col>
        <Col span={2} style={{ alignSelf: "self-start", marginTop: "8px" }}>
          <Tooltip title={`${isEnabled ? "Stop" : "Start"} saving logs to the file`}>
            <Switch checked={isEnabled} onChange={handleToggle} />
          </Tooltip>
        </Col>
      </Row>
      <Row>
        <Col span={3}>Log Path: </Col>
        <Col span={18}>{logStorePath ? <>{logStorePath}/interceptor_logs.jsonl</> : null}</Col>
      </Row>
      <div className={`setting-item-body ${isEnabled ? "" : "disabled"}`}>
        <div className={`filter-body ${isFilterUIEnabled ? "" : "disabled"}`}>
          <Row align={"middle"} justify={"space-between"} className="header-row">
            <Col span={21}>
              <RQInput
                placeholder="URL contains ..."
                onChange={(e) => setFilterInputValue(e.target.value)}
                onPressEnter={handleAddFilter}
                value={filterInputValue}
              />
            </Col>
            <Col span={2}>
              <RQButton onClick={handleAddFilter} type="primary">
                Add
              </RQButton>
            </Col>
          </Row>
          <Row className="filter-subheading">Any Request URL that contains this keyword/domain will be saved.</Row>
          <div className="filter-container">
            {filter.map((blockedDomain, index) => (
              <Row className="filter-substring-container" align={"middle"} justify={"space-between"} key={index}>
                <Col span={23}>{blockedDomain}</Col>
                <Col className="filter-remove" onClick={debounce(() => handleRemoveFilter(index), 100)}>
                  <AiOutlineClose />
                </Col>
              </Row>
            ))}
          </div>
        </div>
      </div>
    </div>
  ) : null;
};

export default LocalLogFile;
