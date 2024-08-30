import React, { useCallback, useState } from "react";
import { useSelector } from "react-redux";
import { getUserAuthDetails } from "store/selectors";
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
import { getCurrentlyActiveWorkspace } from "store/features/teams/selectors";
import { createCollection } from "backend/mocks/createCollection";
import PATHS from "config/constants/sub/paths";
import "./ImportMocksModal.scss";

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
  const workspace = useSelector(getCurrentlyActiveWorkspace);
  const teamId = workspace?.id;

  const [dataToImport, setDataToImport] = useState({
    records: [],
    mocks: [],
    collections: [],
    mocksCount: 0,
    collectionsCount: 0,
    mockTypeToImport: null,
    success: true,
  });
  const [processingRecordsToImport, setProcessingRecordsToImport] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  const {
    mockTypeToImport,
    mocks: mocksToImport,
    collections: collectionsToImport,
    success: isValidRecords,
    records: recordsToImport,
    mocksCount: mocksToImportCount,
    collectionsCount: collectionsToImportCount,
  } = dataToImport;

  const onDrop = useCallback(
    // @ts-ignore
    async (acceptedFiles) => {
      //Ignore other uploaded files
      const file = acceptedFiles[0];

      const reader = new FileReader();

      reader.onabort = () => toggleModal();
      reader.onerror = () => toggleModal();
      reader.onload = () => {
        //Render the loader
        setProcessingRecordsToImport(true);
        let parsedRecords = [];
        try {
          // @ts-ignore
          parsedRecords = JSON.parse(reader.result) as RQMockSchema;

          const result = processMocksToImport(user?.details?.profile?.uid, parsedRecords);

          if (!result.success) {
            throw new Error("Invalid file!");
          }

          setDataToImport(result);

          // trackRulesJsonParsed({
          //   parsed_rules_count: result.rulesCount,
          //   parsed_groups_count: result.groupsCount,
          //   successful: true,
          // });
        } catch (error) {
          Logger.log(error);
          alert("Imported file doesn't match Requestly mocks format. Please choose another file.");
          // trackRulesJsonParsed({
          //   successful: false,
          // });
          // trackRulesImportFailed("json_parse_failed");
          toggleModal();
        } finally {
          setProcessingRecordsToImport(false);
        }
      };
      reader.readAsText(file);
    },
    [toggleModal]
  );

  const handleRecordsImport = async () => {
    try {
      setIsImporting(true);

      const collectionsPromises: Promise<{ oldId: string; newId: string } | void>[] = [];

      collectionsToImport.forEach((collection) => {
        const promise = createCollection(uid, collection, teamId)
          .then((newCollection) => {
            return { oldId: collection.id, newId: newCollection.id };
          })
          .catch(() => {
            // NOOP
          });

        collectionsPromises.push(promise);
      });

      const collectionPromisesResult = ((await Promise.all(collectionsPromises)) as unknown) as {
        oldId: string;
        newId: string;
      }[];

      // Old to new collection mapping
      const oldToNewCollectionIds: Record<string, string> = collectionPromisesResult.reduce((result, details) => {
        return { ...result, [details.oldId]: details.newId };
      }, {});

      const mocksPromises: Promise<unknown>[] = [];

      mocksToImport.forEach((mock) => {
        const updatedMock = { ...mock, collectionId: oldToNewCollectionIds[mock.collectionId] ?? "" };

        const promise = createMock(uid, updatedMock, teamId)
          .then((mockId) => mockId)
          .catch((e) => {
            // NOOP
          });

        mocksPromises.push(promise);
      });

      await Promise.all(mocksPromises);
      toast.success("Mocks imported successfully");
      onSuccess();

      navigate(mockTypeToImport === MockType.API ? PATHS.MOCK_SERVER_V2.ABSOLUTE : PATHS.FILE_SERVER_V2.ABSOLUTE);
      toggleModal();

      // TODO: send analytics
    } catch (error) {
      Logger.log("handleRecordsImport", error);
      toast.error("Something went wrong, please try again!");
    } finally {
      setIsImporting(false);
    }
  };

  const getSuccessfullyParsedMessage = () => {
    return `Successfully parsed ${mocksToImportCount} ${mocksToImportCount === 1 ? "mock" : "mocks"} ${
      collectionsToImportCount > 0
        ? `and ${collectionsToImportCount} ${collectionsToImportCount === 1 ? "collection" : "collections"}.`
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

        {recordsToImport.length === 0 ? (
          <FilePicker
            onFilesDrop={onDrop}
            loaderMessage="Processing rules..."
            isProcessing={processingRecordsToImport}
            title="Drag and drop your rules JSON file"
          />
        ) : recordsToImport.length > 0 ? (
          <>
            {(mocksToImportCount || collectionsToImportCount) && isValidRecords ? (
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
