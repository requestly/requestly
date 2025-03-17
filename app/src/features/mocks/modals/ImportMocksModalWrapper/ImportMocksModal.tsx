import React, { useCallback, useState } from "react";
import { useSelector } from "react-redux";
import { getUserAuthDetails } from "store/slices/global/user/selectors";
import { useNavigate } from "react-router-dom";
import Logger from "lib/logger";
import { FilePicker } from "components/common/FilePicker";
import { Button, Col, Modal, Row } from "antd";
import { MockType, RQMockSchema } from "components/features/mocksV2/types";
import { BsFileEarmarkCheck } from "@react-icons/all-files/bs/BsFileEarmarkCheck";
import { AiOutlineWarning } from "@react-icons/all-files/ai/AiOutlineWarning";
import { processMocksToImport } from "./utils";
import { toast } from "utils/Toast";
import { createMock } from "backend/mocks/createMock";
import { createCollection } from "backend/mocks/createCollection";
import PATHS from "config/constants/sub/paths";
import {
  trackMocksImportCompleted,
  trackMocksImportFailed,
  trackMocksJsonParsed,
} from "modules/analytics/events/features/mocksV2";
import "./ImportMocksModal.scss";
import { getActiveWorkspaceId } from "store/slices/workspaces/selectors";

interface ImportMocksModalProps {
  isOpen: boolean;
  mockType: MockType;
  toggleModal: () => void;
  onSuccess: () => void;
  source: string;
}

export const ImportMocksModal: React.FC<ImportMocksModalProps> = ({
  isOpen,
  toggleModal,
  mockType,
  onSuccess = () => {},
  source = "",
}) => {
  const navigate = useNavigate();
  const user = useSelector(getUserAuthDetails);
  const uid = user?.details?.profile?.uid;
  const activeWorkspaceId = useSelector(getActiveWorkspaceId);

  const [dataToImport, setDataToImport] = useState({
    records: [],
    mocks: [],
    collections: [],
    mocksCount: 0,
    collectionsCount: 0,
    mockTypeToImport: null,
  });
  const [processingRecordsToImport, setProcessingRecordsToImport] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      //Ignore other uploaded files
      const file = acceptedFiles[0];

      const reader = new FileReader();

      reader.onabort = function (this) {
        Logger.log("ImportMocksModal - onDrop aborted", this.error);
        toggleModal();
      };
      reader.onerror = function (this) {
        Logger.log("ImportMocksModal - onDrop error", this.error);
        toggleModal();
      };
      reader.onload = () => {
        setProcessingRecordsToImport(true);
        let parsedRecords: RQMockSchema[] = [];

        try {
          parsedRecords = JSON.parse(reader.result as string);

          const result = processMocksToImport(user?.details?.profile?.uid, parsedRecords);

          setDataToImport(result);

          trackMocksJsonParsed({
            source,
            successful: true,
            mockTypeToImport: result.mockTypeToImport,
            mocksCount: result.mocksCount,
            collectionsCount: result.collectionsCount,
          });
        } catch (error) {
          Logger.log(error);

          trackMocksJsonParsed({
            source,
            successful: false,
          });

          alert("Imported file doesn't match Requestly mocks format. Please choose another file.");
          trackMocksImportFailed("json_parse_failed");
          toggleModal();
        } finally {
          setProcessingRecordsToImport(false);
        }
      };
      reader.readAsText(file);
    },
    [toggleModal, user?.details?.profile?.uid, source]
  );

  const handleRecordsImport = async () => {
    try {
      setIsImporting(true);

      const collectionsPromises: Promise<{ oldId: string; newId: string; path: string }>[] = [];

      dataToImport.collections.forEach((collection) => {
        const promise = createCollection(uid, collection, activeWorkspaceId)
          .then((newCollection) => {
            return { oldId: collection.id, newId: newCollection.id, path: newCollection.path };
          })
          .catch((error) => {
            return error;
          });

        collectionsPromises.push(promise);
      });

      const collectionPromisesResult = await Promise.all(collectionsPromises);

      // Old to new collection mapping
      const oldToNewCollectionDetails: Record<
        string,
        { newId: string; path: string }
      > = collectionPromisesResult.reduce((result, details) => {
        return { ...result, [details.oldId]: { newId: details.newId, path: details.path } };
      }, {});

      const mocksPromises: Promise<unknown>[] = [];

      dataToImport.mocks.forEach((mock) => {
        const newCollectionId = oldToNewCollectionDetails[mock.collectionId].newId;
        const updatedMock = { ...mock, collectionId: newCollectionId ?? "" };

        mocksPromises.push(createMock(uid, updatedMock, activeWorkspaceId, newCollectionId));
      });

      await Promise.all(mocksPromises);
      toast.success("Mocks imported successfully");

      trackMocksImportCompleted({
        source,
        mockTypeToImport: dataToImport.mockTypeToImport,
        mocksCount: dataToImport.mocksCount,
        collectionsCount: dataToImport.collectionsCount,
      });

      onSuccess();
      navigate(
        dataToImport.mockTypeToImport === MockType.API ? PATHS.MOCK_SERVER_V2.ABSOLUTE : PATHS.FILE_SERVER_V2.ABSOLUTE
      );
      toggleModal();
    } catch (error) {
      trackMocksImportFailed("import_click");
      Logger.log("handleRecordsImport", error);
      toast.error("Something went wrong, please try again!");
    } finally {
      setIsImporting(false);
    }
  };

  const getSuccessfullyParsedMessage = () => {
    return `Successfully parsed ${dataToImport.mocksCount} ${dataToImport.mocksCount === 1 ? "mock" : "mocks"} ${
      dataToImport.collectionsCount > 0
        ? `and ${dataToImport.collectionsCount} ${dataToImport.collectionsCount === 1 ? "collection" : "collections"}.`
        : ""
    }`;
  };

  return (
    <Modal
      open={isOpen}
      onCancel={toggleModal}
      width={550}
      footer={null}
      className="mocks-import-modal"
      maskClosable={false}
    >
      <div className="mocks-import-modal-content">
        <div className="heading">Import mocks</div>

        {dataToImport.records.length === 0 ? (
          <FilePicker
            onFilesDrop={onDrop}
            loaderMessage="Processing mocks..."
            isProcessing={processingRecordsToImport}
            title="Drag and drop your mocks JSON file"
          />
        ) : dataToImport.records.length > 0 ? (
          <>
            {dataToImport.mocksCount || dataToImport.collectionsCount ? (
              <Col lg="12" md="12" xl="12" sm="12" xs="12" className="text-center" style={{ textAlign: "center" }}>
                <h1 className="display-2">
                  <BsFileEarmarkCheck className="success" />
                </h1>
                <h4>{getSuccessfullyParsedMessage()}</h4>

                <Row className="rq-modal-footer">
                  <Button
                    type="primary"
                    className="ml-auto"
                    loading={isImporting}
                    onClick={() => handleRecordsImport()}
                  >
                    Import
                  </Button>
                </Row>
              </Col>
            ) : (
              <Col lg="12" md="12" xl="12" sm="12" xs="12" className="text-center">
                <h4>
                  <AiOutlineWarning /> Could not find valid data in this file. Please try another
                </h4>
              </Col>
            )}
          </>
        ) : (
          <Col lg="12" md="12" xl="12" sm="12" xs="12" className="text-center">
            <h4>
              <AiOutlineWarning /> No mocks to import, please try another file!
            </h4>
          </Col>
        )}
      </div>
    </Modal>
  );
};
