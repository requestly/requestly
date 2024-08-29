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
import "./DownloadMocksModal.scss";

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
  toggleModal: () => void;
  selectedMockIds: string[];
  onSuccess?: () => void;
}

export const DownloadMocksModal: React.FC<ShareMocksModalProps> = ({
  isOpen,
  toggleModal,
  selectedMockIds,
  onSuccess = () => {},
}) => {
  const user = useSelector(getUserAuthDetails);
  const workspace = useSelector(getCurrentlyActiveWorkspace);
  const uid = user?.details?.profile?.uid;
  const teamId = workspace?.id;

  const [isMocksLoading, setIsMocksLoading] = useState(false);
  const [mocks, setMocks] = useState<RQMockSchema[]>([]);
  const [mocksDownloadDetails, setMocksDownloadDetails] = useState<{
    fileContent: string;
    mocksCount: number;
    collectionsCount: number;
  } | null>(null);

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
        })
        .catch((error: any) => {
          // NOOP
        });

      mockPromises.push(promise);
    });

    Promise.all(mockPromises)
      .then((mocks) => {
        setMocks(mocks);

        const result = prepareMocksToExport(mocks);
        setMocksDownloadDetails(result);
      })
      .catch((error) => {
        // NOOP
      })
      .finally(() => {
        setIsMocksLoading(false);
      });

    return () => {
      setMocksDownloadDetails(null);
    };
  }, [selectedMockIds]);

  const fileName =
    mocksDownloadDetails?.mocksCount === 1
      ? `${mocks[0].name}` ?? ""
      : `requestly_mocks_export_${getFormattedDate("DD_MM_YYYY")}`;

  const handleMocksDownload = () => {
    // TODO: add analytics
    fileDownload(mocksDownloadDetails?.fileContent ?? "", `${fileName}.json`, "application/json");
    onSuccess();
    setTimeout(
      () => toast.success(`${mocksDownloadDetails.mocksCount === 1 ? "Mock" : "Mocks"} downloaded successfully`),
      1000
    );

    toggleModal();
  };

  return (
    <RQModal
      centered
      open={isOpen}
      destroyOnClose
      title="Share mocks"
      onCancel={toggleModal}
      wrapClassName="mocks-sharing-modal-wrapper"
      maskClosable={false}
    >
      <div className="rq-modal-content">
        <div className="sharing-modal-header">
          <HiOutlineShare /> Download mocks
        </div>
      </div>

      {selectedMockIds.length === 0 ? (
        <EmptySelectionView />
      ) : (
        <>
          <div className="sharing-modal-body">
            {isMocksLoading ? (
              <div className="skeleton-container">
                <Spin tip="Preparing mocks to export..." size="large" />
              </div>
            ) : (
              <>
                <div className="download-rules-details">
                  <span className="line-clamp">{fileName}</span>
                  <span className="text-gray">
                    {mocksDownloadDetails?.mocksCount} {mocksDownloadDetails?.mocksCount === 1 ? " mock" : " mocks"}
                  </span>
                </div>
                <Button type="primary" onClick={handleMocksDownload}>
                  Download mock
                </Button>
              </>
            )}
          </div>
        </>
      )}
    </RQModal>
  );
};
