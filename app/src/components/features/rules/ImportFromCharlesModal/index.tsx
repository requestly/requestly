import React, { useState } from "react";
import { useSelector } from "react-redux";
import { getAppMode } from "store/selectors";
import { RQButton, RQModal } from "lib/design-system/components";
import { FilePicker } from "components/common/FilePicker";
import { getXmlToJs } from "utils/charles-rule-adapters/getXmlToJs";
import { Row } from "antd";
import { createNewGroupAndSave } from "utils/charles-rule-adapters/utils";

export const ImportFromCharlesModal: React.FC = () => {
  const [isDataProcessing, setIsDataProcessing] = useState<boolean>(false);
  //   const [isCharlesRulesParsed, setIsCharlesRulesParsed] = useState<boolean>(false);
  const [rulesToImport, setRulesToImport] = useState([]);

  const appMode = useSelector(getAppMode);

  const onFilesDrop = async (files: File[]) => {
    const file = files[0];
    console.log({ file });
    const reader = new FileReader();

    // TODO: handle these cases
    //       // reader.onabort = () => toggleModal();
    //       // reader.onerror = () => toggleModal();

    reader.onload = () => {
      const fileContent = reader.result;
      setIsDataProcessing(true);

      console.log({ fileContent });

      getXmlToJs(fileContent as string, appMode)
        .then((importedRules: any) => {
          setIsDataProcessing(false);
          setRulesToImport(importedRules);
          console.log({ importedRules });
        })
        .catch((error) => {
          console.log(error);
        });
    };
    reader.readAsText(file);
  };

  const handleCharlesRulesImport = () => {
    rulesToImport.forEach(({ rules, status, groupName, appMode }) => {
      createNewGroupAndSave({
        appMode,
        rules,
        status,
        onError: () => {},
        onSuccess: () => {},
        groupName,
      });
    });
  };

  return (
    <RQModal open={true} centered>
      <div className="rq-modal-content">
        <div className="header text-center">Import Charles settings</div>
        <div className="mt-16">
          {rulesToImport.length ? (
            <div className="text-center subtitle">Charles Settings successfully parsed</div>
          ) : (
            <FilePicker
              title="Drop your Charles export file, or click to select"
              onFilesDrop={onFilesDrop}
              maxFiles={1}
              isProcessing={isDataProcessing}
            />
          )}
        </div>
      </div>
      {rulesToImport.length ? (
        <div className="rq-modal-footer">
          <Row justify="end">
            <RQButton type="primary" onClick={handleCharlesRulesImport}>
              Import
            </RQButton>
          </Row>
        </div>
      ) : null}
    </RQModal>
  );
};
