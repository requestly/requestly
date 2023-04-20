import { useCallback, useEffect, useState } from "react";
import { AutoComplete, Col, Row } from "antd";
import { getFirestore, onSnapshot, doc } from "firebase/firestore";

import firebaseApp from "../../../../../../firebase";
import CopyButton from "components/misc/CopyButton";

const db = getFirestore(firebaseApp);

const DeviceSelector = ({ sdkId, deviceIdInput, setSelectedDeviceId, updateDeviceIdInput }) => {
  const [availableDeviceIds, setAvailableDeviceIds] = useState([]);
  const [autoCompleteOptions, setAutoCompleteOptions] = useState([]);
  const getOptionObject = (arrayData) => {
    if (arrayData) {
      let optionsData = arrayData.map((data) => {
        return {
          value: data,
        };
      });
      return optionsData;
    }
    return [];
  };
  // Add listener for available devices
  useEffect(() => {
    let unsubscribeDeviceListListener;
    if (sdkId) {
      unsubscribeDeviceListListener = onSnapshot(doc(db, "sdks", sdkId), async (snapshot) => {
        if (snapshot) {
          const sdkData = snapshot.data();
          let deviceIds = [];
          if (sdkData?.devices) {
            // device = {id: "", model: "", name: "" }
            deviceIds = sdkData.devices.map((device) => {
              return device?.id;
            });
          }
          setAvailableDeviceIds(deviceIds || []);
        }
      });
    }
    return () => {
      if (unsubscribeDeviceListListener) unsubscribeDeviceListListener();
    };
  }, [sdkId]);

  const matchInputToAvailableIds = (query) => {
    if (query) {
      // return availableDeviceIds.filter((id) => {
      //   return id.startsWith(query);
      // });
      // https://stackoverflow.com/a/28321100/11565176
      let reg = new RegExp(query.split("-").join("\\w*").replace(/\W/, ""), "i");
      return availableDeviceIds.filter((id) => {
        if (id.match(reg)) return true;
        else return false;
      });
    }

    return [];
  };

  const stableMatchInputToAvailableIds = useCallback(matchInputToAvailableIds, [availableDeviceIds]);

  const renderSdkDeviceSelector = () => {
    return (
      <AutoComplete
        options={autoCompleteOptions}
        placeholder="Enter deviceId"
        onSelect={(value) => {
          setSelectedDeviceId(value);
          updateDeviceIdInput(value);
        }}
        onSearch={handleAutocompleteSearch}
        style={{ width: "100%" }}
        onChange={(value) => updateDeviceIdInput(value)}
        value={deviceIdInput}
        // notFoundContent={"No Device Ids Found"}
      />
    );
  };

  const handleAutocompleteSearch = (val) => {
    let matches = stableMatchInputToAvailableIds(val);
    setAutoCompleteOptions(getOptionObject(matches));
  };

  const stableHandleAutocompleteSearch = useCallback(handleAutocompleteSearch, [stableMatchInputToAvailableIds]);

  useEffect(() => {
    stableHandleAutocompleteSearch();
  }, [availableDeviceIds, stableHandleAutocompleteSearch]);

  return (
    <>
      <Row gutter={[8]} align="middle" style={{ paddingLeft: "24px" }}>
        <Col span={10}>{renderSdkDeviceSelector()}</Col>
        <Col>
          <CopyButton copyText={deviceIdInput} />
        </Col>
      </Row>
    </>
  );
};

export default DeviceSelector;
