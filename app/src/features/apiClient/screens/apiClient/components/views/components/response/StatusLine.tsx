import React, { useCallback, useMemo, useState } from "react";
import { RQAPI } from "../../../../../../types";
import { Popover, Space, Tooltip } from "antd";
import PropertyRow from "./PropertyRow/PropertyRow";
import { statusCodes } from "config/constants/sub/statusCode";
import NetworkStatusField from "components/misc/NetworkStatusField";
import { MdOutlineSwapCalls } from "@react-icons/all-files/md/MdOutlineSwapCalls";
import { isHttpResponse } from "features/apiClient/screens/apiClient/utils";
import { RQButton } from "lib/design-system-v2/components";
import { MdOutlineDashboardCustomize } from "@react-icons/all-files/md/MdOutlineDashboardCustomize";
import { BufferedGraphQLRecordEntity, BufferedHttpRecordEntity } from "features/apiClient/slices/entities";
import { createExampleRequest, useApiClientFeatureContext } from "features/apiClient/slices";
import { useTabActions } from "componentsV2/Tabs/slice";
import { ExampleViewTabSource } from "../ExampleRequestView/exampleViewTabSource";
import { toast } from "utils/Toast";

interface Props {
  response: RQAPI.Response;
  entity: BufferedHttpRecordEntity | BufferedGraphQLRecordEntity;
}

const StatusLine: React.FC<Props> = ({ response, entity }) => {
  const context = useApiClientFeatureContext();
  const { openBufferedTab } = useTabActions();

  const [isSavingAsExample, setIsSavingAsExample] = useState(false);

  const entityType = entity.getType(context.store.getState());

  const formattedTime = useMemo(() => {
    if (response?.time) {
      const ms = Math.ceil(response.time);

      if (ms < 1000) {
        return <>{ms} ms</>;
      }

      return <>{(ms / 1000).toFixed(3)} s</>;
    }

    return "";
  }, [response?.time]);

  const formattedStatusText = useMemo(() => {
    // @ts-ignore
    return response?.statusText || statusCodes[response?.status];
  }, [response?.status, response?.statusText]);

  const handleSaveResponseClick = useCallback(async () => {
    try {
      setIsSavingAsExample(true);
      const requestRecord = entity.getEntityFromState(context.store.getState());
      const exampleRecordToCreate: RQAPI.ExampleApiRecord = {
        ...requestRecord,
        parentRequestId: entity.meta.referenceId,
        type: RQAPI.RecordType.EXAMPLE_API,
      };
      exampleRecordToCreate.collectionId = null;

      const { exampleRecord } = await context.store
        .dispatch(
          createExampleRequest({
            parentRequestId: entity.meta.referenceId,
            example: exampleRecordToCreate,
            repository: context.repositories.apiClientRecordsRepository,
          }) as any
        )
        .unwrap();

      openBufferedTab({
        preview: false,
        source: new ExampleViewTabSource({
          id: exampleRecord.id,
          title: exampleRecord.name || "Example",
          apiEntryDetails: exampleRecord,
          context: { id: context.workspaceId },
        }),
      });
      toast.success("Response saved as example successfully.");
    } catch (error) {
      toast.error("Something went wrong while saving the response as example.");
    } finally {
      setIsSavingAsExample(false);
    }
  }, [context.repositories.apiClientRecordsRepository, context.store, context.workspaceId, entity, openBufferedTab]);

  if (!response) {
    return null;
  }

  return (
    <Space className="api-response-status-row">
      {isHttpResponse(response) && response.redirectedUrl && (
        <Popover content={response.redirectedUrl}>
          <div className="api-response-status-row__redirected">
            <MdOutlineSwapCalls /> <span>REDIRECTED</span>
          </div>
        </Popover>
      )}
      <PropertyRow
        name={`Status: ${formattedStatusText}`}
        className="api-response-status-row__status"
        value={<NetworkStatusField status={response.status} />}
      />
      <PropertyRow className="api-response-status-row__time" name="Time" value={formattedTime} />
      {entityType === RQAPI.RecordType.API && (
        <div className="api-response-status-row__save-button-wapper">
          <Tooltip title="Save the current request and response as an example." placement="bottom" color="#000">
            <RQButton
              size="small"
              type="transparent"
              icon={<MdOutlineDashboardCustomize />}
              onClick={handleSaveResponseClick}
              loading={isSavingAsExample}
            >
              Save
            </RQButton>
          </Tooltip>
        </div>
      )}
    </Space>
  );
};

export default StatusLine;
