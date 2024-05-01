import React, { useEffect, useState } from "react";
import { RQMockCollection, RQMockMetadataSchema } from "components/features/mocksV2/types";
import { useMocksModalsContext } from "features/mocks/contexts/modals";
import { UpdateMocksCollectionModal } from "./UpdateMocksCollectionModal";
import {
  isRecordMock,
  isRecordMockCollection,
} from "features/mocks/screens/mocksList/components/MocksList/components/MocksTable/utils";

export const UpdateMocksCollectionModalWrapper: React.FC<{
  forceRender: () => void;
  mocks: RQMockMetadataSchema[];
}> = ({ mocks, forceRender }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [mocksToBeUpdated, setMocksToBeUpdated] = useState<RQMockMetadataSchema[]>([]);
  const [onSuccess, setOnSuccess] = useState(() => () => {});

  const { setOpenUpdateMocksCollectionModalAction } = useMocksModalsContext();

  useEffect(() => {
    const openModal = (records: RQMockMetadataSchema[], onSuccess?: () => void) => {
      const mocks = records.filter(isRecordMock);
      setMocksToBeUpdated(mocks);
      setOnSuccess(() => onSuccess);
      setIsVisible(true);
    };

    setOpenUpdateMocksCollectionModalAction(() => openModal);
  }, [setOpenUpdateMocksCollectionModalAction]);

  const onClose = () => {
    setIsVisible(false);
    setMocksToBeUpdated([]);
  };

  const collections = (mocks.filter((mock) => isRecordMockCollection(mock)) as unknown) as RQMockCollection[];

  return isVisible ? (
    <UpdateMocksCollectionModal
      mocks={mocksToBeUpdated}
      collections={collections}
      visible={isVisible}
      toggleModalVisibility={onClose}
      onSuccess={() => {
        forceRender();
        onSuccess();
      }}
    />
  ) : null;
};
