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
  // trackLocalLogFileStorePathCleared,
  // trackLocalLogFileStorePathSelectionCompleted,
  // trackLocalLogFileStorePathSelectionFailed,
  // trackLocalLogFileStorePathSelectionStarted,
} from "features/settings/analytics";
// import { displayFolderSelector } from "components/mode-specific/desktop/misc/FileDialogButton";
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

const OfflineLogConfig: React.FC = () => {
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

  // const handleSelectFile = () => {
  //   setIsSelectingFile(true);
  //   trackLocalLogFileStorePathSelectionStarted();

  //   displayFolderSelector(
  //     (dirPath: string) => {
  //       setIsSelectingFile(false);
  //       setLogStorePath(dirPath);
  //       setLogStorePathConfig(dirPath).catch((err) => {
  //         console.error("DBG: Error setting log store path", err);
  //         toast.error("Error setting log directory");
  //         trackLocalLogFileStorePathSelectionFailed("IPC");
  //       });
  //       trackLocalLogFileStorePathSelectionCompleted();
  //     },
  //     () => {
  //       // on cancelled
  //       setIsSelectingFile(false);
  //       trackLocalLogFileStorePathSelectionFailed("CANCELLED");
  //     }
  //   );
  //   setTimeout(() => {
  //     // safe-gaurd: just incase un-responsive channels are used somewhere
  //     setIsSelectingFile(false);
  //   }, 10000);
  // };

  // const handleCleaSelectedFile = () => {
  //   setLogStorePath("");
  //   setLogStorePathConfig("").catch((err) => {
  //     console.error("DBG: Error clearing log store path", err);
  //     toast.error("Error clearing log directory");
  //   });

  //   setIsEnabled(false);
  //   setIsEnabledConfig(false).catch((err) => {
  //     console.error("DBG: Error disabling offline log config", err);
  //     toast.error("Error disabling offline logging");
  //   });

  //   trackLocalLogFileStorePathCleared();
  // };

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
            <span>Save the logs you need to a local file.</span>
            <p>Remember, logs get cleared whenever the app is relaunched</p>
          </div>
        </Col>
        <Col span={2} style={{ alignSelf: "self-start", marginTop: "8px" }}>
          <Tooltip title="Enable to start saving logs to the file">
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
          <Row className="filter-subheading">
            Any Request URL that matches this keyword/domain will be saved in the file.
          </Row>
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
            {/* <RQButton type="primary" onClick={handleSelectFile} loading={isSelectingFile} disabled={!isEnabled}>
              {logStorePath ? "Change Folder" : "Select Folder"}
            </RQButton> */}

            {logStorePath ? <b>Logs file: </b> : null}
          </Col>
          <Col span={16}>{logStorePath ? <b>{logStorePath}/logs.jsonl</b> : null}</Col>
          {/* {logStorePath ? (
            <Col span={4} style={{ display: "flex", justifyContent: "flex-end" }}>
              <Tooltip title="stop storing logs">
                <RQButton type="default" onClick={handleCleaSelectedFile} disabled={!logStorePath}>
                  Clear
                </RQButton>
              </Tooltip>
            </Col>
          ) : null} */}
        </Row>
      </div>
    </div>
  ) : null;
};

export default OfflineLogConfig;
