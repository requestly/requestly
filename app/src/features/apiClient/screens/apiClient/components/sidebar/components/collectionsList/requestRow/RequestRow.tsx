import React, { useCallback, useMemo, useState } from "react";
import { Typography, Dropdown, MenuProps, Checkbox } from "antd";
import { REQUEST_METHOD_BACKGROUND_COLORS, REQUEST_METHOD_COLORS } from "../../../../../../../../../constants";
import { RequestMethod, RQAPI } from "features/apiClient/types";
import { RQButton } from "lib/design-system-v2/components";
import { MdOutlineMoreHoriz } from "@react-icons/all-files/md/MdOutlineMoreHoriz";
import { useApiClientContext } from "features/apiClient/contexts";
import { NewRecordNameInput } from "../newRecordNameInput/NewRecordNameInput";
import { toast } from "utils/Toast";
import { MoveToCollectionModal } from "../../../../modals/MoveToCollectionModal/MoveToCollectionModal";
import {
  trackDuplicateRequestClicked,
  trackDuplicateRequestFailed,
  trackMoveRequestToCollectionClicked,
  trackRequestDuplicated,
} from "modules/analytics/events/features/apiClient";
import { LocalWorkspaceTooltip } from "../../../../clientView/components/LocalWorkspaceTooltip/LocalWorkspaceTooltip";
import "./RequestRow.scss";
import { MdOutlineBorderColor } from "@react-icons/all-files/md/MdOutlineBorderColor";
import { MdContentCopy } from "@react-icons/all-files/md/MdContentCopy";
import { MdOutlineDelete } from "@react-icons/all-files/md/MdOutlineDelete";
import { Conditional } from "components/common/Conditional";
import { useTabServiceWithSelector } from "componentsV2/Tabs/store/tabServiceStore";
import { RequestViewTabSource } from "../../../../clientView/components/RequestView/requestViewTabSource";

interface Props {
  record: RQAPI.ApiRecord;
  isReadOnly: boolean;
  bulkActionOptions: {
    showSelection: boolean;
    selectedRecords: Set<RQAPI.Record["id"]>;
    recordsSelectionHandler: (record: RQAPI.Record, event: React.ChangeEvent<HTMLInputElement>) => void;
    setShowSelection: (arg: boolean) => void;
  };
}

export const RequestRow: React.FC<Props> = ({ record, isReadOnly, bulkActionOptions }) => {
  const { selectedRecords, showSelection, recordsSelectionHandler, setShowSelection } = bulkActionOptions || {};
  const [isEditMode, setIsEditMode] = useState(false);
  const [recordToMove, setRecordToMove] = useState(null);
  const { updateRecordsToBeDeleted, setIsDeleteModalOpen, onSaveRecord, apiClientRecordsRepository } =
    useApiClientContext();
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);

  const [activeTabSource, openTab] = useTabServiceWithSelector((state) => [state.activeTabSource, state.openTab]);

  const activeTabSourceId = useMemo(() => {
    if (activeTabSource) {
      return activeTabSource.getSourceId();
    }
  }, [activeTabSource]);

  const handleDropdownVisibleChange = (isOpen: boolean) => {
    setIsDropdownVisible(isOpen);
  };

  const handleDuplicateRequest = useCallback(
    async (record: RQAPI.ApiRecord) => {
      const newRecord = {
        ...record,
        name: `(Copy) ${record.name || record.data.request.url}`,
      };
      delete newRecord.id;
      return apiClientRecordsRepository
        .createRecord(newRecord)
        .then((result) => {
          if (!result.success) {
            throw new Error("Failed to duplicate request");
          }
          onSaveRecord(result.data, "open");
          toast.success("Request duplicated successfully");
          trackRequestDuplicated();
        })
        .catch((error) => {
          console.error("Error duplicating request:", error);
          toast.error(error.message || "Unexpected error. Please contact support.");
          trackDuplicateRequestFailed();
        });
    },
    [onSaveRecord, apiClientRecordsRepository]
  );

  const requestOptions = useMemo((): MenuProps["items"] => {
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
        },
      },
      {
        key: "1",
        label: (
          <LocalWorkspaceTooltip featureName="Request duplication" placement="bottomRight">
            <div>
              <MdContentCopy style={{ marginRight: 8 }} />
              Duplicate
            </div>
          </LocalWorkspaceTooltip>
        ),
        onClick: (itemInfo) => {
          itemInfo.domEvent?.stopPropagation?.();
          handleDuplicateRequest(record);
          trackDuplicateRequestClicked();
        },
      },
      {
        key: "2",
        label: <div>Move to Collection</div>,
        onClick: (itemInfo) => {
          itemInfo.domEvent?.stopPropagation?.();
          setRecordToMove(record);
          trackMoveRequestToCollectionClicked();
        },
      },
      {
        key: "3",
        label: (
          <div>
            <MdOutlineDelete style={{ marginRight: 8 }} />
            Delete
          </div>
        ),
        danger: true,
        onClick: (itemInfo) => {
          itemInfo.domEvent?.stopPropagation?.();
          updateRecordsToBeDeleted([record]);
          setIsDeleteModalOpen(true);
        },
      },
    ];
  }, [record, updateRecordsToBeDeleted, setIsDeleteModalOpen, handleDuplicateRequest]);

  return (
    <>
      {recordToMove && (
        <MoveToCollectionModal
          recordsToMove={[recordToMove]}
          isOpen={recordToMove}
          onClose={() => {
            setRecordToMove(null);
          }}
        />
      )}
      {isEditMode ? (
        <NewRecordNameInput
          analyticEventSource="collection_row"
          recordType={RQAPI.RecordType.API}
          recordToBeEdited={record}
          onSuccess={() => {
            setIsEditMode(false);
          }}
        />
      ) : (
        <div className={`request-row`}>
          <div
            title={record.name || record.data.request?.url}
            className={`collections-list-item api ${record.id === activeTabSourceId ? "active" : ""}`}
            onClick={() => {
              openTab(
                new RequestViewTabSource({
                  id: record.id,
                  apiEntryDetails: record,
                  title: record.name || record.data.request?.url,
                }),
                { preview: true }
              );
            }}
          >
            {showSelection && (
              <Checkbox
                onChange={recordsSelectionHandler.bind(this, record)}
                checked={selectedRecords.has(record.id)}
              />
            )}
            <Typography.Text
              strong
              className="request-method"
              style={{
                color: REQUEST_METHOD_COLORS[record.data.request?.method],
                backgroundColor: REQUEST_METHOD_BACKGROUND_COLORS[record.data.request?.method],
              }}
            >
              {[RequestMethod.OPTIONS, RequestMethod.DELETE].includes(record.data.request?.method)
                ? record.data.request?.method.slice(0, 3)
                : record.data.request?.method}
            </Typography.Text>
            <div className="request-url">{record.name || record.data.request?.url}</div>

            <Conditional condition={!isReadOnly}>
              <div className={`request-options ${isDropdownVisible ? "active" : ""}`}>
                <Dropdown
                  trigger={["click"]}
                  menu={{ items: requestOptions }}
                  placement="bottomRight"
                  open={isDropdownVisible}
                  onOpenChange={handleDropdownVisibleChange}
                >
                  <RQButton
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowSelection(false);
                    }}
                    size="small"
                    type="transparent"
                    icon={<MdOutlineMoreHoriz />}
                  />
                </Dropdown>
              </div>
            </Conditional>
          </div>
        </div>
      )}
    </>
  );
};
