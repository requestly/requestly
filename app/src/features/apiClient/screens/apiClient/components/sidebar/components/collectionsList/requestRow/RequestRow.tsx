import React, { useCallback, useState } from "react";
import { Typography, Dropdown, MenuProps } from "antd";
import PATHS from "config/constants/sub/paths";
import { REQUEST_METHOD_COLORS } from "../../../../../../../../../constants";
import { RQAPI } from "features/apiClient/types";
import { NavLink } from "react-router-dom";
import { RQButton } from "lib/design-system-v2/components";
import { MdOutlineMoreHoriz } from "@react-icons/all-files/md/MdOutlineMoreHoriz";
import { useApiClientContext } from "features/apiClient/contexts";
import { NewRecordNameInput } from "../newRecordNameInput/NewRecordNameInput";
import { upsertApiRecord } from "backend/apiClient";
import { useSelector } from "react-redux";
import { getUserAuthDetails } from "store/slices/global/user/selectors";
import { getCurrentlyActiveWorkspace } from "store/features/teams/selectors";
import { toast } from "utils/Toast";
import { MoveToCollectionModal } from "../../../../modals/MoveToCollectionModal/MoveToCollectionModal";

interface Props {
  record: RQAPI.ApiRecord;
}

export const RequestRow: React.FC<Props> = ({ record }) => {
  const [isEditMode, setIsEditMode] = useState(false);
  const [isMoveToCollectionModalOpen, setIsMoveToCollectionModalOpen] = useState(false);
  const [requestToMove, setRequestToMove] = useState(null);
  const { updateRecordToBeDeleted, setIsDeleteModalOpen, onSaveRecord } = useApiClientContext();
  const user = useSelector(getUserAuthDetails);
  const teamId = useSelector(getCurrentlyActiveWorkspace);

  const handleDuplicateRequest = useCallback(
    async (record: RQAPI.ApiRecord) => {
      const newRecord = {
        ...record,
        name: `${record.name} (Copy)`,
      };
      delete newRecord.id;
      const result = await upsertApiRecord(user?.details?.profile?.uid, newRecord, teamId);
      if (result.success) {
        onSaveRecord(result.data);
        toast.success("Request duplicated successfully");
      }
    },
    [teamId, user?.details?.profile?.uid, onSaveRecord]
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
        },
      },
      {
        key: "2",
        label: <div>Move to Collection</div>,
        onClick: (itemInfo) => {
          itemInfo.domEvent?.stopPropagation?.();
          setRequestToMove(record);
          setIsMoveToCollectionModalOpen(true);
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
      {isMoveToCollectionModalOpen && (
        <MoveToCollectionModal
          recordToMove={requestToMove}
          isOpen={isMoveToCollectionModalOpen}
          onClose={() => {
            setIsMoveToCollectionModalOpen(false);
            setRequestToMove(null);
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
          title={record.name || record.data.request.url}
          to={`${PATHS.API_CLIENT.ABSOLUTE}/request/${record.id}`}
          className={({ isActive }) => `collections-list-item api  ${isActive ? "active" : ""}`}
        >
          <Typography.Text
            strong
            className="request-method"
            style={{ color: REQUEST_METHOD_COLORS[record.data.request.method] }}
          >
            {record.data.request.method}
          </Typography.Text>
          <div className="request-url">{record.name || record.data.request.url}</div>

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
