import React from "react";
import { EnvironmentData, RQAPI } from "@requestly/shared/types/entities/apiClient";
import { ParsedEntityCollapse } from "./ParsedEntityCollapse/ParsedEntityCollapse";
import { CgStack } from "@react-icons/all-files/cg/CgStack";
import { MdHorizontalSplit } from "@react-icons/all-files/md/MdHorizontalSplit";
import { Row } from "antd";
import { RQButton } from "lib/design-system-v2/components";

export interface SuccessfulParseViewProps {
  collectionsData: RQAPI.CollectionRecord[];
  environmentsData: EnvironmentData[];
  isLoading: boolean;
  handleImportData: (collections?: RQAPI.CollectionRecord[], environments?: EnvironmentData[]) => void;
  onBack?: () => void;
}

export const SuccessfulParseView: React.FC<SuccessfulParseViewProps> = ({
  collectionsData,
  environmentsData,
  isLoading,
  handleImportData,
}) => {
  return (
    <>
      <div className="imported-entities-container">
        <ParsedEntityCollapse
          title="Collections"
          icon={<CgStack className="check-outlined-icon" />}
          count={collectionsData.length}
        >
          {collectionsData.map((collection) => (
            <div key={collection.id}>{collection.name}</div>
          ))}
        </ParsedEntityCollapse>
        {environmentsData.length > 0 ? (
          <ParsedEntityCollapse
            title="Environments"
            icon={<MdHorizontalSplit className="check-outlined-icon" />}
            count={environmentsData.length}
          >
            {environmentsData.map((environment) => (
              <div key={environment.id}>{environment.name}</div>
            ))}
          </ParsedEntityCollapse>
        ) : null}
      </div>
      <Row justify="end" className="importer-actions-row">
        <RQButton type="primary" loading={isLoading} onClick={() => handleImportData()}>
          Import
        </RQButton>
      </Row>
    </>
  );
};
