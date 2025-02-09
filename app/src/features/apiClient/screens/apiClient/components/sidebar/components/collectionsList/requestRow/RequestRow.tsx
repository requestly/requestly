import React, { useCallback, useState } from "react";
import { Typography, Dropdown, MenuProps } from "antd";
import PATHS from "config/constants/sub/paths";
import { REQUEST_METHOD_BACKGROUND_COLORS, REQUEST_METHOD_COLORS } from "../../../../../../../../../constants";
import { RequestMethod, RQAPI } from "features/apiClient/types";
import { NavLink } from "react-router-dom";
import { RQButton } from "lib/design-system-v2/components";
import { MdOutlineMoreHoriz } from "@react-icons/all-files/md/MdOutlineMoreHoriz";
import { useApiClientContext } from "features/apiClient/contexts";
import { NewRecordNameInput } from "../newRecordNameInput/NewRecordNameInput";
import { toast } from "utils/Toast";
import { MoveToCollectionModal } from "../../../../modals/MoveToCollectionModal/MoveToCollectionModal";
import {
  trackDuplicateRequestClicked,
  trackDuplicateRequestFailed,
  trackDuplicateRequestSuccessful,
  trackMoveRequestToCollectionClicked,
} from "modules/analytics/events/features/apiClient";
import { TabsLayoutContextInterface } from "layouts/TabsLayout";

interface Props {
  record: RQAPI.ApiRecord;
  openTab: TabsLayoutContextInterface["openTab"];
}

export const RequestRow: React.FC<Props> = ({ record, openTab }) => {
  const [isEditMode, setIsEditMode] = useState(false);
  const [recordToMove, setRecordToMove] = useState(null);
  const {
    updateRecordToBeDeleted,
    setIsDeleteModalOpen,
    onSaveRecord,
    apiClientSyncRepository,
  } = useApiClientContext();

  const handleDuplicateRequest = useCallback(
    async (record: RQAPI.ApiRecord) => {
      const newRecord = {
        ...record,
        name: `(Copy) ${record.name || record.data.request.url}`,
      };
      delete newRecord.id;
      return apiClientSyncRepository
        .createRecord(newRecord)
        .then((result) => {
          if (!result.success) {
            throw new Error("Failed to duplicate request");
          }
          onSaveRecord(result.data);
          toast.success("Request duplicated successfully");
          trackDuplicateRequestSuccessful();
        })
        .catch((error) => {
          console.error("Error duplicating request:", error);
          toast.error(error.message || "Unexpected error. Please contact support.");
          trackDuplicateRequestFailed();
        });
    },
    [onSaveRecord, apiClientSyncRepository]
  );

  const getRequestOptions = useCallback((): MenuProps["items"] => {
    return [
      {
        key: "0",
        label: <div>Rename</div>,
        onClick: (itemInfo) => {
          itemInfo.domEvent?.stopPropagation?.();
          setIsEditMode(true);
        },
      },
      {
        key: "1",
        label: <div>Duplicate</div>,
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
        label: <div>Delete</div>,
        danger: true,
        onClick: (itemInfo) => {
          itemInfo.domEvent?.stopPropagation?.();
          updateRecordToBeDeleted(record);
          setIsDeleteModalOpen(true);
        },
      },
    ];
  }, [record, updateRecordToBeDeleted, setIsDeleteModalOpen, handleDuplicateRequest]);

  return (
    <>
      {recordToMove && (
        <MoveToCollectionModal
          recordToMove={recordToMove}
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
        <NavLink
          title={record.name || record.data.request?.url}
          to={`${PATHS.API_CLIENT.ABSOLUTE}/request/${record.id}`}
          className={({ isActive }) => `collections-list-item api  ${isActive ? "active" : ""}`}
          onClick={() => {
            openTab(record.id, {
              isPreview: true,
              title: record.name || record.data.request?.url,
              url: `${PATHS.API_CLIENT.ABSOLUTE}/request/${record.id}`,
            });
          }}
        >
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

          <div className="request-options">
            <Dropdown trigger={["click"]} menu={{ items: getRequestOptions() }} placement="bottomRight">
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
        </NavLink>
      )}
    </>
  );
};
