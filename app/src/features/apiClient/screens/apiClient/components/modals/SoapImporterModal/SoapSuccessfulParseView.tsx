import React, { useMemo, useState } from "react";
import { Select, Row } from "antd";
import { RQButton } from "lib/design-system-v2/components";
import { cloneDeep } from "lodash";
import { RQAPI } from "@requestly/shared/types/entities/apiClient";
import { SuccessfulParseViewProps } from "../../CommonApiClientImporter/components/SuccessfulParseView";
import "./soapSuccessfulParseView.scss";

export enum SoapVersion {
  V1_1 = "1.1",
  V1_2 = "1.2",
}

export enum CollectionOrganisation {
  PORT_ENDPOINT = "PORT_ENDPOINT",
  NO_FOLDERS = "NO_FOLDERS",
}

export const SoapSuccessfulParseView: React.FC<SuccessfulParseViewProps> = ({
  collectionsData,
  environmentsData,
  isLoading,
  handleImportData,
  onBack,
}) => {
  const firstRootCollection = collectionsData[0];
  const childrenCount = firstRootCollection?.data?.children?.length || 0;
  const hasMultipleVersions = childrenCount >= 2;
  const [selectedVersion, setSelectedVersion] = useState<SoapVersion>(SoapVersion.V1_2);
  const [organisation, setOrganisation] = useState<CollectionOrganisation>(CollectionOrganisation.PORT_ENDPOINT);

  const rawTargetCollections = useMemo(() => {
    return collectionsData
      .map((rootCollection) => {
        if (!rootCollection) return undefined;
        const children = rootCollection.data.children || [];

        if (hasMultipleVersions) {
          const targetIndex = selectedVersion === SoapVersion.V1_1 ? 0 : 1;
          const childRecord = children[targetIndex];

          if (childRecord && childRecord.type === "collection") {
            return childRecord as RQAPI.CollectionRecord;
          }
          return undefined;
        }

        if (children.length === 1 && children[0]?.type === "collection") {
          return children[0] as RQAPI.CollectionRecord;
        }

        return rootCollection;
      })
      .filter((collection): collection is RQAPI.CollectionRecord => collection !== undefined);
  }, [collectionsData, hasMultipleVersions, selectedVersion]);

  const processedCollections = useMemo(() => {
    return rawTargetCollections
      .map((rawTargetCollection) => {
        if (!rawTargetCollection) return undefined;

        let targetToProcess = rawTargetCollection;

        const children = targetToProcess.data?.children || [];
        if (children.length === 1 && children[0]?.type === "collection") {
          targetToProcess = children[0] as RQAPI.CollectionRecord;
        }

        let processedCollection = cloneDeep(targetToProcess);

        if (organisation === CollectionOrganisation.NO_FOLDERS && processedCollection.data.children) {
          const flattenedRequests: RQAPI.ApiRecord[] = [];

          const traverse = (items: RQAPI.ApiClientRecord[]) => {
            items.forEach((item) => {
              if (item.type === "api") {
                flattenedRequests.push(item as RQAPI.ApiRecord);
              } else if (item.type === "collection" && (item as RQAPI.CollectionRecord).data.children) {
                traverse((item as RQAPI.CollectionRecord).data.children!);
              }
            });
          };

          traverse(processedCollection.data.children);
          processedCollection.data.children = flattenedRequests;
        }

        return processedCollection;
      })
      .filter((collection): collection is RQAPI.CollectionRecord => collection !== undefined);
  }, [rawTargetCollections, organisation]);

  return (
    <div className="soap-success-view">
      <div className="soap-collection-name">
        {`WSDL Processed - ${processedCollections.length} collection(s) : ${processedCollections
          .map((c) => c.name)
          .join(", ")}`}
      </div>
      <div className="soap-options-container">
        {hasMultipleVersions && (
          <div className="soap-option-item">
            <div className="select-heading">SOAP Version</div>
            <Select
              value={selectedVersion}
              onChange={setSelectedVersion}
              options={[
                { label: "SOAP 1.1", value: SoapVersion.V1_1 },
                { label: "SOAP 1.2 (Recommended)", value: SoapVersion.V1_2 },
              ]}
            />
          </div>
        )}

        <div className="soap-option-item">
          <div className="select-heading">Collection Organisation</div>
          <Select
            value={organisation}
            onChange={setOrganisation}
            options={[
              { label: "Port/Endpoint", value: CollectionOrganisation.PORT_ENDPOINT },
              { label: "No folders", value: CollectionOrganisation.NO_FOLDERS },
            ]}
          />
        </div>
      </div>

      <Row className="importer-actions-row">
        {onBack && (
          <RQButton onClick={onBack} disabled={isLoading}>
            Back
          </RQButton>
        )}
        <RQButton
          type="primary"
          loading={isLoading}
          onClick={() => handleImportData(processedCollections, environmentsData)}
        >
          Import
        </RQButton>
      </Row>
    </div>
  );
};
