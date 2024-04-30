import React, { useEffect, useState } from "react";
import { RQMockCollection, RQMockMetadataSchema } from "components/features/mocksV2/types";
import { useMocksModalsContext } from "features/mocks/contexts/modals";
import { UpdateMockCollectionModal } from "./UpdateMockCollectionModal";
import { isRecordMockCollection } from "features/mocks/screens/mocksList/components/MocksList/components/MocksTable/utils";

export const UpdateMockCollectionModalWrapper: React.FC<{ forceRender: () => void; mocks: RQMockMetadataSchema[] }> = ({
  mocks,
  forceRender,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [mock, setMock] = useState<RQMockMetadataSchema>();

  const { setOpenUpdateMockCollectionModalAction } = useMocksModalsContext();

  useEffect(() => {
    const openModal = (record: RQMockMetadataSchema) => {
      setMock(record);
      setIsVisible(true);
    };

    setOpenUpdateMockCollectionModalAction(() => openModal);
  }, [setOpenUpdateMockCollectionModalAction]);

  const onClose = () => {
    setIsVisible(false);
    setMock(undefined);
  };

  const collections = (mocks.filter((mock) => isRecordMockCollection(mock)) as unknown) as RQMockCollection[];

  return isVisible ? (
    <UpdateMockCollectionModal
      mock={mock}
      collections={collections}
      visible={isVisible}
      toggleModalVisibility={onClose}
      onSuccess={forceRender}
    />
  ) : null;
};
