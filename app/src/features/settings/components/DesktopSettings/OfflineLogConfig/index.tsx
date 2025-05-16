import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import FEATURES from "config/constants/sub/features";
import { isFeatureCompatible } from "utils/CompatibilityUtils";
import { useGrowthBook } from "@growthbook/growthbook-react";
import { Col, Row, Switch, Tooltip } from "antd";
import { RQButton, RQInput } from "lib/design-system/components";
import {
  trackOfflineLogConfigToggled,
  trackOfflineLogFilterAdded,
  trackOfflineLogFilterRemoved,
  trackOfflineLogStorePathCleared,
  trackOfflineLogStorePathFileSelectionCompleted,
  trackOfflineLogStorePathFileSelectionFailed,
  trackOfflineLogStorePathFileSelectionStarted,
} from "features/settings/analytics";
import { displayFolderSelector } from "components/mode-specific/desktop/misc/FileDialogButton";
import { AiOutlineClose } from "@react-icons/all-files/ai/AiOutlineClose";
import { debounce } from "lodash";

import "./OfflineLogConfig.scss";
import { getAllConfig, setFilterConfig, setIsEnabledConfig, setLogStorePathConfig } from "./actions";
import { toast } from "utils/Toast";

const OfflineLogConfig: React.FC = () => {
  /* STATE */
  const [logStorePath, setLogStorePath] = useState<string>("");
  const [isEnabled, setIsEnabled] = useState<boolean>(false);
  const [filter, setFilter] = useState<string[]>([]);
  const [isSelectingFile, setIsSelectingFile] = useState<boolean>(false);

  const isFlagForFeatureEnabled = useGrowthBook().getFeatureValue(FEATURES.OFFLINE_LOGS, true);
  const isCompatible = isFeatureCompatible(FEATURES.OFFLINE_LOGS);

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
            console.log("DBG: Offline log config", res);
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
    console.log("DBG: Toggle offline log config", newStatus);
    setIsEnabled(newStatus);
    setIsEnabledConfig(newStatus).catch((err) => {
      console.error("DBG: Error setting offline log config", err);
      toast.error("Error updating offline log config");
      setIsEnabled(!newStatus);
    });
    trackOfflineLogConfigToggled(newStatus);
  }, []);

  const handleSelectFile = () => {
    setIsSelectingFile(true);
    trackOfflineLogStorePathFileSelectionStarted();

    displayFolderSelector(
      (dirPath: string) => {
        setIsSelectingFile(false);
        setLogStorePath(dirPath);
        setLogStorePathConfig(dirPath).catch((err) => {
          console.error("DBG: Error setting log store path", err);
          toast.error("Error setting log directory");
          trackOfflineLogStorePathFileSelectionFailed("IPC");
        });
        trackOfflineLogStorePathFileSelectionCompleted();
      },
      () => {
        // on cancelled
        setIsSelectingFile(false);
        trackOfflineLogStorePathFileSelectionFailed("CANCELLED");
      }
    );
    setTimeout(() => {
      // safe-gaurd: just incase un-responsive channels are used somewhere
      setIsSelectingFile(false);
    }, 10000);
  };

  const handleCleaSelectedFile = () => {
    setLogStorePath("");
    setLogStorePathConfig("").catch((err) => {
      console.error("DBG: Error clearing log store path", err);
      toast.error("Error clearing log directory");
    });

    setIsEnabled(false);
    setIsEnabledConfig(false).catch((err) => {
      console.error("DBG: Error disabling offline log config", err);
      toast.error("Error disabling offline logging");
    });

    trackOfflineLogStorePathCleared();
  };

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
    trackOfflineLogFilterAdded();
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
      trackOfflineLogFilterRemoved();
    },
    [filter]
  );

  // intended to be one of many settings inside desktop settings page
  return isFeatureVisible ? (
    <div className="w-full setting-item-container">
      <Row align="middle">
        <Col span={22}>
          <div className="title">Dump Logs to a file</div>
        </Col>
        <Col span={2} style={{ alignSelf: "self-start", marginTop: "8px" }}>
          <Tooltip title="Enable to dump logs to a file">
            <Switch checked={isEnabled} onChange={handleToggle} />
          </Tooltip>
        </Col>
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
          <Row className="filter-subheading">Add a substring to match for the URL to be stored</Row>
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

        <Row align="middle" justify="space-evenly" className="path-selector ">
          <Col span={4}>
            {/* select file button */}
            <RQButton type="primary" onClick={handleSelectFile} loading={isSelectingFile} disabled={!isEnabled}>
              {logStorePath ? "Change File" : "Select File"}
            </RQButton>
          </Col>
          <Col span={16}>{logStorePath ? <strong>Log directory: {logStorePath}</strong> : null}</Col>
          {logStorePath ? (
            <Col span={4} style={{ display: "flex", justifyContent: "flex-end" }}>
              <Tooltip title="stop storing logs">
                <RQButton type="default" onClick={handleCleaSelectedFile} disabled={!logStorePath}>
                  Clear
                </RQButton>
              </Tooltip>
            </Col>
          ) : null}
        </Row>
      </div>
    </div>
  ) : null;
};

export default OfflineLogConfig;
