import React, { useCallback, useMemo, useState } from "react";
import { Typography, Dropdown, MenuProps } from "antd";
import { RQAPI } from "features/apiClient/types";
import { RQButton } from "lib/design-system-v2/components";
import { MdOutlineMoreHoriz } from "@react-icons/all-files/md/MdOutlineMoreHoriz";
import { MdOutlineBorderColor } from "@react-icons/all-files/md/MdOutlineBorderColor";
import { MdOutlineDelete } from "@react-icons/all-files/md/MdOutlineDelete";
import { MdOutlineDashboardCustomize } from "@react-icons/all-files/md/MdOutlineDashboardCustomize";
import { Conditional } from "components/common/Conditional";
import { NewRecordNameInput } from "../newRecordNameInput/NewRecordNameInput";
import { ExampleViewTabSource } from "../../../../views/components/ExampleRequestView/exampleViewTabSource";
import { useActiveTab, useTabActions } from "componentsV2/Tabs/slice";
import {
  ApiClientFeatureContext,
  createExampleRequest,
  deleteExampleRequests,
  useApiClientFeatureContext,
} from "features/apiClient/slices";
import { MdContentCopy } from "@react-icons/all-files/md/MdContentCopy";
import { toast } from "utils/Toast";
import "./ExampleRow.scss";

interface Props {
  record: RQAPI.ExampleApiRecord;
  isReadOnly: boolean;
  handleRecordsToBeDeleted: (records: RQAPI.ApiClientRecord[], context?: ApiClientFeatureContext) => void;
}

export const ExampleRow: React.FC<Props> = ({ record, isReadOnly, handleRecordsToBeDeleted }) => {
  const [isEditMode, setIsEditMode] = useState(false);
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);

  const context = useApiClientFeatureContext();
  const { openBufferedTab } = useTabActions();
  const activeTabSourceId = useActiveTab()?.source.getSourceId();

  const handleDeleteExample = useCallback(async () => {
    try {
      await context.store
        .dispatch(
          deleteExampleRequests({
            exampleRecords: [record],
            repository: context.repositories.apiClientRecordsRepository,
          }) as any
        )
        .unwrap();
      toast.success("Example deleted successfully");
    } catch (error) {
      toast.error("Something went wrong while deleting the example.");
    }
  }, [context.store, context.repositories.apiClientRecordsRepository, record]);

  const handleDuplicateExample = useCallback(async () => {
    try {
      const { exampleRecord } = await context.store
        .dispatch(
          createExampleRequest({
            parentRequestId: record.parentRequestId,
            example: {
              ...record,
              name: `${record.name} Copy`,
            },
            repository: context.repositories.apiClientRecordsRepository,
          }) as any
        )
        .unwrap();

      openBufferedTab({
        source: new ExampleViewTabSource({
          id: exampleRecord.id,
          apiEntryDetails: exampleRecord,
          title: exampleRecord.name || "Example",
          context: {
            id: context.workspaceId,
          },
        }),
      });

      toast.success("Example duplicated successfully");
    } catch {
      toast.error("Something went wrong while duplicating the example.");
    }
  }, [context.store, context.repositories.apiClientRecordsRepository, record, openBufferedTab, context.workspaceId]);

  const exampleOptions = useMemo((): MenuProps["items"] => {
    return [
      {
        key: "0",
        label: (
          <div>
            <MdOutlineBorderColor style={{ marginRight: 8 }} />
            Rename
          </div>
        ),
        onClick: (itemInfo) => {
          itemInfo.domEvent?.stopPropagation?.();
          setIsEditMode(true);
          setIsDropdownVisible(false);
        },
      },
      {
        key: "1",
        label: (
          <div>
            <MdContentCopy style={{ marginRight: 8 }} />
            Duplicate
          </div>
        ),
        onClick: (itemInfo) => {
          itemInfo.domEvent?.stopPropagation?.();
          setIsDropdownVisible(false);
          handleDuplicateExample();
        },
      },
      {
        key: "2",
        label: (
          <div>
            <MdOutlineDelete style={{ marginRight: 8 }} />
            Delete
          </div>
        ),
        danger: true,
        onClick: (itemInfo) => {
          itemInfo.domEvent?.stopPropagation?.();
          setIsDropdownVisible(false);
          handleDeleteExample();
        },
      },
    ];
  }, [handleDeleteExample, handleDuplicateExample]);

  if (isEditMode) {
    return (
      <NewRecordNameInput
        analyticEventSource="example_row"
        recordType={RQAPI.RecordType.EXAMPLE_API}
        recordToBeEdited={record}
        onSuccess={() => {
          setIsEditMode(false);
        }}
      />
    );
  }

  return (
    <div
      className={`collections-list-item api example-row ${record.id === activeTabSourceId ? "active" : ""}`}
      onClick={() => {
        openBufferedTab({
          source: new ExampleViewTabSource({
            id: record.id,
            apiEntryDetails: record,
            title: record.name || "Example",
            context: {
              id: context.workspaceId,
            },
          }),
        });
      }}
    >
      <div style={{ width: 8 }} />
      <MdOutlineDashboardCustomize className="example-row-icon" />
      <Typography.Text
        ellipsis={{
          tooltip: {
            title: record.name || "Example",
            placement: "right",
            color: "#000",
            mouseEnterDelay: 0.5,
          },
        }}
        className="request-url example-row-name"
      >
        {record.name || "Example"}
      </Typography.Text>

      <Conditional condition={!isReadOnly}>
        <div className={`request-options ${isDropdownVisible ? "active" : ""}`}>
          <Dropdown
            trigger={["click"]}
            menu={{ items: exampleOptions }}
            placement="bottomRight"
            open={isDropdownVisible}
            onOpenChange={setIsDropdownVisible}
          >
            <RQButton
              onClick={(e) => {
                e.stopPropagation();
              }}
              size="small"
              type="transparent"
              icon={<MdOutlineMoreHoriz />}
            />
          </Dropdown>
        </div>
      </Conditional>
    </div>
  );
};
