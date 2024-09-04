import React, { useEffect, useState } from "react";
import { RQModal } from "lib/design-system/components";
import { HiOutlineShare } from "@react-icons/all-files/hi/HiOutlineShare";
import { PiWarningCircleBold } from "@react-icons/all-files/pi/PiWarningCircleBold";
import { Button, Spin } from "antd";
import { RQMockSchema } from "components/features/mocksV2/types";
import { getMock } from "backend/mocks/getMock";
import { useSelector } from "react-redux";
import { getUserAuthDetails } from "store/selectors";
import { getCurrentlyActiveWorkspace } from "store/features/teams/selectors";
import { prepareMocksToExport } from "./utils";
import fileDownload from "js-file-download";
import { getFormattedDate } from "utils/DateTimeUtils";
import { toast } from "utils/Toast";
import { trackMocksExported } from "modules/analytics/events/features/mocksV2";
import Logger from "lib/logger";
import "./ExportMocksModal.scss";

const EmptySelectionView = () => {
  return (
    <div className="sharing-modal-empty-view sharing-modal-body">
      <PiWarningCircleBold />
      <div className="title text-white text-bold">Please select the mocks that you want to share!</div>
    </div>
  );
};

interface ShareMocksModalProps {
  isOpen: boolean;
  closeModal: () => void;
  selectedMockIds: string[];
  onSuccess?: () => void;
}

export const ExportMocksModal: React.FC<ShareMocksModalProps> = ({
  isOpen,
  closeModal,
  selectedMockIds,
  onSuccess = () => {},
}) => {
  const user = useSelector(getUserAuthDetails);
  const workspace = useSelector(getCurrentlyActiveWorkspace);
  const uid = user?.details?.profile?.uid;
  const teamId = workspace?.id;

  const [isMocksLoading, setIsMocksLoading] = useState(false);
  const [mocks, setMocks] = useState<RQMockSchema[]>([]);
  const [mocksExportDetails, setMocksExportDetails] = useState<{
    fileContent: string;
    mocksCount: number;
    collectionsCount: number;
  }>(null);

  useEffect(() => {
    if (selectedMockIds.length === 0) {
      return;
    }

    setIsMocksLoading(true);

    const mockPromises: Promise<RQMockSchema>[] = [];

    selectedMockIds.forEach((mockId) => {
      const promise = getMock(uid, mockId, teamId)
        .then((data: any) => {
          if (data) {
            return data;
          }

          throw new Error("No mock found!");
        })
        .catch((error: any) => {
          Logger.log("ExportMocksModal - Error while fetching mocks!", error);
        });

      mockPromises.push(promise);
    });

    Promise.all(mockPromises)
      .then((mocks) => {
        setMocks(mocks);

        const result = prepareMocksToExport(mocks);
        setMocksExportDetails(result);
      })
      .catch((error) => {
        Logger.log("ExportMocksModal - Something went wrong while preparing for export!", error);
        toast.error("Something went wrong, please retry exporting the mocks!");
        closeModal();
      })
      .finally(() => {
        setIsMocksLoading(false);
      });

    return () => {
      setMocksExportDetails(null);
    };
  }, [selectedMockIds]);

  const fileName =
    selectedMockIds.length === 1
      ? `${mocks?.[0]?.name}` ?? ""
      : `requestly_mocks_export_${getFormattedDate("DD_MM_YYYY")}`;

  const handleMocksExport = () => {
    trackMocksExported(mocksExportDetails.mocksCount, mocksExportDetails.collectionsCount);
    fileDownload(mocksExportDetails.fileContent, `${fileName}.json`, "application/json");
    onSuccess();
    setTimeout(
      () => toast.success(`${mocksExportDetails.mocksCount === 1 ? "Mock" : "Mocks"} exported successfully`),
      0
    );

    closeModal();
  };

  return (
    <RQModal
      centered
      open={isOpen}
      destroyOnClose
      onCancel={closeModal}
      wrapClassName="export-mocks-modal-wrapper"
      maskClosable={false}
    >
      <div className="rq-modal-content">
        <div className="export-mocks-modal-header">
          <HiOutlineShare /> Export mocks
        </div>
      </div>

      {selectedMockIds.length === 0 ? (
        <EmptySelectionView />
      ) : (
        <>
          <div className="export-mocks-modal-body">
            {isMocksLoading ? (
              <div className="skeleton-container">
                <Spin tip="Preparing mocks to export..." size="large" />
              </div>
            ) : (
              <>
                <div className="export-mocks-details ">
                  <span className="line-clamp">{fileName}</span>
                  <span className="text-gray">
                    {mocksExportDetails?.mocksCount} {mocksExportDetails?.mocksCount === 1 ? " mock" : " mocks"}
                    {mocksExportDetails?.collectionsCount > 0
                      ? ` and ${mocksExportDetails?.collectionsCount} ${
                          mocksExportDetails?.collectionsCount === 1 ? " collection" : " collections"
                        }`
                      : ""}
                  </span>
                </div>
                <Button type="primary" onClick={handleMocksExport}>
                  Export mocks
                </Button>
              </>
            )}
          </div>
        </>
      )}
    </RQModal>
  );
};
